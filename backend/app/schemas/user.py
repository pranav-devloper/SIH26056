from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Minimum 8 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google ID Token / credential from Google OAuth")

class OTPRequest(BaseModel):
    email: EmailStr
    purpose: str = Field(default="EMAIL_VERIFICATION", description="EMAIL_VERIFICATION, LOGIN_OTP, PASSWORD_RESET")

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")
    purpose: str = Field(default="EMAIL_VERIFICATION")

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    email_verified: bool
    auth_provider: str
    is_active: bool
    profile_image: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None
