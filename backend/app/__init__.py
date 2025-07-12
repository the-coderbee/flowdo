# app/__init__.py - Updated app factory to work with the new run.py

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from logger import get_logger

# Get logger for this module
logger = get_logger(__name__)


def create_app():
    """
    Application factory for creating Flask app.

    The configuration will be loaded by run.py using app.config.from_object(config).
    This allows for better separation of concerns and easier testing.
    """

    # Create Flask application
    app = Flask(__name__)

    logger.info("Creating Flask application...")

    # The configuration will be loaded by run.py, so we don't load it here
    # This allows for more flexible configuration management

    return app


def initialize_extensions(app):
    """
    Initialize Flask extensions after configuration is loaded.

    This function should be called by run.py after loading configuration.
    """

    logger.info("Initializing Flask extensions...")

    # Initialize JWT Manager
    jwt = JWTManager(app)
    logger.info("JWT Manager initialized")

    # Configure CORS
    cors_origins = app.config.get("CORS_ORIGINS", ["http://localhost:3000"])
    CORS(
        app,
        origins=cors_origins,
        supports_credentials=True,  # Required for cookies
        allow_headers=["Content-Type", "Authorization", "X-CSRF-TOKEN"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    )
    logger.info(f"CORS initialized with origins: {cors_origins}")

    # Set up JWT error handlers
    setup_jwt_handlers(jwt)
    logger.info("JWT error handlers configured")

    # Register blueprints
    register_blueprints(app)
    logger.info("Blueprints registered")

    # Set up database
    setup_database(app)
    logger.info("Database initialized")

    return app


def setup_jwt_handlers(jwt):
    """Set up JWT error handlers and callbacks."""

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Handle expired tokens."""
        logger.warning(f"Expired token accessed: {jwt_payload.get('sub', 'unknown')}")
        return {"error": "Token has expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """Handle invalid tokens."""
        logger.warning(f"Invalid token: {error}")
        return {"error": "Invalid token"}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        """Handle missing tokens."""
        logger.debug(f"Missing token: {error}")
        return {"error": "Authentication required"}, 401

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        """Check if token has been revoked."""
        try:
            from database.models.user_token import UserToken
            from database.db import db_session

            jti = jwt_payload["jti"]

            # Query directly using the scoped session - no repository needed for simple check
            user_token = (
                db_session.query(UserToken).filter(UserToken.jti == jti).first()
            )
            is_revoked = bool(user_token and getattr(user_token, "revoked", False))

            if is_revoked:
                logger.info(f"Revoked token attempted access: {jti[:8]}...")

            return is_revoked
        except Exception as e:
            logger.error(f"Error checking token revocation: {e}")
            # On error, assume token is valid to avoid blocking legitimate users
            return False

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        """Handle revoked tokens."""
        logger.warning(f"Revoked token accessed: {jwt_payload.get('sub', 'unknown')}")
        return {"error": "Token has been revoked"}, 401


def register_blueprints(app):
    """Register all application blueprints."""

    try:
        # Import and register auth blueprint
        from app.routers.auth import auth_bp

        app.register_blueprint(auth_bp)
        logger.info("Auth blueprint registered")

        # Import and register task blueprint
        from app.routers.task import task_bp

        app.register_blueprint(task_bp)
        logger.info("Task blueprint registered")

        # Import and register dashboard blueprint
        from app.routers.dashboard import dashboard_bp

        app.register_blueprint(dashboard_bp)
        logger.info("Dashboard blueprint registered")

        # Import and register group blueprint
        from app.routers.group import group_bp

        app.register_blueprint(group_bp)
        logger.info("Group blueprint registered")

        # Import and register tag blueprint
        from app.routers.tag import tag_bp

        app.register_blueprint(tag_bp)
        logger.info("Tag blueprint registered")

        # Import and register health blueprint
        from app.routers.health import health_bp

        app.register_blueprint(health_bp)
        logger.info("Health blueprint registered")

        # Import and register subtask blueprint
        from app.routers.subtask import subtask_bp

        app.register_blueprint(subtask_bp)
        logger.info("Subtask blueprint registered")

    except ImportError as e:
        logger.error(f"Failed to import blueprint: {e}")
        raise
    except Exception as e:
        logger.error(f"Failed to register blueprints: {e}")
        raise


def create_test_app(config=None):
    """
    Create application instance for testing.

    Args:
        config: Configuration object or dictionary for testing

    Returns:
        Flask application configured for testing
    """

    app = Flask(__name__)

    # Load test configuration
    if config:
        if hasattr(config, "__dict__"):
            # Config object
            app.config.from_object(config)
        else:
            # Config dictionary
            app.config.update(config)
    else:
        # Use testing config
        from config.config import TestingConfig

        app.config.from_object(TestingConfig())

    # Initialize with testing-specific settings
    initialize_extensions(app)

    return app


# Health check endpoint
def register_health_check(app):
    """Register health check endpoint."""

    @app.route("/health")
    def health_check():
        """Simple health check endpoint."""
        try:
            # You can add more sophisticated health checks here
            # e.g., database connectivity, external service availability

            return {
                "status": "healthy",
                "environment": app.config.get("FLASK_ENV", "unknown"),
                "debug": app.config.get("DEBUG", False),
            }, 200

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}, 500


# app/__init__.py - Improved database setup that doesn't conflict with setup.py


def setup_database(app):
    """
    Initialize database connection and handle development auto-setup.

    This function is smart about when to create tables vs when to defer to migrations.
    """
    try:
        from database.db import init_db, check_db_connection, get_table_names

        # Always check connection first
        if not check_db_connection():
            logger.error("Database connection failed")
            # In production, this should fail fast
            # In development, we can be more forgiving
            env = app.config.get("ENV", "development")
            if env == "production":
                raise RuntimeError("Database connection failed in production")
            else:
                logger.warning("Database connection failed - app may not work properly")
                return False

        logger.info("Database connection established")

        # Check what kind of database we have
        with app.app_context():
            tables = get_table_names()
            has_alembic = "alembic_version" in tables
            has_tables = len(tables) > 0

            if not has_tables:
                # Fresh database - create tables for development convenience
                logger.info("Fresh database detected - creating initial tables")
                init_db()
                logger.info(
                    "Initial tables created (run 'python setup.py' for full setup)"
                )

            elif has_tables and not has_alembic:
                # Tables exist but no migration tracking
                logger.warning("Database has tables but no migration tracking")
                logger.warning(
                    "Run 'python setup.py' to set up proper migration tracking"
                )

            elif has_alembic:
                # Proper database with migrations
                logger.info("Database with migration tracking detected")

                # Optional: Check if migrations are up to date
                # (This is just informational, don't auto-migrate)
                try:
                    import subprocess

                    result = subprocess.run(
                        ["alembic", "current"],
                        capture_output=True,
                        text=True,
                        timeout=5,
                    )
                    if result.returncode == 0 and result.stdout:
                        logger.info(f"Current migration: {result.stdout.strip()}")
                    else:
                        logger.info("Could not determine current migration status")
                except (subprocess.TimeoutExpired, FileNotFoundError):
                    logger.debug("Alembic not available for migration status check")

            else:
                # Edge case
                logger.info(
                    "Database state unclear - tables exist but migration status unknown"
                )

        return True

    except Exception as e:
        logger.error(f"Database setup failed: {e}")

        # In development, continue anyway
        env = app.config.get("ENV", "development")
        if env != "production":
            logger.warning(
                "Continuing despite database setup failure (development mode)"
            )
            return False
        else:
            # In production, fail fast
            raise


def create_full_app():
    """Create and fully initialize the application."""
    from config.config import get_config, configure_jwt

    # Create basic app
    app = create_app()

    # Load configuration
    config = get_config()
    app.config.from_object(config)

    # Configure JWT
    app = configure_jwt(app, config)

    # Initialize extensions and database
    app = initialize_extensions(app)

    # Register health check
    register_health_check(app)

    # Add helpful startup info
    env = app.config.get("ENV", "development")
    if env == "development":
        logger.info("=" * 50)
        logger.info("🚀 FlowDo Development Server")
        logger.info("=" * 50)
        logger.info("📋 Quick Setup Commands:")
        logger.info("   Initial setup: python setup.py")
        logger.info(
            "   Create migration: alembic revision --autogenerate -m 'description'"
        )
        logger.info("   Run migration: alembic upgrade head")
        logger.info("   Health check: curl http://localhost:5000/health")
        logger.info("=" * 50)

    logger.info("Application fully initialized and ready")
    return app
