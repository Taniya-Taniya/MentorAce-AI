import sqlite3
import os

def get_db():
    # Ensure we're in the backend directory
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    db = get_db()
    cur = db.cursor()
    
    # Create users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    
    # Check if role column exists, if not add it (migration)
    cur.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cur.fetchall()]
    if 'role' not in columns:
        try:
            # First add column with default value
            cur.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'mentor'")
            db.commit()
            
            # Update any NULL values
            cur.execute("UPDATE users SET role = 'mentor' WHERE role IS NULL")
            db.commit()
            
            # Get all existing data
            cur.execute("SELECT id, name, email, password, role FROM users")
            rows = cur.fetchall()
            
            # Recreate table with NOT NULL constraint
            cur.execute("DROP TABLE users")
            cur.execute("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL
                )
            """)
            
            # Re-insert data
            for row in rows:
                role_val = row[4] if len(row) > 4 and row[4] else 'mentor'
                cur.execute(
                    "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                    (row[0], row[1], row[2], row[3], role_val)
                )
            db.commit()
            print("✓ Migrated users table: Added 'role' column")
        except Exception as e:
            print(f"Migration note: {e}")
            db.rollback()
    
    # Create evaluations table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentor_id INTEGER NOT NULL,
            clarity REAL,
            depth REAL,
            engagement REAL,
            pacing REAL,
            overall REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    db.commit()
