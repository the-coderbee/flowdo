#!/usr/bin/env python
"""
FlowDo Application Entry Point
"""
import os
from config.config import get_config
from app import create_app
from logger import get_logger

# Get logger
logger = get_logger(__name__)

# Get configuration
config = get_config()

# Create application with config
config_dict = {
    key: getattr(config, key) 
    for key in dir(config) 
    if not key.startswith('__') 
    and not callable(getattr(config, key))
    and not isinstance(getattr(config.__class__, key, None), property)
}

# Create application
app = create_app(config_dict)

if __name__ == "__main__":
    # Get host and port from environment or config
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', config.PORT))
    
    logger.info(f"Starting Flask application on {host}:{port}")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    logger.info(f"Debug mode: {config.DEBUG}")
    
    try:
        # Run the Flask development server
        app.run(host=host, port=port, debug=config.DEBUG)
    except KeyboardInterrupt:
        logger.info("Application shutting down")
    except Exception as e:
        logger.error(f"Error starting application: {e}", exc_info=True)
