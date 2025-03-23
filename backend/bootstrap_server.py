import os
import sqlite3
import argparse
from core.auth import hash_password
from core.database import init_db, DATABASE_NAME

def main():
    # Database initialization
    db_exists = os.path.exists(DATABASE_NAME)
    db = sqlite3.connect(DATABASE_NAME)

    if not db_exists:
        init_db(db)
        print("Database initialized.")
    else:
        print("Database already exists.")

    cursor = db.cursor()

    # Admin user creation
    parser = argparse.ArgumentParser(description='Create an admin user for the inventory system.')
    parser.add_argument('email', type=str, help='The email for the admin account.')
    parser.add_argument('password', type=str, help='The password for the admin account.')
    args = parser.parse_args()

    hashed_password = hash_password(args.password).hex()
    cursor.execute('INSERT INTO users (username, password, role, is_active) VALUES (?, ?, ?, ?)',
                   (args.email, hashed_password, 'Administrator', 1))
    db.commit()
    print(f"Admin user '{args.email}' created successfully.")

    db.close()

if __name__ == '__main__':
    main()
