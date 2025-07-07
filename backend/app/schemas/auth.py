"""
Authentication schemas for request and response validation.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
import re


class UserRegisterRequest(BaseModel):
    """Schema for user registration request."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: str = Field(..., min_length=1, max_length=30)
    remember_me: bool = False
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength."""
        return v


class UserLoginRequest(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

    model_config = {
        "from_attributes": True
    }


class UserResponse(BaseModel):
    """Schema for user response."""
    email: str
    display_name: str
    id: int
    
    model_config = {
        "from_attributes": True
    }


class AuthResponse(BaseModel):
    """Schema for authentication response."""
    user: UserResponse
    token: TokenResponse


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    """Schema for password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[0-9]', v):
            raise ValueError("Password must contain at least one number")
        return v


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str 