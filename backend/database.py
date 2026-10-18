"""
Database module for SmartSeat using SQLite3 with robust foreign keys and row factory.
"""
import sqlite3
import os
from .config import Config

def get_db_connection(db_path: str = None) -> sqlite3.Connection:
    path = db_path or Config.DATABASE_PATH
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path: str = None):
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Examinations Officer',
        department TEXT DEFAULT 'Office of Academic Affairs',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        reg_no TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        section TEXT NOT NULL,
        semester INTEGER NOT NULL DEFAULT 1,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS examinations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        department TEXT NOT NULL,
        semester INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS halls (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        building TEXT,
        rows INTEGER NOT NULL,
        cols INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        blocked_seats TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seating_arrangements (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        hall_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'complete',
        total_seats INTEGER NOT NULL,
        allocated_count INTEGER NOT NULL,
        awaiting_count INTEGER NOT NULL,
        blocked_count INTEGER NOT NULL,
        conflict_count INTEGER NOT NULL,
        engine_used TEXT NOT NULL,
        execution_time_ms REAL NOT NULL,
        allocations_json TEXT NOT NULL,
        unassigned_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES examinations (id) ON DELETE CASCADE,
        FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()
