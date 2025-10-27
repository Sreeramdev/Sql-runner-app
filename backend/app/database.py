import sqlite3
import os
from logger import logger, log_with_context

# Use environment variable or default path
DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'sql_runner.db'))

def get_connection():
    """Create database connection"""
    try:
        log_with_context(
            logger,
            'DEBUG',
            "Creating database connection",
            database_path=DATABASE_PATH
        )
        
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row  # Access columns by name
        
        log_with_context(
            logger,
            'DEBUG',
            "Database connection established successfully"
        )
        
        return conn
    except sqlite3.Error as e:
        log_with_context(
            logger,
            'ERROR',
            "Failed to create database connection",
            error=str(e),
            database_path=DATABASE_PATH
        )
        raise

def execute_query(query):
    """Execute any SQL query and return results"""
    query_preview = query[:100] + '...' if len(query) > 100 else query
    query_type = query.strip().split()[0].upper() if query.strip() else 'UNKNOWN'
    
    log_with_context(
        logger,
        'INFO',
        "Executing database query",
        query_type=query_type,
        query_preview=query_preview
    )
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Execute query
        cursor.execute(query)
        
        # Determine query type
        query_upper = query.strip().upper()
        
        # For SELECT queries
        if query_upper.startswith('SELECT') or query_upper.startswith('PRAGMA'):
            results = cursor.fetchall()
            result_count = len(results)
            
            log_with_context(
                logger,
                'INFO',
                "SELECT query executed successfully",
                query_type=query_type,
                rows_returned=result_count
            )
            
            return {
                "success": True,
                "data": [dict(row) for row in results],
                "rowcount": result_count
            }
        
        # For INSERT, UPDATE, DELETE queries
        elif any(query_upper.startswith(cmd) for cmd in ['INSERT', 'UPDATE', 'DELETE']):
            conn.commit()
            affected_rows = cursor.rowcount
            
            log_with_context(
                logger,
                'INFO',
                "Modification query executed successfully",
                query_type=query_type,
                rows_affected=affected_rows
            )
            
            return {
                "success": True,
                "data": [],
                "rowcount": affected_rows
            }
        
        # For DDL queries (CREATE, DROP, ALTER)
        else:
            conn.commit()
            
            log_with_context(
                logger,
                'INFO',
                "DDL query executed successfully",
                query_type=query_type
            )
            
            return {
                "success": True,
                "data": [],
                "rowcount": 0
            }
    
    except sqlite3.Error as e:
        error_message = str(e)
        
        log_with_context(
            logger,
            'ERROR',
            "Database query execution failed",
            query_type=query_type,
            error=error_message,
            query_preview=query_preview
        )
        
        return {
            "success": False,
            "error": error_message
        }
    
    finally:
        if conn:
            conn.close()
            log_with_context(
                logger,
                'DEBUG',
                "Database connection closed"
            )

def get_all_tables():
    """Get list of all tables in database"""
    log_with_context(
        logger,
        'INFO',
        "Fetching all table names from database"
    )
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        log_with_context(
            logger,
            'INFO',
            "Table names retrieved successfully",
            table_count=len(tables),
            tables=tables
        )
        
        return tables
    
    except sqlite3.Error as e:
        log_with_context(
            logger,
            'ERROR',
            "Failed to fetch table names",
            error=str(e)
        )
        return []
    
    finally:
        if conn:
            conn.close()

def get_table_info(table_name):
    """Get schema and sample data for a table"""
    log_with_context(
        logger,
        'INFO',
        "Fetching table information",
        table_name=table_name
    )
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get column information
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]
        
        log_with_context(
            logger,
            'INFO',
            "Table schema retrieved",
            table_name=table_name,
            column_count=len(columns)
        )
        
        # Get first 5 rows
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
        sample_data = [dict(row) for row in cursor.fetchall()]
        
        log_with_context(
            logger,
            'INFO',
            "Table sample data retrieved successfully",
            table_name=table_name,
            sample_rows=len(sample_data)
        )
        
        return {
            "success": True,
            "columns": columns,
            "sample_data": sample_data
        }
    
    except sqlite3.Error as e:
        error_message = str(e)
        
        log_with_context(
            logger,
            'ERROR',
            "Failed to fetch table information",
            table_name=table_name,
            error=error_message
        )
        
        return {
            "success": False,
            "error": error_message
        }
    
    finally:
        if conn:
            conn.close()