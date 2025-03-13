import pytest
import tempfile
import os
from core.app import create_app
from core.database import get_db
from core.auth import hash_password

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
        db = get_db(app)
        with open('init.sql', 'r') as f:
            db.executescript(f.read())
        # Insert a test user
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