import pytest
import pytest_asyncio
import httpx
from datetime import datetime, timedelta
from app.main import app
from app.database.session import Base, get_db, SessionLocal, engine
from app.models.user import User, OTPVerification
from app.auth.security import get_password_hash, hash_otp, verify_otp_hash, generate_otp, create_access_token

@pytest_asyncio.fixture
async def client():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

def test_otp_generation_and_hashing():
    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()
    h = hash_otp(otp)
    assert verify_otp_hash(otp, h) is True
    assert verify_otp_hash("000000", h) is False

@pytest.mark.asyncio
async def test_registration_and_email_otp_flow(client: httpx.AsyncClient):
    # 0. Clean up previous test user if exists for idempotency
    db = SessionLocal()
    db.query(OTPVerification).filter(OTPVerification.email == "rohan.sharma@example.com").delete()
    db.query(User).filter(User.email == "rohan.sharma@example.com").delete()
    db.commit()
    db.close()

    # 1. Register new user
    res = await client.post("/api/auth/register", json={
        "name": "Rohan Sharma",
        "email": "rohan.sharma@example.com",
        "password": "Password@123"
    })
    assert res.status_code == 201
    data = res.json()
    assert "verification code" in data["message"].lower()

    # 2. Cannot login before verification
    login_res = await client.post("/api/auth/login", json={
        "email": "rohan.sharma@example.com",
        "password": "Password@123"
    })
    assert login_res.status_code == 403
    assert "not verified" in login_res.json()["detail"].lower()

    # 3. Retrieve generated OTP from DB
    db = SessionLocal()
    otp_record = db.query(OTPVerification).filter(OTPVerification.email == "rohan.sharma@example.com").first()
    assert otp_record is not None
    assert otp_record.is_used is False
    db.close()

    # 4. Verify OTP using incorrect OTP
    bad_verify = await client.post("/api/auth/verify-otp", json={
        "email": "rohan.sharma@example.com",
        "otp": "999999",
        "purpose": "EMAIL_VERIFICATION"
    })
    assert bad_verify.status_code == 400

    # 5. Check attempt limit tracking
    db = SessionLocal()
    otp_record = db.query(OTPVerification).filter(OTPVerification.email == "rohan.sharma@example.com").first()
    assert otp_record.attempt_count == 1
    db.close()

    # Retrieve OTP from dev emails
    dev_res = (await client.get("/api/auth/dev-emails")).json()
    otp_sent = next(e["otp"] for e in dev_res["recent_emails"] if e["email"] == "rohan.sharma@example.com")

    # 6. Submit correct OTP
    good_verify = await client.post("/api/auth/verify-otp", json={
        "email": "rohan.sharma@example.com",
        "otp": otp_sent,
        "purpose": "EMAIL_VERIFICATION"
    })
    assert good_verify.status_code == 200
    token_data = good_verify.json()
    assert "access_token" in token_data
    assert token_data["user"]["email_verified"] is True
    assert token_data["user"]["role"] == "Viewer"  # Default user role

@pytest.mark.asyncio
async def test_google_auth_flow(client: httpx.AsyncClient):
    res = await client.post("/api/auth/google", json={
        "credential": "mock_google_:priya.n@example.com:Priya Nair"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["email"] == "priya.n@example.com"
    assert data["user"]["name"] == "Priya Nair"
    assert data["user"]["auth_provider"] == "google"
    assert data["user"]["email_verified"] is True

@pytest.mark.asyncio
async def test_forgot_password_and_reset_flow(client: httpx.AsyncClient):
    # Request reset OTP
    res = await client.post("/api/auth/forgot-password", json={"email": "rohan.sharma@example.com"})
    assert res.status_code == 200

    dev_res = (await client.get("/api/auth/dev-emails")).json()
    reset_otp = next(e["otp"] for e in dev_res["recent_emails"] if e["email"] == "rohan.sharma@example.com" and e["purpose"] == "PASSWORD_RESET")

    # Reset password
    reset_res = await client.post("/api/auth/reset-password", json={
        "email": "rohan.sharma@example.com",
        "otp": reset_otp,
        "new_password": "NewSecretPassword@456"
    })
    assert reset_res.status_code == 200

    # Login with new password
    login_res = await client.post("/api/auth/login", json={
        "email": "rohan.sharma@example.com",
        "password": "NewSecretPassword@456"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
