#!/usr/bin/env python
"""
Database Test Script

This script tests the database connection and performs basic CRUD operations.
"""
import sys
from pathlib import Path
from datetime import datetime

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.absolute()))

from logger import get_logger
from database.db import session_scope, engine, check_db_connection
from database.models.user import User

logger = get_logger(__name__)

def test_connection():
    """Test database connection."""
    logger.info("Testing database connection...")
    if check_db_connection():
        logger.info("Database connection successful")
        return True
    else:
        logger.error("Database connection failed")
        return False

def test_crud_operations():
    """Test basic CRUD operations."""
    logger.info("Testing CRUD operations...")
    
    # Create a test user with a short email (under 30 chars)
    test_email = f"test_{datetime.now().strftime('%H%M%S')}@test.com"
    
    try:
        # Create
        with session_scope() as session:
            user = User(
                email=test_email,
                display_name="Test User",
                psw_hash="test_hash",
                work_duration=25,
                short_break_duration=5,
                long_break_duration=15,
                session_count=0,
                sessions_until_long_break=4
            )
            session.add(user)
            session.flush()
            user_id = user.id
            logger.info(f"Created test user with ID: {user_id}")
        
        # Read
        with session_scope() as session:
            user = session.query(User).filter(User.id == user_id).first()
            if user:
                logger.info(f"Read test user: {user.email}")
            else:
                logger.error("Failed to read test user")
                return False
        
        # Update
        with session_scope() as session:
            user = session.query(User).filter(User.id == user_id).first()
            user.display_name = "Updated Test User"
            session.flush()
            logger.info(f"Updated test user: {user.display_name}")
        
        # Delete
        with session_scope() as session:
            user = session.query(User).filter(User.id == user_id).first()
            session.delete(user)
            logger.info(f"Deleted test user with ID: {user_id}")
        
        logger.info("CRUD operations successful")
        return True
    
    except Exception as e:
        logger.error(f"CRUD operations failed: {e}")
        return False

def main():
    """Main function."""
    logger.info("Starting database test")
    
    # Test connection
    if not test_connection():
        return False
    
    # Test CRUD operations
    if not test_crud_operations():
        return False
    
    logger.info("All tests passed")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 