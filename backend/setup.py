#!/usr/bin/env python
"""
FlowDo Database Setup Script

This script initializes the database and runs migrations.
It's intended to be run once when setting up the application.
"""
import os
import subprocess
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.absolute()))

from logger import get_logger
from config.config import get_config
from database.db import check_db_connection, setup_alembic_version, get_table_names

logger = get_logger(__name__)
config = get_config()

def check_postgresql():
    """Check if PostgreSQL is installed and running."""
    try:
        result = subprocess.run(
            ["psql", "--version"],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode != 0:
            logger.error("PostgreSQL is not installed or not in PATH")
            return False
        
        logger.info(f"PostgreSQL version: {result.stdout.strip()}")
        return True
    except Exception as e:
        logger.error(f"Failed to check PostgreSQL: {e}")
        return False

def create_database():
    """Create the database if it doesn't exist."""
    try:
        # Check if database exists
        result = subprocess.run(
            ["psql", "-U", config.DB_USER, "-lqt"],
            capture_output=True,
            text=True,
            check=True,
            env={**os.environ, "PGPASSWORD": config.DB_PASSWORD}
        )
        
        databases = [line.split("|")[0].strip() for line in result.stdout.splitlines()]
        
        if config.DB_NAME in databases:
            logger.info(f"Database '{config.DB_NAME}' already exists")
            return True
        
        # Create database
        subprocess.run(
            ["createdb", "-U", config.DB_USER, config.DB_NAME],
            check=True,
            env={**os.environ, "PGPASSWORD": config.DB_PASSWORD}
        )
        
        logger.info(f"Created database '{config.DB_NAME}'")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to create database: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Failed to create database: {e}")
        return False

def run_migrations():
    """Run database migrations."""
    try:
        # Check if tables already exist but alembic_version doesn't
        tables = get_table_names()
        if tables and 'alembic_version' not in tables:
            logger.info("Tables exist but no alembic_version table. Setting up Alembic tracking.")
            setup_alembic_version()
        
        # Run migrations
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=True
        )
        
        logger.info("Migrations completed successfully")
        logger.info(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Migration failed: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

def main():
    """Main function to set up the database."""
    logger.info("Starting database setup")
    
    # Check PostgreSQL
    if not check_postgresql():
        logger.error("PostgreSQL check failed")
        return False
    
    # Create database
    if not create_database():
        logger.error("Database creation failed")
        return False
    
    # Check database connection
    if not check_db_connection():
        logger.error("Database connection check failed")
        return False
    
    # Run migrations
    if not run_migrations():
        logger.error("Database migration failed")
        return False
    
    logger.info("Database setup completed successfully")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 