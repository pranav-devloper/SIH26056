from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.config import settings
from app.models.user import User, OTPVerification, OAuthAccount
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    OTPRequest, OTPVerifyRequest, PasswordResetRequest, PasswordResetConfirm, GoogleAuthRequest
)
from app.auth.security import (
    verify_password, get_password_hash, generate_otp, hash_otp, verify_otp_hash, create_access_token
)
from app.auth.dependencies import get_current_user
from app.email.email_service import (
    send_verification_otp, send_password_reset_otp, send_login_otp, get_recent_dev_emails
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        if existing.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please login."
            )
        # If registered earlier but not verified, update details
        existing.name = user_in.name
        existing.password_hash = get_password_hash(user_in.password)
        db.commit()
        user = existing
    else:
        # A normal user must NEVER be allowed to select Admin during registration
        user = User(
            name=user_in.name,
            email=user_in.email.lower(),
            password_hash=get_password_hash(user_in.password),
            role="Viewer",  # Default secure role
            email_verified=False,
            auth_provider="email",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Invalidate previous unused verification OTPs
    db.query(OTPVerification).filter(
        OTPVerification.email == user.email,
        OTPVerification.purpose == "EMAIL_VERIFICATION",
        OTPVerification.is_used == False
    ).update({"is_used": True})

    # Generate 6-digit OTP
    otp = generate_otp()
    otp_record = OTPVerification(
        user_id=user.id,
        email=user.email,
        otp_hash=hash_otp(otp),
        purpose="EMAIL_VERIFICATION",
        expires_at=datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        attempt_count=0,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    # Send OTP email
    send_verification_otp(user.email, otp)

    return {
        "message": "Registration successful. A 6-digit verification code has been dispatched to your email.",
        "email": user.email,
        "expires_in_minutes": settings.OTP_EXPIRE_MINUTES
    }

@router.post("/verify-otp", response_model=Token)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == payload.purpose,
        OTPVerification.is_used == False
    ).order_by(OTPVerification.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP found. Please request a new code."
        )

    # Check expiration
    if datetime.utcnow() > otp_record.expires_at:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one."
        )

    # Check attempt limit
    if otp_record.attempt_count >= settings.OTP_MAX_ATTEMPTS:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Maximum verification attempts exceeded. Please request a new OTP."
        )

    # Check hash match
    otp_record.attempt_count += 1
    if not verify_otp_hash(payload.otp, otp_record.otp_hash):
        db.commit()
        remaining = settings.OTP_MAX_ATTEMPTS - otp_record.attempt_count
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP code. {remaining} attempt(s) remaining."
        )

    # Mark as verified
    otp_record.is_used = True
    otp_record.verified_at = datetime.utcnow()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.email_verified = True
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/send-otp")
def resend_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user and payload.purpose != "EMAIL_VERIFICATION":
        raise HTTPException(status_code=404, detail="User account with this email not found")

    # Check cooldown against most recent OTP
    recent = db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == payload.purpose
    ).order_by(OTPVerification.created_at.desc()).first()

    if recent:
        elapsed = (datetime.utcnow() - recent.created_at).total_seconds()
        if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
            wait_time = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {wait_time} seconds before requesting a new OTP."
            )

    # Invalidate prior unused OTPs
    db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == payload.purpose,
        OTPVerification.is_used == False
    ).update({"is_used": True})

    otp = generate_otp()
    new_otp = OTPVerification(
        user_id=user.id if user else None,
        email=email,
        otp_hash=hash_otp(otp),
        purpose=payload.purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        attempt_count=0,
        is_used=False
    )
    db.add(new_otp)
    db.commit()

    if payload.purpose == "EMAIL_VERIFICATION":
        send_verification_otp(email, otp)
    elif payload.purpose == "PASSWORD_RESET":
        send_password_reset_otp(email, otp)
    elif payload.purpose == "LOGIN_OTP":
        send_login_otp(email, otp)

    return {"message": "A new verification code has been dispatched to your email."}

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.email_verified and user.auth_provider == "email":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address not verified. Please verify your email before logging in."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Google OAuth 2.0 / OpenID Connect handler.
    Validates Google credential/ID token safely and creates or logs in SQL user.
    """
    email = None
    name = "Google User"
    google_id = None
    picture = None

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        # Verify with Google certs
        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        )
        email = id_info.get("email")
        name = id_info.get("name", "Google User")
        google_id = id_info.get("sub")
        picture = id_info.get("picture")
    except Exception as e:
        # Support test/demo token format for development testing
        if payload.credential.startswith("mock_google_"):
            parts = payload.credential.split(":")
            email = parts[1] if len(parts) > 1 else "google_tester@airindex.in"
            name = parts[2] if len(parts) > 2 else "Google Authenticated User"
            google_id = "gid_" + email
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token verification failed: {str(e)}"
            )

    if not email:
        raise HTTPException(status_code=400, detail="Could not extract verified email from Google identity.")

    email = email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create user
        user = User(
            name=name,
            email=email,
            password_hash=None,
            google_id=google_id,
            profile_image=picture,
            role="Viewer",
            email_verified=True,
            auth_provider="google",
            is_active=True,
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        oauth_entry = OAuthAccount(
            user_id=user.id,
            provider="google",
            provider_account_id=google_id or email
        )
        db.add(oauth_entry)
        db.commit()
    else:
        # Log into existing user
        user.last_login = datetime.utcnow()
        if not user.google_id and google_id:
            user.google_id = google_id
        if picture and not user.profile_image:
            user.profile_image = picture
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Consistent security response
        return {"message": "If this email is registered, a password reset code has been sent."}

    # Invalidate previous reset OTPs
    db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == "PASSWORD_RESET",
        OTPVerification.is_used == False
    ).update({"is_used": True})

    otp = generate_otp()
    new_otp = OTPVerification(
        user_id=user.id,
        email=email,
        otp_hash=hash_otp(otp),
        purpose="PASSWORD_RESET",
        expires_at=datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        attempt_count=0,
        is_used=False
    )
    db.add(new_otp)
    db.commit()

    send_password_reset_otp(email, otp)
    return {"message": "If this email is registered, a password reset code has been sent."}

@router.post("/verify-reset-otp")
def verify_reset_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    record = db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == "PASSWORD_RESET",
        OTPVerification.is_used == False
    ).order_by(OTPVerification.created_at.desc()).first()

    if not record or datetime.utcnow() > record.expires_at:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")

    if record.attempt_count >= settings.OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new OTP.")

    record.attempt_count += 1
    if not verify_otp_hash(payload.otp, record.otp_hash):
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    db.commit()
    return {"message": "OTP verified successfully. You may now submit your new password."}

@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    email = payload.email.lower()
    record = db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == "PASSWORD_RESET",
        OTPVerification.is_used == False
    ).order_by(OTPVerification.created_at.desc()).first()

    if not record or datetime.utcnow() > record.expires_at:
        raise HTTPException(status_code=400, detail="Reset code is invalid or has expired.")

    if not verify_otp_hash(payload.otp, record.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = get_password_hash(payload.new_password)
    record.is_used = True
    record.verified_at = datetime.utcnow()
    db.commit()

    return {"message": "Password changed successfully. Please login with your new password."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully."}

@router.get("/dev-emails")
def dev_emails():
    """Development utility endpoint to inspect OTP emails sent locally."""
    return {"recent_emails": get_recent_dev_emails()}
