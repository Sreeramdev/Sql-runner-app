import sqlite3
import os

DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'sql_runner.db'))

def get_connection():
    """Create database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  
    return conn

def execute_query(query):
    """Execute any SQL query and return results"""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(query)

        query_upper = query.strip().upper()

        #  SELECT queries
        if query_upper.startswith('SELECT') or query_upper.startswith('PRAGMA'):
            results = cursor.fetchall()
            return {
                "success": True,
                "data": [dict(row) for row in results],
                "rowcount": len(results)
            }

        # For INSERT, UPDATE, DELETE queries
        elif any(query_upper.startswith(cmd) for cmd in ['INSERT', 'UPDATE', 'DELETE']):
            conn.commit()
            affected_rows = cursor.rowcount  # This is the key change
            return {
                "success": True,
                "data": [],
                "rowcount": affected_rows
            }

        # For  (CREATE, DROP, ALTER)
        else:
            conn.commit()
            return {
                "success": True,
                "data": [],
                "rowcount": 0
            }

    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        conn.close()

def get_all_tables():
    """Get list of all tables in database"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()

    return tables

def get_table_info(table_name):
    """Get schema and sample data for a table"""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]

        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
        sample_data = [dict(row) for row in cursor.fetchall()]

        return {
            "success": True,
            "columns": columns,
            "sample_data": sample_data
        }
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        conn.close()
