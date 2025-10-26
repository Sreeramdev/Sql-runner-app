#!/usr/bin/env python3

import sys
import traceback
import os

print("="*60)
print("SQL RUNNER BACKEND - STARTING...")
print("="*60)

# Step 1: Import Flask
try:
    from flask import Flask, request, jsonify
    print("✓ Flask imported successfully")
except Exception as e:
    print(f"✗ ERROR importing Flask: {e}")
    traceback.print_exc()
    sys.exit(1)

# Step 2: Import CORS
try:
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
except Exception as e:
    print(f"✗ ERROR importing Flask-CORS: {e}")
    traceback.print_exc()
    sys.exit(1)

# Step 3: Import setup module
try:
    from setup import setup_database
    print("✓ Setup module imported successfully")
except Exception as e:
    print(f"✗ ERROR importing setup module: {e}")
    print(f"   Make sure setup.py exists in the same folder")
    traceback.print_exc()
    sys.exit(1)

# Step 4: Check and setup database if needed
# Use environment variable or default path
DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'sql_runner.db'))
print(f"\nDatabase path: {DATABASE_PATH}")

print("\nChecking database...")
if not os.path.exists(DATABASE_PATH):
    print("⚠ Database not found. Creating database...")
    # Create database directory if it doesn't exist
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    setup_database()
    print("✓ Database setup completed")
else:
    print("✓ Database already exists")

# Step 5: Import database module
try:
    from database import execute_query, get_all_tables, get_table_info
    print("✓ Database module imported successfully")
except Exception as e:
    print(f"✗ ERROR importing database module: {e}")
    print(f"   Make sure database.py exists in the same folder")
    traceback.print_exc()
    sys.exit(1)

# Create Flask app
print("\nCreating Flask application...")
app = Flask(__name__)

# Configure CORS based on environment
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://sql-frontend-lb-1605016243.ap-south-2.elb.amazonaws.com/')
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

# Define routes
print("\nRegistering routes...")

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
        return jsonify({"success": False, "error": "No query provided"}), 400

    result = execute_query(query)
    return jsonify(result)

@app.route('/api/tables', methods=['GET'])
def list_tables():
    """Get all table names"""
    tables = get_all_tables()
    return jsonify({"success": True, "tables": tables})

@app.route('/api/tables/<table_name>', methods=['GET'])
def table_details(table_name):
    """Get table schema and sample data"""
    result = get_table_info(table_name)
    return jsonify(result)

print("✓ All routes registered")
print("\n" + "="*60)
print("STARTING FLASK SERVER...")
PORT = int(os.getenv('PORT', 8000))
print(f"Server URL: http://0.0.0.0:{PORT}")
print("Press CTRL+C to stop the server")
print("="*60 + "\n")

# Run the app
if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=PORT, debug=os.getenv('DEBUG', 'False') == 'True')
    except Exception as e:
        print(f"\n✗ ERROR starting server: {e}")
        traceback.print_exc()
        sys.exit(1)