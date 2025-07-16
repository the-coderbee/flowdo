#!/usr/bin/env python
"""
FlowDo Application Entry Point

This module serves as the main entry point for the FlowDo Flask application.
It handles configuration loading, application creation, and server startup.
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path for imports
ROOT_DIR = Path(__file__).parent.absolute()
sys.path.insert(0, str(ROOT_DIR))

from app import create_app
from config.config import configure_jwt, get_config
from logger import get_logger

# Get logger
logger = get_logger(__name__)


def main():
    """Main application entry point."""
    try:
        # Create fully configured application
        from app import create_full_app
        app = create_full_app()
        
        # Get configuration for logging and server setup
        config = get_config()
        
        # Log application info
        env = os.environ.get('FLASK_ENV', 'development')
        logger.info(f"Loaded configuration: {config.__class__.__name__}")
        logger.info(f"Environment: {env}")
        logger.info(f"Debug mode: {config.DEBUG}")
        logger.info(f"Database: {config.SQLALCHEMY_DATABASE_URI}")
        logger.info(f"JWT Access Token Expires: {config.JWT_ACCESS_TOKEN_EXPIRES}")
        logger.info(f"JWT Refresh Token Expires: {config.JWT_REFRESH_TOKEN_EXPIRES}")
        
        # Get host and port
        host = os.environ.get('HOST', '0.0.0.0')
        port = int(os.environ.get('PORT', config.PORT))
        
        logger.info(f"Starting FlowDo application on {host}:{port}")
        
        # Production warning
        if env == 'production':
            logger.warning("Running with Flask development server in production is not recommended!")
            logger.warning("Consider using Gunicorn: gunicorn --bind 0.0.0.0:5000 run:app")
        
        # Start the Flask development server
        app.run(
            host=host, 
            port=port, 
            debug=config.DEBUG,
            threaded=True,  # Enable threading for better performance
            use_reloader=config.DEBUG  # Only use reloader in debug mode
        )
        
    except KeyboardInterrupt:
        logger.info("Application shutdown requested by user")
        sys.exit(0)
    except ImportError as e:
        from logger import log_import_error
        log_import_error(e, "application dependencies")
        logger.error(f"Import error: {e}")
        logger.error("Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to start application: {e}", exc_info=True)
        sys.exit(1)


def create_wsgi_app():
    """
    Create WSGI application for production deployment.
    
    This function is used by WSGI servers like Gunicorn.
    Usage: gunicorn --bind 0.0.0.0:5000 run:create_wsgi_app
    """
    try:
        config = get_config()
        app = create_app()
        app.config.from_object(config)
        app = configure_jwt(app, config)
        
        logger.info(f"WSGI application created with {config.__class__.__name__}")
        return app
    except Exception as e:
        logger.error(f"Failed to create WSGI application: {e}", exc_info=True)
        raise


def check_environment():
    """Check if the environment is properly configured."""
    logger.info("Checking environment configuration...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        return False
    
    # Check required environment variables
    required_env_vars = ['SECRET_KEY']
    missing_vars = []
    
    for var in required_env_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
        logger.warning("The application will use default values, which may not be secure for production")
    
    # Check database connection (basic check)
    try:
        config = get_config()
        if not config.SQLALCHEMY_DATABASE_URI:
            logger.error("Database URI is not configured")
            return False
        logger.info("Database configuration looks good")
    except Exception as e:
        logger.error(f"Database configuration error: {e}")
        return False
    
    logger.info("Environment check completed")
    return True


def print_banner():
    """Print application banner."""
    banner = """
    ███████╗██╗      ██████╗ ██╗    ██╗██████╗  ██████╗ 
    ██╔════╝██║     ██╔═══██╗██║    ██║██╔══██╗██╔═══██╗
    █████╗  ██║     ██║   ██║██║ █╗ ██║██║  ██║██║   ██║
    ██╔══╝  ██║     ██║   ██║██║███╗██║██║  ██║██║   ██║
    ██║     ███████╗╚██████╔╝╚███╔███╔╝██████╔╝╚██████╔╝
    ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝  ╚═════╝ 
    
    Task Management with Pomodoro Technique
    """
    print(banner)


# For WSGI deployment (e.g., with Gunicorn)
app = create_wsgi_app()

if __name__ == "__main__":
    # Print banner
    print_banner()
    
    # Check environment
    if not check_environment():
        logger.error("Environment check failed. Please fix the issues and try again.")
        sys.exit(1)
    
    # Run the application
    main()