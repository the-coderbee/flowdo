#!/usr/bin/env python
"""
Database Initialization Script

This script creates all tables in the database based on SQLAlchemy models.
Run this script when setting up a new database or after schema changes.
"""
import logging
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.exc import SQLAlchemyError

from database.db import engine, Base
from database.models import *  # Import all models to ensure they're registered with Base
from config.config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database."""
    config = get_config()
    db_url = config.SQLALCHEMY_DATABASE_URI
    
    logger.info(f"Initializing database: {db_url}")
    
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        logger.info(f"Database {engine.url.database} does not exist. Creating...")
        create_database(engine.url)
        logger.info(f"Database {engine.url.database} created.")
    
    try:
        # Create tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
        
        return True
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {e}")
        return False

if __name__ == "__main__":
    success = init_db()
    if success:
        logger.info("Database initialization completed successfully.")
    else:
        logger.error("Database initialization failed.") 