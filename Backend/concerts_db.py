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

def create_concert(attendance: int, city: str, date: str, id_artist: int):
    """
    Function to create a concert
    Requeries attendance, city, date, id_artist
    """
    with db_lock:
        with sqlite3.connect(DB_NAME) as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO concerts (attendance, city, date, id_artist)"
                "VALUES (?,?,?,?)",
                (attendance, city, date, id_artist)
            )
            conn.commit()

def get_concert(limit:int=20, offset:int=20):
    """Function that returns a list of concerts"""
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT concerts.id, concerts.city, concerts.date, concerts.attendance, artists.name
            FROM concerts
            JOIN artists ON concerts.id_artist = artists.id
            WHERE concerts.id = ?
        """, (limit, offset)
        )
        return cur.fetchall()

def get_concert_by_id(concert_id:int):
    """Return a single concert by ID."""
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT concerts.id, concerts.city, concerts.date, concerts.attendance, artists.name
            FROM concerts
            JOIN artists ON concerts.id_artist = artists.id
            WHERE concerts.id = ?
        """, (concert_id,))
        return cur.fetchone()
    
def update_concert(concert_id:int, attendance:int, city:str, date:str, id_artist:int):
    """Update a concert."""
    with db_lock:
        with sqlite3.connect(DB_NAME) as conn:
            cur = conn.cursor()
            cur.execute("""
                UPDATE concerts
                SET attendance=?, city=?, date=?, id_artist=?
                WHERE id=?
            """, (attendance, city, date, id_artist, concert_id))
            conn.commit()

def delete_concert(concert_id:int):
    """Delete a concert."""
    with db_lock:
        with sqlite3.connect(DB_NAME) as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM concerts WHERE id=?", (concert_id,))
            conn.commit()