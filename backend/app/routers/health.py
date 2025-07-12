from flask import Blueprint, jsonify
from database.db import check_db_connection, get_pool_status
from logger import get_logger

logger = get_logger(__name__)

health_bp = Blueprint('health', __name__, url_prefix='/api/health')

@health_bp.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@health_bp.route('/db', methods=['GET'])
def db_health():
    """Check database connection health."""
    try:
        is_healthy = check_db_connection()
        pool_status = get_pool_status()
        
        return jsonify({
            'database_connected': is_healthy,
            'pool_status': pool_status,
            'status': 'healthy' if is_healthy else 'unhealthy'
        })
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return jsonify({
            'database_connected': False,
            'pool_status': None,
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@health_bp.route('/pool', methods=['GET'])
def pool_status():
    """Get detailed connection pool status."""
    try:
        pool_info = get_pool_status()
        if pool_info is None:
            return jsonify({'error': 'Failed to retrieve pool status'}), 500
        
        # Add warnings if pool is running low
        warnings = []
        if pool_info['checked_out'] > pool_info['size'] * 0.8:
            warnings.append('Pool utilization is high')
        if pool_info['pool_limit_reached']:
            warnings.append('Pool limit reached - new connections will timeout')
        
        return jsonify({
            'pool_info': pool_info,
            'warnings': warnings,
            'status': 'warning' if warnings else 'healthy'
        })
    except Exception as e:
        logger.error(f"Pool status check failed: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500