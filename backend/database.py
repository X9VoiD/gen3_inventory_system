import os
import sqlite3
from flask import g

def get_db(app):
    db_path = app.config['DATABASE']
    db_exists = os.path.exists(db_path)
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row  # Access columns by name
    return db

def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(app, query, args=(), one=False):
    cur = get_db(app).execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_query(app, query, args=()):
    db = get_db(app)
    cur = db.execute(query, args)
    db.commit()
    lastrowid = cur.lastrowid
    cur.close()
    return lastrowid