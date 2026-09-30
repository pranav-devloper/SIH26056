import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Any
try:
    import jwt
except ImportError:
    from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def hash_otp(otp: str) -> str:
    # Use SHA-256 for fast, constant-time verification of short lived OTPs
    return hashlib.sha256(f"{otp}_{settings.JWT_SECRET_KEY}".encode()).hexdigest()

def verify_otp_hash(plain_otp: str, hashed: str) -> bool:
    expected = hash_otp(plain_otp)
    return secrets.compare_digest(expected, hashed)

def generate_otp() -> str:
    # 6-digit cryptographically secure random number
    return f"{secrets.randbelow(900000) + 100000}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None
