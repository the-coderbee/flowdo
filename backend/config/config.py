import os
from pathlib import Path
from dotenv import load_dotenv
import logging
from datetime import timedelta

# Set up directory paths
ROOT_DIR = Path(__file__).parent.parent.absolute()
ENV_PATH = ROOT_DIR / '.env'

# Load environment variables from .env file
load_dotenv(ENV_PATH)

# Create logs directory if it doesn't exist
LOGS_DIR = ROOT_DIR / 'logs'
if not LOGS_DIR.exists():
    LOGS_DIR.mkdir(parents=True)

class Config:
    """Base configuration for the application."""
    
    # Flask settings
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    DEBUG = False
    TESTING = False
    PORT = int(os.environ.get("PORT", 5000))
    
    # Database settings
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "flowdo")
    
    # SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Get the database URI based on config settings."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # JWT settings - Enhanced for better auth handling
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ALGORITHM = "HS256"

    # JWT Token Location and Headers
    JWT_TOKEN_LOCATION = ['cookies']  # Use cookies only for better security
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # JWT Token Expiration - Using timedelta objects for better handling
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 30)))  # 30 minutes
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 30)))   # 30 days
    
    # JWT Cookie Configuration - Critical for proper auth handling
    JWT_COOKIE_SECURE = False  # Will be overridden in production
    JWT_COOKIE_HTTPONLY = True  # Prevent XSS attacks
    JWT_COOKIE_SAMESITE = 'Lax'  # CSRF protection while allowing some cross-site requests
    
    # JWT Cookie Names
    JWT_ACCESS_COOKIE_NAME = 'access_token'
    JWT_REFRESH_COOKIE_NAME = 'refresh_token'
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/'
    
    # CSRF Protection for JWT Cookies
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_ACCESS_CSRF_COOKIE_NAME = 'csrf_access_token'
    JWT_REFRESH_CSRF_COOKIE_NAME = 'csrf_refresh_token'
    JWT_ACCESS_CSRF_COOKIE_PATH = '/'
    JWT_REFRESH_CSRF_COOKIE_PATH = '/'
    
    # JWT Error Handling
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    
    # JWT Additional Settings
    JWT_IDENTITY_CLAIM = 'sub'  # Standard claim for user identity
    JWT_ACCESS_TOKEN_EXPIRES_FRESH = False  # Don't require fresh tokens
    
    # Session Configuration for Remember Me functionality
    # When remember_me is False, we'll use these shorter durations
    JWT_SESSION_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.environ.get("JWT_SESSION_ACCESS_TOKEN_EXPIRES", 30)))  # 30 minutes
    JWT_SESSION_REFRESH_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_SESSION_REFRESH_TOKEN_EXPIRES", 4)))    # 4 hours
    
    # Rate Limiting Configuration (optional, for future implementation)
    RATELIMIT_STORAGE_URL = os.environ.get("RATELIMIT_STORAGE_URL", "memory://")
    
    # CORS settings
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS_SUPPORTS_CREDENTIALS = True  # Required for cookies
    
    # Logging settings
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    LOG_FILE = LOGS_DIR / 'app.log'
    
    # Application root directory
    BASE_DIR = ROOT_DIR
    
    # Auth-specific settings
    AUTH_TOKEN_REFRESH_THRESHOLD = timedelta(minutes=int(os.environ.get("AUTH_TOKEN_REFRESH_THRESHOLD", 5)))  # Refresh when 5 min left
    AUTH_MAX_LOGIN_ATTEMPTS = int(os.environ.get("AUTH_MAX_LOGIN_ATTEMPTS", 5))  # Rate limiting
    AUTH_LOCKOUT_DURATION = timedelta(minutes=int(os.environ.get("AUTH_LOCKOUT_DURATION", 15)))  # Account lockout
    
    # Email settings (for password reset, etc.)
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@flowdo.com")


class DevelopmentConfig(Config):
    """Development configuration."""
    
    DEBUG = True
    LOG_LEVEL = "DEBUG"
    DB_NAME = os.environ.get("DB_NAME", "flowdo_dev")
    
    # Development-specific JWT settings
    JWT_COOKIE_SECURE = False  # Allow non-HTTPS in development
    JWT_COOKIE_SAMESITE = 'Lax'  # Relaxed for development
    
    # More verbose logging for development
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    
    # Development CORS settings
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]


class TestingConfig(Config):
    """Testing configuration."""
    
    TESTING = True
    DEBUG = True
    DB_NAME = os.environ.get("TEST_DB_NAME", "flowdo_test")
    
    # Testing-specific settings
    JWT_COOKIE_SECURE = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=1)  # Short for testing
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=5)  # Short for testing
    
    # Disable CSRF for easier testing
    JWT_COOKIE_CSRF_PROTECT = False
    
    # In-memory rate limiting for tests
    RATELIMIT_STORAGE_URL = "memory://"


