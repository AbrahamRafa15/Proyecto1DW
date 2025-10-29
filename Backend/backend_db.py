import sqlite3, os
from threading import Lock
from datetime import datetime

DB_NAME = "backend.db"

db_lock = Lock()

def initialize_db():
    """
    Function to initialize database
    - If created, do nothing
    - Else, create table
    """
    is_new = not os.path.exists(DB_NAME)

    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("PRAGMA journal_mode=WAL")
        if is_new:
            conn.execute("""
                CREATE TABLE artists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    top INTEGER NOT NULL,
                    reproductions INTEGER NOT NULL         
                )
                    
            """)
            conn.execute("""
                CREATE TABLE concerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    attendance INTEGER NOT NULL,
                    city TEXT NOT NULL,
                    date TEXT NOT NULL,
                    id_artist INTEGER NOT NULL,
                    FOREIGN KEY (id_artist) REFERENCES artists(id)     
                )  
            """)
            conn.commit()