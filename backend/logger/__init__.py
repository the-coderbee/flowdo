"""
Enhanced logging configuration for the FlowDo application.

This module provides a centralized logging system with:
- Colored console output using colorlog
- Structured logging with JSON formatting
- Request correlation IDs
- Database query logging
- Security event logging
- Performance metrics
"""
import logging as _logging
import sys
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
from logging.handlers import RotatingFileHandler
from contextlib import contextmanager

try:
    import colorlog
    HAS_COLORLOG = True
except ImportError:
    HAS_COLORLOG = False

from config.config import get_config

config = get_config()

# Dictionary to track configured loggers
_configured_loggers: Dict[str, _logging.Logger] = {}
_setup_completed = False

class JsonFormatter(_logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record: _logging.LogRecord) -> str:
        """Format the log record as JSON."""
        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add exception information if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 'pathname', 'filename',
                          'module', 'lineno', 'funcName', 'created', 'msecs', 'relativeCreated',
                          'thread', 'threadName', 'processName', 'process', 'message', 'exc_info',
                          'exc_text', 'stack_info']:
                log_entry[key] = value
        
        return json.dumps(log_entry)

class RequestContextFilter(_logging.Filter):
    """Filter to add request context to log records."""
    
    def filter(self, record: _logging.LogRecord) -> bool:
        """Add request context to the log record."""
        # Try to get Flask request context
        try:
            from flask import has_request_context, request, g
            if has_request_context():
                record.request_id = getattr(g, 'request_id', 'unknown')
                record.user_id = getattr(g, 'user_id', 'anonymous')
                record.endpoint = request.endpoint
                record.method = request.method
                record.remote_addr = request.remote_addr
        except ImportError:
            pass
        
        return True

def setup_logging() -> _logging.Logger:
    """
    Configure logging for the application.
    This sets up handlers, formatters, and filters for all loggers.
    """
    global _setup_completed
    
    if _setup_completed:
        return _logging.getLogger('flowdo')
    
    # Check if we're in Flask's reloader process - if so, don't duplicate logging setup
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        # We're in the reloader process, just return the logger without setting up handlers again
        _setup_completed = True
        return _logging.getLogger('flowdo')
    
    # Clear existing handlers from root logger
    root = _logging.getLogger()
    for handler in root.handlers[:]:
        root.removeHandler(handler)
    
    # Set level for root logger
    root.setLevel(_logging.getLevelName(config.LOG_LEVEL))
    
    # Create console handler with color support
    console_handler = _logging.StreamHandler(sys.stdout)
    
    if HAS_COLORLOG and not config.TESTING:
        # Use colorlog for colored output
        color_formatter = colorlog.ColoredFormatter(
            '%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            }
        )
        console_handler.setFormatter(color_formatter)
    else:
        # Use standard formatter
        formatter = _logging.Formatter(
            config.LOG_FORMAT,
            datefmt=config.LOG_DATE_FORMAT
        )
        console_handler.setFormatter(formatter)
    
    # Add request context filter
    request_filter = RequestContextFilter()
    console_handler.addFilter(request_filter)
    
    root.addHandler(console_handler)
    
    # Add file handler (except in testing mode)
    if not config.TESTING:
        # Make sure log directory exists
        log_dir = os.path.dirname(config.LOG_FILE)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Regular file handler with standard format
        file_handler = RotatingFileHandler(
            config.LOG_FILE,
            maxBytes=10485760,  # 10 MB
            backupCount=10
        )
        file_formatter = _logging.Formatter(
            config.LOG_FORMAT,
            datefmt=config.LOG_DATE_FORMAT
        )
        file_handler.setFormatter(file_formatter)
        file_handler.addFilter(request_filter)
        root.addHandler(file_handler)
        
        # JSON file handler for structured logging
        json_log_file = str(config.LOG_FILE).replace('.log', '.json')
        json_handler = RotatingFileHandler(
            json_log_file,
            maxBytes=10485760,  # 10 MB
            backupCount=10
        )
        json_handler.setFormatter(JsonFormatter())
        json_handler.addFilter(request_filter)
        root.addHandler(json_handler)
    
    # Configure third-party loggers
    _configure_third_party_loggers()
    
    _setup_completed = True
    return _logging.getLogger('flowdo')

def _configure_third_party_loggers():
    """Configure logging levels for third-party libraries."""
    # SQLAlchemy logging levels
    _logging.getLogger('sqlalchemy.engine').setLevel(
        _logging.INFO if config.DEBUG else _logging.WARNING
    )
    _logging.getLogger('sqlalchemy.pool').setLevel(_logging.WARNING)
    _logging.getLogger('sqlalchemy.dialects').setLevel(_logging.WARNING)
    _logging.getLogger('sqlalchemy.orm').setLevel(_logging.WARNING)
    
    # Flask and Werkzeug logging levels
    _logging.getLogger('werkzeug').setLevel(
        _logging.INFO if config.DEBUG else _logging.WARNING
    )
    _logging.getLogger('flask').setLevel(
        _logging.INFO if config.DEBUG else _logging.WARNING
    )
    
    # Alembic logging level
    _logging.getLogger('alembic').setLevel(
        _logging.INFO if config.DEBUG else _logging.WARNING
    )

def get_logger(name: str) -> _logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: The name of the logger (usually __name__ of the module)
        
    Returns:
        A configured logger instance
    """
    if name in _configured_loggers:
        return _configured_loggers[name]
    
    # Ensure logging is set up
    if not _setup_completed:
        setup_logging()
    
    logger = _logging.getLogger(name)
    _configured_loggers[name] = logger
    
    return logger

def log_performance(func):
    """Decorator to log function performance."""
    def wrapper(*args, **kwargs):
        import time
        logger = get_logger(func.__module__)
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(
                f"Function {func.__name__} executed successfully",
                extra={
                    'function': func.__name__,
                    'execution_time': execution_time,
                    'module': func.__module__
                }
            )
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                f"Function {func.__name__} failed with exception: {str(e)}",
                extra={
                    'function': func.__name__,
                    'execution_time': execution_time,
                    'module': func.__module__,
                    'exception': str(e)
                }
            )
            raise
    
    return wrapper

def log_security_event(event_type: str, details: Dict[str, Any], logger_name: str = 'flowdo.security'):
    """Log security-related events."""
    logger = get_logger(logger_name)
    logger.warning(
        f"Security event: {event_type}",
        extra={
            'event_type': event_type,
            'security_event': True,
            **details
        }
    )

@contextmanager
def log_context(**kwargs):
    """Context manager to add extra context to log records."""
    logger = get_logger('flowdo')
    old_makeRecord = logger.makeRecord
    
    def makeRecord(name, level, fn, lno, msg, args, exc_info, 
                  func=None, extra=None, sinfo=None):
        if extra is None:
            extra = {}
        extra.update(kwargs)
        return old_makeRecord(name, level, fn, lno, msg, args, exc_info, 
                             func, extra, sinfo)
    
    logger.makeRecord = makeRecord
    try:
        yield
    finally:
        logger.makeRecord = old_makeRecord

# Initialize logging
root_logger = setup_logging()

# Create a default logger
logger = get_logger('flowdo')