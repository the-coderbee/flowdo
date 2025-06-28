"""
Logging configuration for the FlowDo application.
"""
import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from typing import Dict

from config.config import get_config

config = get_config()

# Dictionary to track configured loggers
_configured_loggers: Dict[str, logging.Logger] = {}

def setup_logging():
    """
    Configure logging for the application.
    This sets up default handlers and formatters for all loggers.
    """
    # Clear existing handlers from root logger
    root = logging.getLogger()
    for handler in root.handlers[:]:
        root.removeHandler(handler)
    
    # Set level for root logger
    root.setLevel(logging.getLevelName(config.LOG_LEVEL))
    
    # Create formatter
    formatter = logging.Formatter(
        config.LOG_FORMAT,
        datefmt=config.LOG_DATE_FORMAT
    )
    
    # Add console handler to root logger
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root.addHandler(console_handler)
    
    # Add file handler to root logger (except in testing mode)
    if not config.TESTING:
        # Make sure log directory exists
        log_dir = os.path.dirname(config.LOG_FILE)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        file_handler = RotatingFileHandler(
            config.LOG_FILE,
            maxBytes=10485760,  # 10 MB
            backupCount=10
        )
        file_handler.setFormatter(formatter)
        root.addHandler(file_handler)
    
    # Set SQLAlchemy logging levels
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO if config.DEBUG else logging.WARNING)
    logging.getLogger('sqlalchemy.pool').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.dialects').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.orm').setLevel(logging.WARNING)
    
    # Set Flask and Werkzeug logging levels
    logging.getLogger('werkzeug').setLevel(logging.INFO if config.DEBUG else logging.WARNING)
    logging.getLogger('flask').setLevel(logging.INFO if config.DEBUG else logging.WARNING)
    
    # Set Alembic logging level
    logging.getLogger('alembic').setLevel(logging.INFO if config.DEBUG else logging.WARNING)
    
    return root

# Initialize logging
root_logger = setup_logging()

def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: The name of the logger (usually __name__ of the module)
        
    Returns:
        A configured logger instance
    """
    if name in _configured_loggers:
        return _configured_loggers[name]
    
    logger = logging.getLogger(name)
    _configured_loggers[name] = logger
    
    return logger

# Create a default logger
logger = get_logger('flowdo')
