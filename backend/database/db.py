"""
Core database setup module following Flask-SQLAlchemy best practices.
"""
import logging
import subprocess
from typing import Dict, Any, List
from sqlalchemy import create_engine, inspect, text, event
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager

from config.config import get_config

# Set up logging
logger = logging.getLogger(__name__)

# Get config
config = get_config()

# Create engine with optimized settings
def create_db_engine():
    """Create SQLAlchemy engine with proper configuration"""
    logger.info(f"Creating database engine with URL: {config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}")
    
    engine_args: Dict[str, Any] = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
        'echo': False,
        'echo_pool': False,
        'poolclass': QueuePool,
        'pool_size': 5,
        'max_overflow': 10,
        'connect_args': {
            'connect_timeout': 10
        }
    }
    
    engine = create_engine(config.SQLALCHEMY_DATABASE_URI, **engine_args)
    
    # Set PostgreSQL-specific settings
    @event.listens_for(engine, "connect")
    def set_pg_session_params(dbapi_connection, connection_record):
        """Set PostgreSQL session parameters on connection."""
        cursor = dbapi_connection.cursor()
        cursor.execute("SET timezone='UTC';")
        cursor.close()
    
    return engine

# Create engine
engine = create_db_engine()

# Create session factory
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(Session)

# Create base model class
Base = declarative_base()
Base.query = db_session.query_property()

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
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
    import backend.database.models.task
    import database.models.group
    import backend.database.models.pomodoro_session
    import backend.database.models.subtask
    import backend.database.models.tag
    import backend.database.models.tasktag
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
        if tables and 'alembic_version' not in tables:
            logger.info("Tables exist but no alembic_version table found. Setting up migration tracking.")
            
            # Get the latest migration version
            try:
                result = subprocess.run(
                    ['alembic', 'heads'], 
                    capture_output=True, 
                    text=True, 
                    check=True
                )
                if result.stdout:
                    # Extract version from output
                    version_line = [line for line in result.stdout.split('\n') if line.strip()]
                    if version_line:
                        version = version_line[0].split(' ')[0].strip()
                        
                        # Create alembic_version table manually
                        with engine.connect() as conn:
                            conn.execute(text(
                                "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) PRIMARY KEY);"
                            ))
                            conn.execute(text(
                                f"INSERT INTO alembic_version (version_num) VALUES ('{version}');"
                            ))
                            conn.commit()
                            
                        logger.info(f"Created alembic_version table with version: {version}")
                        return True
            except Exception as e:
                logger.error(f"Failed to set up alembic_version table: {str(e)}")
                
        return False
    except Exception as e:
        logger.error(f"Error in setup_alembic_version: {str(e)}")
        return False

def init_app(app):
    """Initialize the Flask app with the database."""
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()
        
    # Initialize database
    if not check_db_connection():
        logger.error("Database connection failed")
        raise RuntimeError("Database connection failed")
    
    # Check and setup alembic version if needed
    setup_alembic_version()
    
    return True 