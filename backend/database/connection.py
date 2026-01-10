"""
Database connection module with connection pooling and context manager support.
"""
import os
import mysql.connector
from mysql.connector import pooling
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration from environment
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "shortline.proxy.rlwy.net"),
    "port": int(os.getenv("DB_PORT", 25486)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "DanUWessOwkRDUEPXdGibtAgOQuqxyoi"),
    "database": os.getenv("DB_NAME", "railway"),
    "connection_timeout": 10
}

# Connection pool for better performance
_connection_pool = None

def _get_pool():
    """Lazy initialization of connection pool."""
    global _connection_pool
    if _connection_pool is None:
        try:
            _connection_pool = pooling.MySQLConnectionPool(
                pool_name="everya_pool",
                pool_size=5,
                pool_reset_session=True,
                **DB_CONFIG
            )
        except Exception as err:
            print(f"❌ Error creating connection pool: {err}")
            return None
    return _connection_pool


def get_connection():
    """
    Get a database connection from the pool.
    Returns None if connection fails.
    """
    try:
        pool = _get_pool()
        if pool:
            return pool.get_connection()
        # Fallback to direct connection if pool fails
        return mysql.connector.connect(**DB_CONFIG)
    except Exception as err:
        print(f"❌ Error getting connection: {err}")
        return None


@contextmanager
def DatabaseConnection():
    """
    Context manager for database connections.
    Automatically handles connection closing.
    
    Usage:
        with DatabaseConnection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users")
            results = cursor.fetchall()
    """
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            raise Exception("Could not establish database connection")
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn and conn.is_connected():
            conn.close()
