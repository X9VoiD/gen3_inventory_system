import pytest
from core.database import get_db, query_db, execute_query

def test_get_db(app):
    with app.app_context():
        db = get_db(app)
        assert db is not None
        assert db == get_db(app)  # Check for connection reuse

def test_query_db(app):
    with app.app_context():
        # Test data is inserted in conftest.py
        users = query_db(app, 'SELECT * FROM users')
        assert len(users) == 1
        assert users[0]['username'] == 'test_user'

        user = query_db(app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
        assert user['username'] == 'test_user'

        non_existent_user = query_db(app, 'SELECT * FROM users WHERE username = ?', ['nonexistent'], one=True)
        assert non_existent_user is None

def test_execute_query(app):
    with app.app_context():
        db = get_db(app)
        # Test data is inserted in conftest.py
        initial_users = query_db(app, 'SELECT COUNT(*) as count FROM users', one=True)['count']

        new_user_id = execute_query(app, 'INSERT INTO users (username, password, role, is_active) VALUES (?, ?, ?, ?)',
                                  ['new_user', 'password', 'Staff', 1])
        assert new_user_id is not None

        users_after_insert = query_db(app, 'SELECT COUNT(*) as count FROM users', one=True)['count']
        assert users_after_insert == initial_users + 1

        execute_query(app, 'UPDATE users SET username = ? WHERE user_id = ?', ['updated_user', new_user_id])
        updated_user = query_db(app, 'SELECT * FROM users WHERE user_id = ?', [new_user_id], one=True)
        assert updated_user['username'] == 'updated_user'