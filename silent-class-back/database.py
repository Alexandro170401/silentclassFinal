import logging
import psycopg2
from psycopg2.extras import RealDictCursor

# Initialize database connection
try:
    conn = psycopg2.connect(
        host="localhost",
        database="silentclass",
        user="postgres",
        password="Alex1704mp"
    )
    logging.info("Connected to PostgreSQL database.")
except Exception as e:
    logging.error(f"Error connecting to PostgreSQL database: {str(e)}")
    raise

def get_database_connection():
    return conn

def close_database_connection():
    conn.close()
