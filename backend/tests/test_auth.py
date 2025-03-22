import pytest
from flask import current_app, g, jsonify

from core.auth import hash_password, verify_password, token_required, role_required
from core.database import query_db

def test_hash_verify_password():
    password = "test_password"
    hashed_password = hash_password(password)
    assert verify_password(hashed_password, password)
    assert not verify_password(hashed_password, "wrong_password")
    assert verify_password(bytes.fromhex(hashed_password.hex()), password)

def test_token_required_missing_token(app):
    @app.route('/test_token_required')
    @token_required
    def test_route():
        return jsonify({'message': 'Success'})

    # Test without token
    with app.test_client() as client:
        response = client.get('/test_token_required')
        assert response.status_code == 401
        assert response.json['message'] == 'Token is missing!'

def test_token_required_invalid_token_format(app):
    @app.route('/test_token_required')
    @token_required
    def test_route():
        return jsonify({'message': 'Success'})

    # Test with invalid token format
    with app.test_client() as client:
        response = client.get('/test_token_required', headers={'Authorization': 'InvalidToken'})
        assert response.status_code == 401
        assert response.json['message'] == 'Token is missing or malformed!'

def test_token_required_valid_token(app):
    @app.route('/test_token_required')
    @token_required
    def test_route():
        return jsonify({'message': 'Success'})

    # Test with valid token (requires a user in the database - handled by conftest.py)
    with app.test_client() as client:
        with app.app_context():
            from core.auth import generate_auth_token
            user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
            token = generate_auth_token(current_app, user['user_id'])

        response = client.get('/test_token_required', headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200
        assert response.json['message'] == 'Success'

def test_role_required_admin(app):
    @app.route('/test_admin_required')
    @role_required(['Administrator'])
    def test_admin_route():
        return jsonify({'message': 'Admin Success'})

     # Test with valid token and correct role (requires a user in the database - handled by conftest.py)
    with app.test_client() as client:
        with app.app_context():
            from core.auth import generate_auth_token
            from core.database import query_db
            from flask import current_app
            user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
            token = generate_auth_token(current_app, user['user_id'])

        response = client.get('/test_admin_required', headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200
        assert response.json['message'] == 'Admin Success'

def test_role_required_staff_unauthorized(app):
    @app.route('/test_staff_required')
    @role_required(['Staff'])
    def test_staff_route():
        return jsonify({'message': 'Staff Success'})

     # Test with valid token and correct role (requires a user in the database - handled by conftest.py)
    with app.test_client() as client:
        with app.app_context():
            from core.auth import generate_auth_token
            from core.database import query_db
            from flask import current_app
            user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
            token = generate_auth_token(current_app, user['user_id'])

        response = client.get('/test_staff_required', headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 403  # Unauthorized
