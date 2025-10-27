#!/usr/bin/env python3

import sys
import os
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from logger import setup_logger, log_request_middleware, log_with_context, log_api_call

# Setup logger first
logger = setup_logger('sql_runner')

logger.info("SQL Runner Backend - Starting application", extra={'extra_data': {
    'environment': os.getenv('ENVIRONMENT', 'development'),
    'python_version': sys.version
}})

# Import modules
try:
    from setup import setup_database
    logger.info("Setup module imported successfully")
except Exception as e:
    logger.error("Failed to import setup module", exc_info=True, extra={'extra_data': {
        'error': str(e)
    }})
    sys.exit(1)

# Database setup
DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'sql_runner.db'))

logger.info("Checking database", extra={'extra_data': {
    'database_path': DATABASE_PATH,
    'exists': os.path.exists(DATABASE_PATH)
}})

if not os.path.exists(DATABASE_PATH):
    logger.info("Database not found, creating new database")
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    setup_database()
    logger.info("Database setup completed successfully")
else:
    logger.info("Database already exists")

# Import database module
try:
    from database import execute_query, get_all_tables, get_table_info
    logger.info("Database module imported successfully")
except Exception as e:
    logger.error("Failed to import database module", exc_info=True, extra={'extra_data': {
        'error': str(e)
    }})
    sys.exit(1)

# Create Flask app
app = Flask(__name__)

# Configure CORS
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://sql-frontend-lb-1605016243.ap-south-2.elb.amazonaws.com')
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', FRONTEND_URL).split(',')

logger.info("Configuring CORS", extra={'extra_data': {
    'allowed_origins': ALLOWED_ORIGINS
}})

CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Correlation-ID"],
        "supports_credentials": True
    }
})

# Register middleware
@app.before_request
def before_request():
    log_request_middleware()
    log_with_context(
        logger,
        'INFO',
        "Incoming request",
        method=request.method,
        path=request.path,
        correlation_id=g.correlation_id
    )

@app.after_request
def after_request(response):
    log_with_context(
        logger,
        'INFO',
        "Request completed",
        method=request.method,
        path=request.path,
        status_code=response.status_code,
        correlation_id=g.correlation_id
    )
    
    # Add correlation ID to response headers
    response.headers['X-Correlation-ID'] = g.correlation_id
    return response

# Routes
@app.route('/')
def home():
    logger.info("Health check endpoint accessed")
    return {"message": "SQL Runner API is running", "status": "healthy"}

@app.route('/health')
def health():
    logger.info("Detailed health check endpoint accessed")
    return {"status": "healthy", "database": "connected"}

@app.route('/api/query', methods=['POST'])
@log_api_call
def run_query():
    """Execute SQL query"""
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        log_with_context(
            logger,
            'WARNING',
            "Empty query received",
            endpoint='/api/query'
        )
        return jsonify({"success": False, "error": "No query provided"}), 400
    
    # Log query details (sanitized)
    query_preview = query[:100] + '...' if len(query) > 100 else query
    query_type = query.strip().split()[0].upper() if query.strip() else 'UNKNOWN'
    
    log_with_context(
        logger,
        'INFO',
        "Executing SQL query",
        query_type=query_type,
        query_preview=query_preview,
        query_length=len(query)
    )
    
    result = execute_query(query)
    
    if result.get('success'):
        log_with_context(
            logger,
            'INFO',
            "Query executed successfully",
            query_type=query_type,
            rows_affected=result.get('rowcount', 0),
            has_data=len(result.get('data', [])) > 0
        )
    else:
        log_with_context(
            logger,
            'ERROR',
            "Query execution failed",
            query_type=query_type,
            error=result.get('error', 'Unknown error')
        )
    
    return jsonify(result)

@app.route('/api/tables', methods=['GET'])
@log_api_call
def list_tables():
    """Get all table names"""
    log_with_context(
        logger,
        'INFO',
        "Fetching all tables"
    )
    
    tables = get_all_tables()
    
    log_with_context(
        logger,
        'INFO',
        "Tables retrieved successfully",
        table_count=len(tables),
        tables=tables
    )
    
    return jsonify({"success": True, "tables": tables})

@app.route('/api/tables/<table_name>', methods=['GET'])
@log_api_call
def table_details(table_name):
    """Get table schema and sample data"""
    log_with_context(
        logger,
        'INFO',
        "Fetching table details",
        table_name=table_name
    )
    
    result = get_table_info(table_name)
    
    if result.get('success'):
        log_with_context(
            logger,
            'INFO',
            "Table details retrieved successfully",
            table_name=table_name,
            column_count=len(result.get('columns', [])),
            sample_rows=len(result.get('sample_data', []))
        )
    else:
        log_with_context(
            logger,
            'ERROR',
            "Failed to retrieve table details",
            table_name=table_name,
            error=result.get('error', 'Unknown error')
        )
    
    return jsonify(result)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    log_with_context(
        logger,
        'WARNING',
        "Endpoint not found",
        path=request.path,
        method=request.method
    )
    return jsonify({"success": False, "error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    log_with_context(
        logger,
        'ERROR',
        "Internal server error",
        error=str(error),
        path=request.path
    )
    return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 8000))
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    
    logger.info("Starting Flask server", extra={'extra_data': {
        'port': PORT,
        'debug': DEBUG,
        'host': '0.0.0.0'
    }})
    
    try:
        app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
    except Exception as e:
        logger.error("Failed to start server", exc_info=True, extra={'extra_data': {
            'error': str(e)
        }})
        sys.exit(1)