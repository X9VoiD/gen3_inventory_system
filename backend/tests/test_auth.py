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

def test_refresh_token_route_valid(app):
    with app.test_client() as client:
        # First login to get tokens
        user_login_data = {
            'username': 'test_user',
            'password': 'test_password'
        }
        login_response = client.post('/api/v1/users/login', json=user_login_data)
        assert login_response.status_code == 200, f"Login failed: {login_response.json}"
        tokens = login_response.json
        access_token = tokens['access_token']
        refresh_token = tokens['refresh_token']

        # Perform refresh request
        refresh_data = {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
        refresh_response = client.post('/api/v1/users/refresh', json=refresh_data)
        assert refresh_response.status_code == 200, f"Refresh failed: {refresh_response.json}"
        new_tokens = refresh_response.json
        assert 'access_token' in new_tokens, "access_token missing in refresh response"
        assert 'refresh_token' in new_tokens, "refresh_token missing in refresh response"

        # Verify the new tokens are different from the old ones
        assert new_tokens['access_token'] != access_token
        assert new_tokens['refresh_token'] != refresh_token

def test_refresh_token_route_invalid_refresh_token(app):
    with app.test_client() as client:
        # Get valid access token
        user_login_data = {
            'username': 'test_user',
            'password': 'test_password'
        }
        login_response = client.post('/api/v1/users/login', json=user_login_data)
        assert login_response.status_code == 200, f"Login failed: {login_response.json}"
        access_token = login_response.json['access_token']

        # Use invalid refresh token
        refresh_data = {
            'access_token': access_token,
            'refresh_token': 'invalid_token'
        }
        refresh_response = client.post('/api/v1/users/refresh', json=refresh_data)
        assert refresh_response.status_code == 401
        assert 'message' in refresh_response.json
        assert refresh_response.json['message'] == 'Invalid tokens'

def test_refresh_token_route_missing_tokens(app):
    with app.test_client() as client:
        # Missing refresh token
        refresh_data = {
            'access_token': 'some_token'
        }
        response = client.post('/api/v1/users/refresh', json=refresh_data)
        assert response.status_code == 400
        assert response.json['message'] == 'Refresh token is missing'

        # Missing access token
        refresh_data = {
            'refresh_token': 'some_token'
        }
        response = client.post('/api/v1/users/refresh', json=refresh_data)
        assert response.status_code == 400
        assert response.json['message'] == 'Access token is missing'
