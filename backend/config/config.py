import os
from pathlib import Path
from dotenv import load_dotenv
import logging

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
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 15))  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 30 * 24 * 60))  # 30 days in minutes
    JWT_ALGORITHM = "HS256"
    JWT_TOKEN_LOCATION = ['cookies', 'headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_COOKIE_SECURE = os.environ.get("JWT_COOKIE_SECURE", "False").lower() == "true"
    JWT_COOKIE_SAMESITE = 'Strict'
    JWT_ACCESS_COOKIE_NAME = 'access_token'
    JWT_REFRESH_COOKIE_NAME = 'refresh_token'
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_CSRF_IN_COOKIES = True
    
    # CORS settings
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    
    # Logging settings
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    LOG_FILE = LOGS_DIR / 'app.log'
    
    # Application root directory
    BASE_DIR = ROOT_DIR


class DevelopmentConfig(Config):
    """Development configuration."""
    
    DEBUG = True
    LOG_LEVEL = "DEBUG"
    DB_NAME = os.environ.get("DB_NAME", "flowdo_dev")


class TestingConfig(Config):
    """Testing configuration."""
    
    TESTING = True
    DEBUG = True
    DB_NAME = os.environ.get("TEST_DB_NAME", "flowdo_test")


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
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    JWT_COOKIE_SECURE = True  # Always secure in production
    
    # CORS settings in production
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "").split(",")
    
    # Logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "WARNING")


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