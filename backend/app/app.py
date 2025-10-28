
import sys
import traceback
import os
import logging
from datetime import datetime

print("="*60)
print("SQL RUNNER BACKEND - STARTING...")
print("="*60)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

try:
    from flask import Flask, request, jsonify
    print("✓ Flask imported successfully")
except Exception as e:
    print(f"✗ ERROR importing Flask: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
except Exception as e:
    print(f"✗ ERROR importing Flask-CORS: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from setup import setup_database
    print("✓ Setup module imported successfully")
except Exception as e:
    print(f"✗ ERROR importing setup module: {e}")
    print(f"   Make sure setup.py exists in the same folder")
    traceback.print_exc()
    sys.exit(1)

# Check and setup database if needed
DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'sql_runner.db'))
print(f"\nDatabase path: {DATABASE_PATH}")

print("\nChecking database...")
if not os.path.exists(DATABASE_PATH):
    print("⚠ Database not found. Creating database...")
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    setup_database()
    print("✓ Database setup completed")
else:
    print("✓ Database already exists")


try:
    from database import execute_query, get_all_tables, get_table_info
    print("✓ Database module imported successfully")
except Exception as e:
    print(f"✗ ERROR importing database module: {e}")
    print(f"   Make sure database.py exists in the same folder")
    traceback.print_exc()
    sys.exit(1)

print("\nCreating Flask application...")
app = Flask(__name__)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://sql-frontend-lb-735475995.ap-south-2.elb.amazonaws.com')
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', FRONTEND_URL).split(',')

print(f"Allowed CORS origins: {ALLOWED_ORIGINS}")

CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

print("✓ Flask app created with CORS enabled")

print("\nRegistering routes...")
# routes for the api
@app.route('/')
def home():
    return {"message": "SQL Runner API is running", "status": "healthy"}

@app.route('/health')
def health():
    """Health check endpoint for deployment platforms"""
    return {"status": "healthy", "database": "connected"}

@app.route('/api/query', methods=['POST'])
def run_query():
    """Execute SQL query"""
    data = request.get_json()
    query = data.get('query', '')

    if not query:
        logger.warning("Query request received with no query")
        return jsonify({"success": False, "error": "No query provided"}), 400

    logger.info(f"Query received: {query}")

    result = execute_query(query)
    
    if result.get('success'):
        rowcount = result.get('rowcount', 0)
        logger.info(f"Query executed successfully - {rowcount} rows affected/returned")
    else:
        error = result.get('error', 'Unknown error')
        logger.error(f"Query failed: {error}")
    
    return jsonify(result)

@app.route('/api/tables', methods=['GET'])
def list_tables():
    """Get all table names"""
    logger.info("Fetching all tables")
    tables = get_all_tables()
    logger.info(f"Found {len(tables)} tables")
    return jsonify({"success": True, "tables": tables})

@app.route('/api/tables/<table_name>', methods=['GET'])
def table_details(table_name):
    """Get table schema and sample data"""
    logger.info(f"Fetching details for table: {table_name}")
    result = get_table_info(table_name)
    if result.get('success'):
        logger.info(f"Table details retrieved successfully for: {table_name}")
    else:
        logger.error(f"Failed to get table details for: {table_name}")
    return jsonify(result)

print("✓ All routes registered")
print("\n" + "="*60)
print("STARTING FLASK SERVER...")
PORT = int(os.getenv('PORT', 8000))
print(f"Server URL: http://0.0.0.0:{PORT}")
print("Press CTRL+C to stop the server")
print("="*60 + "\n")

# app will run on the port 8000
if __name__ == '__main__':
    try:
        logger.info("Flask server starting...")
        app.run(host='0.0.0.0', port=PORT, debug=os.getenv('DEBUG', 'False') == 'True')
    except Exception as e:
        logger.error(f"Server error: {e}")
        print(f"\n✗ ERROR starting server: {e}")
        traceback.print_exc()
        sys.exit(1)