class ProductionConfig(Config):
    """Production configuration."""
    
    # In production, all values should come from environment variables
    SECRET_KEY = os.environ.get("SECRET_KEY") or "production-needs-real-secret"
    
    # Database settings (must be set in environment)
    DB_USER = os.environ.get("DB_USER") or "postgres"
    DB_PASSWORD = os.environ.get("DB_PASSWORD") or "postgres"
    DB_HOST = os.environ.get("DB_HOST") or "db"
    DB_PORT = os.environ.get("DB_PORT") or "5432"
    DB_NAME = os.environ.get("DB_NAME") or "flowdo_prod"
    
    # JWT settings for production
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    JWT_COOKIE_SECURE = True  # Always secure in production (HTTPS required)
    JWT_COOKIE_SAMESITE = 'Strict'  # Stricter CSRF protection in production
    
    # Production token expiration (can be longer since we have refresh)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 60)))  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 7)))   # 7 days
    
    # CORS settings in production (should be specific domains)
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "").split(",")
    
    # Production logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "WARNING")
    
    # Production rate limiting (use Redis if available)
    RATELIMIT_STORAGE_URL = os.environ.get("RATELIMIT_STORAGE_URL", "redis://localhost:6379")
    
    # Production auth settings (stricter)
    AUTH_MAX_LOGIN_ATTEMPTS = int(os.environ.get("AUTH_MAX_LOGIN_ATTEMPTS", 3))
    AUTH_LOCKOUT_DURATION = timedelta(minutes=int(os.environ.get("AUTH_LOCKOUT_DURATION", 30)))


# Function to get the appropriate config based on environment
def get_config() -> Config:
    """Return the appropriate configuration object based on the environment."""
    env = os.environ.get("FLASK_ENV", "development").lower()
    
    if env == "production":
        return ProductionConfig()
    elif env == "testing":
        return TestingConfig()
    else:
        return DevelopmentConfig()


# Helper function to configure Flask-JWT-Extended with our settings
def configure_jwt(app, config):
    """Configure Flask-JWT-Extended with the provided config."""
    
    # Basic JWT settings
    app.config['JWT_SECRET_KEY'] = config.JWT_SECRET_KEY
    app.config['JWT_ALGORITHM'] = config.JWT_ALGORITHM
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = config.JWT_REFRESH_TOKEN_EXPIRES
    
    # Token location and format
    app.config['JWT_TOKEN_LOCATION'] = config.JWT_TOKEN_LOCATION
    app.config['JWT_HEADER_NAME'] = config.JWT_HEADER_NAME
    app.config['JWT_HEADER_TYPE'] = config.JWT_HEADER_TYPE
    
    # Cookie settings
    app.config['JWT_COOKIE_SECURE'] = config.JWT_COOKIE_SECURE
    app.config['JWT_COOKIE_HTTPONLY'] = config.JWT_COOKIE_HTTPONLY
    app.config['JWT_COOKIE_SAMESITE'] = config.JWT_COOKIE_SAMESITE
    
    # Cookie names and paths
    app.config['JWT_ACCESS_COOKIE_NAME'] = config.JWT_ACCESS_COOKIE_NAME
    app.config['JWT_REFRESH_COOKIE_NAME'] = config.JWT_REFRESH_COOKIE_NAME
    app.config['JWT_ACCESS_COOKIE_PATH'] = config.JWT_ACCESS_COOKIE_PATH
    app.config['JWT_REFRESH_COOKIE_PATH'] = config.JWT_REFRESH_COOKIE_PATH
    
    # CSRF protection
    app.config['JWT_COOKIE_CSRF_PROTECT'] = config.JWT_COOKIE_CSRF_PROTECT
    app.config['JWT_ACCESS_CSRF_COOKIE_NAME'] = config.JWT_ACCESS_CSRF_COOKIE_NAME
    app.config['JWT_REFRESH_CSRF_COOKIE_NAME'] = config.JWT_REFRESH_CSRF_COOKIE_NAME
    app.config['JWT_ACCESS_CSRF_COOKIE_PATH'] = config.JWT_ACCESS_CSRF_COOKIE_PATH
    app.config['JWT_REFRESH_CSRF_COOKIE_PATH'] = config.JWT_REFRESH_CSRF_COOKIE_PATH
    
    # Blacklist settings
    app.config['JWT_BLACKLIST_ENABLED'] = config.JWT_BLACKLIST_ENABLED
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = config.JWT_BLACKLIST_TOKEN_CHECKS
    
    # Additional settings
    app.config['JWT_IDENTITY_CLAIM'] = config.JWT_IDENTITY_CLAIM
    app.config['JWT_ACCESS_TOKEN_EXPIRES_FRESH'] = config.JWT_ACCESS_TOKEN_EXPIRES_FRESH
    
    return app
