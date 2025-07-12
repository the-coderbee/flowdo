"""
Database-specific logging configuration for FlowDo application.

This module provides specialized logging for database operations including:
- Connection pool monitoring
- Query performance tracking
- Transaction logging
- Error tracking
- Connection lifecycle events
"""
import logging
import time
from typing import Dict, Any, Optional
from contextlib import contextmanager
from functools import wraps

from . import get_logger

class DatabaseLogger:
    """Specialized logger for database operations."""
    
    def __init__(self, logger_name: str = 'flowdo.database'):
        self.logger = get_logger(logger_name)
        self.query_logger = get_logger(f'{logger_name}.queries')
        self.connection_logger = get_logger(f'{logger_name}.connections')
        self.transaction_logger = get_logger(f'{logger_name}.transactions')
    
    def log_connection_created(self, connection_info: Dict[str, Any]):
        """Log when a database connection is created."""
        self.connection_logger.info(
            "Database connection created",
            extra={
                'event_type': 'connection_created',
                'connection_info': connection_info,
                'database_event': True
            }
        )
    
    def log_connection_closed(self, connection_info: Dict[str, Any]):
        """Log when a database connection is closed."""
        self.connection_logger.info(
            "Database connection closed",
            extra={
                'event_type': 'connection_closed',
                'connection_info': connection_info,
                'database_event': True
            }
        )
    
    def log_connection_error(self, error: Exception, connection_info: Dict[str, Any]):
        """Log database connection errors."""
        self.connection_logger.error(
            f"Database connection error: {str(error)}",
            extra={
                'event_type': 'connection_error',
                'error': str(error),
                'connection_info': connection_info,
                'database_event': True
            },
            exc_info=True
        )
    
    def log_query_start(self, query: str, params: Optional[Dict[str, Any]] = None):
        """Log the start of a database query."""
        self.query_logger.debug(
            f"Query started: {query[:100]}{'...' if len(query) > 100 else ''}",
            extra={
                'event_type': 'query_start',
                'query': query,
                'params': params,
                'database_event': True
            }
        )
    
    def log_query_complete(self, query: str, execution_time: float, rows_affected: int = 0):
        """Log the completion of a database query."""
        level = logging.WARNING if execution_time > 1.0 else logging.INFO
        self.query_logger.log(
            level,
            f"Query completed in {execution_time:.3f}s, {rows_affected} rows affected",
            extra={
                'event_type': 'query_complete',
                'query': query,
                'execution_time': execution_time,
                'rows_affected': rows_affected,
                'database_event': True,
                'slow_query': execution_time > 1.0
            }
        )
    
    def log_query_error(self, query: str, error: Exception, execution_time: float):
        """Log database query errors."""
        self.query_logger.error(
            f"Query failed after {execution_time:.3f}s: {str(error)}",
            extra={
                'event_type': 'query_error',
                'query': query,
                'error': str(error),
                'execution_time': execution_time,
                'database_event': True
            },
            exc_info=True
        )
    
    def log_transaction_start(self, transaction_id: str):
        """Log the start of a database transaction."""
        self.transaction_logger.debug(
            f"Transaction started: {transaction_id}",
            extra={
                'event_type': 'transaction_start',
                'transaction_id': transaction_id,
                'database_event': True
            }
        )
    
    def log_transaction_commit(self, transaction_id: str, duration: float):
        """Log a successful transaction commit."""
        self.transaction_logger.info(
            f"Transaction committed: {transaction_id} in {duration:.3f}s",
            extra={
                'event_type': 'transaction_commit',
                'transaction_id': transaction_id,
                'duration': duration,
                'database_event': True
            }
        )
    
    def log_transaction_rollback(self, transaction_id: str, reason: str, duration: float):
        """Log a transaction rollback."""
        self.transaction_logger.warning(
            f"Transaction rolled back: {transaction_id} after {duration:.3f}s - {reason}",
            extra={
                'event_type': 'transaction_rollback',
                'transaction_id': transaction_id,
                'reason': reason,
                'duration': duration,
                'database_event': True
            }
        )
    
    def log_pool_status(self, pool_info: Dict[str, Any]):
        """Log connection pool status."""
        self.connection_logger.info(
            "Connection pool status",
            extra={
                'event_type': 'pool_status',
                'pool_info': pool_info,
                'database_event': True
            }
        )

# Global database logger instance
db_logger = DatabaseLogger()

def log_query_performance(func):
    """Decorator to log database query performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        query_info = kwargs.get('query', 'Unknown query')
        
        try:
            db_logger.log_query_start(str(query_info))
            result = func(*args, **kwargs)
            
            execution_time = time.time() - start_time
            rows_affected = getattr(result, 'rowcount', 0) if hasattr(result, 'rowcount') else 0
            
            db_logger.log_query_complete(str(query_info), execution_time, rows_affected)
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            db_logger.log_query_error(str(query_info), e, execution_time)
            raise
    
    return wrapper

@contextmanager
def log_database_transaction(transaction_id: str):
    """Context manager to log database transactions."""
    start_time = time.time()
    db_logger.log_transaction_start(transaction_id)
    
    try:
        yield
        duration = time.time() - start_time
        db_logger.log_transaction_commit(transaction_id, duration)
    except Exception as e:
        duration = time.time() - start_time
        db_logger.log_transaction_rollback(transaction_id, str(e), duration)
        raise

class SQLAlchemyEventLogger:
    """Event logger for SQLAlchemy events."""
    
    def __init__(self):
        self.logger = get_logger('flowdo.sqlalchemy')
    
    def log_engine_connect(self, dbapi_connection, connection_record):
        """Log engine connection events."""
        self.logger.debug(
            "SQLAlchemy engine connected",
            extra={
                'event_type': 'engine_connect',
                'connection_id': id(dbapi_connection),
                'database_event': True
            }
        )
    
    def log_engine_disconnect(self, dbapi_connection, connection_record):
        """Log engine disconnection events."""
        self.logger.debug(
            "SQLAlchemy engine disconnected",
            extra={
                'event_type': 'engine_disconnect',
                'connection_id': id(dbapi_connection),
                'database_event': True
            }
        )
    
    def log_before_execute(self, conn, clauseelement, multiparams, params, execution_options):
        """Log before query execution."""
        self.logger.debug(
            f"Executing query: {str(clauseelement)[:200]}",
            extra={
                'event_type': 'before_execute',
                'query': str(clauseelement),
                'params': params,
                'database_event': True
            }
        )
    
    def log_after_execute(self, conn, clauseelement, multiparams, params, execution_options, result):
        """Log after query execution."""
        self.logger.debug(
            f"Query executed successfully",
            extra={
                'event_type': 'after_execute',
                'query': str(clauseelement),
                'rowcount': getattr(result, 'rowcount', 0),
                'database_event': True
            }
        )

# Global SQLAlchemy event logger
sqlalchemy_logger = SQLAlchemyEventLogger()

def setup_sqlalchemy_logging(engine):
    """Set up SQLAlchemy event logging for the given engine."""
    from sqlalchemy import event
    
    event.listen(engine, 'connect', sqlalchemy_logger.log_engine_connect)
    event.listen(engine, 'close', sqlalchemy_logger.log_engine_disconnect)
    event.listen(engine, 'before_execute', sqlalchemy_logger.log_before_execute)
    event.listen(engine, 'after_execute', sqlalchemy_logger.log_after_execute)
    
    db_logger.logger.info("SQLAlchemy event logging configured")

def get_db_logger(name: str = 'flowdo.database') -> DatabaseLogger:
    """Get a database logger instance."""
    return DatabaseLogger(name)