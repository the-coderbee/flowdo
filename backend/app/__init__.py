from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from typing import Optional, Dict, Any

from config import get_config
from logger import get_logger
from database.db import init_app, Base, engine
from app.utils.json_provider import AlchemyJSONProvider

logger = get_logger(__name__)

def create_app(config_override: Optional[Dict[str, Any]] = None) -> Flask:
    """
    Application factory function that creates and configures the Flask app.
    
    Args:
        config_override: Optional dict with configuration values to override.
        
    Returns:
        Flask application instance
    """
    logger.info("Creating Flask application...")
    app = Flask(__name__)
    app.json = AlchemyJSONProvider(app) # TODO: this is not working right now needs to be fixed
    # Load config
    config = get_config()
    app.config.from_object(config)
    
    # Override config if provided
    if config_override:
        app.config.update(config_override)
    
    # Initialize extensions
    jwt = JWTManager(app)
    
    # Set up CORS
    logger.info("Configuring CORS...")
    cors_origins = app.config.get("CORS_ORIGINS", ["http://localhost:3000"])
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})
    
    # Initialize migrations
    migrate = Migrate(app, Base)
    
    # Register blueprints
    logger.info("Registering blueprints...")
    from app.routers import auth_bp, task_bp, health_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(health_bp)
    
    # Initialize the database
    try:
        logger.info("Initializing database...")
        init_app(app)
        logger.info("Database initialization successful")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        if not app.debug:
            raise
    
    return app
