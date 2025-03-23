import sqlite3
import pytest
import tempfile
import os
import pytest
import tempfile
import os
from core.app import create_app
from core.database import get_db, init_db

@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp()

    config = {
        "TESTING": True,
        "DATABASE": db_path,
        "SECRET_KEY": "testing",
        "JWT_SECRET_KEY": "testing",
    }
    app = create_app(config_overrides=config)

    with app.app_context():
        db_temp = sqlite3.connect(app.config["DATABASE"])
        init_db(db_temp)
        db_temp.close()
        db = get_db(app)
        # Insert a test user
        from core.auth import hash_password
        hashed_password = hash_password('test_password').hex()
        db.execute('INSERT INTO users (username, password, role, is_active) VALUES (?, ?, ?, ?)',
                   ('test_user', hashed_password, 'Administrator', 1))
        db.commit()

    yield app

    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
