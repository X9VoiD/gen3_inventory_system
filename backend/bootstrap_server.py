import os
import sqlite3
import argparse
from backend.auth import hash_password

DATABASE_NAME = 'inventory.db'
INIT_SQL_PATH = 'backend/init.sql'

def main():
    # Database initialization
    db_exists = os.path.exists(DATABASE_NAME)
    db = sqlite3.connect(DATABASE_NAME)
    cursor = db.cursor()

    if not db_exists:
        with open(INIT_SQL_PATH, 'r') as f:
            sql = f.read()
        cursor.executescript(sql)
        db.commit()
        print("Database initialized.")
    else:
        print("Database already exists.")

    # Admin user creation
    parser = argparse.ArgumentParser(description='Create an admin user for the inventory system.')
    parser.add_argument('username', type=str, help='The username for the admin account.')
    parser.add_argument('password', type=str, help='The password for the admin account.')
    args = parser.parse_args()

    hashed_password = hash_password(args.password).hex()
    cursor.execute('INSERT INTO users (username, password, role, is_active) VALUES (?, ?, ?, ?)',
                   (args.username, hashed_password, 'Administrator', 1))
    db.commit()
    print(f"Admin user '{args.username}' created successfully.")

    db.close()

if __name__ == '__main__':
    main()