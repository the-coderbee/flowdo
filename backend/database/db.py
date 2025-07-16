"""
Core database setup module following Flask-SQLAlchemy best practices.
"""

from logger import get_logger
import subprocess
from typing import Dict, Any, List
from sqlalchemy import create_engine, inspect, text, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager

from config.config import get_config

# Set up logging
logger = get_logger(__name__)

# Get config
config = get_config()


# Create engine with optimized settings
def create_db_engine():
    """Create SQLAlchemy engine with proper configuration"""
    logger.info(
        f"Creating database engine with URL: {config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}"
    )

    engine_args: Dict[str, Any] = {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "echo": False,
        "echo_pool": config.DEBUG,  # Enable pool logging in debug mode
        "poolclass": QueuePool,
        "pool_size": 10,  # Increased from 5
        "max_overflow": 15,  # Increased from 10
        "pool_timeout": 20,  # Reduced from 30
        "connect_args": {"connect_timeout": 10},
    }

    engine = create_engine(config.SQLALCHEMY_DATABASE_URI, **engine_args)

    # Set PostgreSQL-specific settings
    @event.listens_for(engine, "connect")
    def set_pg_session_params(dbapi_connection, connection_record):
        """Set PostgreSQL session parameters on connection."""
        cursor = dbapi_connection.cursor()
        cursor.execute("SET timezone='UTC';")
        cursor.close()

    # Add connection pool monitoring
    @event.listens_for(engine, "connect")
    def log_connection_created(dbapi_connection, connection_record):
        """Log when a new connection is created."""
        logger.info(f"Connection created: {id(dbapi_connection)}")

    @event.listens_for(engine, "checkout")
    def log_connection_checkout(dbapi_connection, connection_record, connection_proxy):
        """Log when a connection is checked out from the pool."""
        logger.debug(f"Connection checkout: {id(dbapi_connection)}")

    @event.listens_for(engine, "checkin")
    def log_connection_checkin(dbapi_connection, connection_record):
        """Log when a connection is checked back into the pool."""
        logger.debug(f"Connection checkin: {id(dbapi_connection)}")

    @event.listens_for(engine, "close")
    def log_connection_close(dbapi_connection, connection_record):
        """Log when a connection is closed."""
        logger.info(f"Connection closed: {id(dbapi_connection)}")

    @event.listens_for(engine, "invalidate")
    def log_connection_invalidate(dbapi_connection, connection_record, exception):
        """Log when a connection is invalidated."""
        logger.warning(
            f"Connection invalidated: {id(dbapi_connection)} | Exception: {exception}"
        )

    return engine


# Create engine
engine = create_db_engine()

# Create session factory
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base model class
Base = declarative_base()


@contextmanager
def get_db_session():
    """
    Get a fresh database session for dependency injection.

    This is the primary way to get database sessions.
    Each request should use this to get a fresh session.

    Usage:
        with get_db_session() as session:
            service = SomeService(session)
            # ... use service
    """
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Initialize the database."""
    from database.models.base import BaseModel

    # Import all models here
    import database.models.user
    import database.models.task
    import database.models.group
    import database.models.pomodoro_session
    import database.models.subtask
    import database.models.tag
    import database.models.tasktag
    import database.models.user_token

    # Create tables
    Base.metadata.create_all(bind=engine)


def check_db_connection():
    """Check if database connection is working."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False


def get_pool_status():
    """Get current connection pool status."""
    try:
        pool = engine.pool

        # Safely get pool metrics with hasattr checks
        size = getattr(pool, "size", lambda: 0)() if hasattr(pool, "size") else 0
        checked_out = (
            getattr(pool, "checkedout", lambda: 0)()
            if hasattr(pool, "checkedout")
            else 0
        )
        overflow = (
            getattr(pool, "overflow", lambda: 0)() if hasattr(pool, "overflow") else 0
        )

        return {
            "size": size,
            "checked_out": checked_out,
            "overflow": overflow,
            "total_connections": size + overflow,
            "available_connections": max(0, size - checked_out),
            "pool_limit_reached": (
                checked_out >= (size + overflow) if size > 0 else False
            ),
        }
    except Exception as e:
        logger.error(f"Failed to get pool status: {str(e)}")
        return {
            "size": 0,
            "checked_out": 0,
            "overflow": 0,
            "total_connections": 0,
            "available_connections": 0,
            "pool_limit_reached": False,
            "error": str(e),
        }


def get_table_names() -> List[str]:
    """Get a list of all tables in the database."""
    inspector = inspect(engine)
    return inspector.get_table_names()


def setup_alembic_version():
    """
    Set up the alembic_version table for an existing database.
    This helps when tables already exist but alembic_version doesn't.
    """
    try:
        # Check if tables exist but alembic_version doesn't
        tables = get_table_names()
        if tables and "alembic_version" not in tables:
            logger.info(
                "Tables exist but no alembic_version table found. Setting up migration tracking."
            )

            # Get the latest migration version
            try:
                result = subprocess.run(
                    ["alembic", "heads"], capture_output=True, text=True, check=True
                )
                if result.stdout:
                    # Extract version from output
                    version_line = [
                        line for line in result.stdout.split("\n") if line.strip()
                    ]
                    if version_line:
                        version = version_line[0].split(" ")[0].strip()

                        # Create alembic_version table manually
                        with engine.connect() as conn:
                            conn.execute(
                                text(
                                    "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) PRIMARY KEY);"
                                )
                            )
                            conn.execute(
                                text(
                                    f"INSERT INTO alembic_version (version_num) VALUES ('{version}');"
                                )
                            )
                            conn.commit()

                        logger.info(
                            f"Created alembic_version table with version: {version}"
                        )
                        return True
            except Exception as e:
                logger.error(f"Failed to set up alembic_version table: {str(e)}")

        return False
    except Exception as e:
        logger.error(f"Error in setup_alembic_version: {str(e)}")
        return False


def init_app(app):
    """Initialize the Flask app with the database."""

    @app.before_request
    def log_pool_status():
        """Log pool status before each request in debug mode."""
        if app.config.get("DEBUG", False):
            pool_info = get_pool_status()
            if pool_info and pool_info["checked_out"] > pool_info["size"] * 0.7:
                logger.warning(f"High pool utilization detected: {pool_info}")

    @app.teardown_appcontext
    def monitor_pool_status(exception=None):
        """Monitor pool status after each request."""
        try:
            # Log pool status periodically in debug mode
            if app.config.get("DEBUG", False):
                pool_info = get_pool_status()
                if pool_info and pool_info["checked_out"] > 0:
                    logger.debug(f"Request completed. Pool status: {pool_info}")

            # Log any exceptions that occurred
            if exception:
                logger.error(f"Request ended with exception: {exception}")

        except Exception as e:
            logger.error(f"Error during request teardown: {str(e)}")

    # Initialize database
    if not check_db_connection():
        logger.error("Database connection failed")
        raise RuntimeError("Database connection failed")

    # Check and setup alembic version if needed
    setup_alembic_version()

    return True
