import sqlite3, os
from threading import Lock
from datetime import datetime

DB_NAME = "backend.db"

db_lock = Lock()

def create_artist(name:str, top: int, reproductions:int):
    """
    Function to create an artists
    - Requeries name, top, reproductions
    """
    with db_lock:
        with sqlite3.connect(DB_NAME) as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO artists (name, top, reproductions)"
                "VALUES (?,?,?)",
                (name, top, reproductions)
            )
            conn.commit()

def get_artist(limit:int=20, offset:int=20):
    """Function that returns a list of artists"""
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM artists LIMIT ? OFFSET ?", (limit, offset))
        return cur.fetchall()
    
def get_artist_by_id(artist_id: int):
    """Function that returns an artist by id"""
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM artists WHERE id=?", (artist_id,))
        return cur.fetchone()
    
def update_artist(artist_id: int, name: str, top: int, reproductions: int):
    """Update an artist"""
    with db_lock:
        with sqlite3.connect(DB_NAME) as conn:
            cur = conn.cursor()
            cur.execute(
                "UPDATE artists SET name=?, top=?, reproductions=? WHERE id=?",
                (name, top, reproductions, artist_id)
            )
            conn.commit()

def delete_artist(artist_id: int):
    """Delete an artist"""
    with db_lock:
        with sqlite3.connect(DB_NAME) as conn:
            cur = conn.cursor()
            cur.execute(
                "DELETE FROM artists WHERE id=?", (artist_id,)
            )
