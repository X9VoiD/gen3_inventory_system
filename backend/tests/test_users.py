import pytest
from flask import current_app
from core.database import query_db
from core.auth import generate_auth_token

# Helper function to get a valid token
def get_token(app, username='test_user'):
    with app.app_context():
        user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', [username], one=True)
        if user:
            return generate_auth_token(current_app, user['user_id'])
        return None

def setup_test_data(app, client):
    token = get_token(app)
    new_user_data = {
        'username': 'new_user',
        'password': 'new_password',
        'role': 'Staff'
    }
    client.post('/api/v1/users', json=new_user_data, headers={'Authorization': f'Bearer {token}'})

def test_get_users_admin_required(app, client):
    token = get_token(app)
    response = client.get('/api/v1/users', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    # Assuming conftest.py creates a test_user
    assert len(response.json) >= 1

def test_get_user_self_admin(app, client):
    token = get_token(app)
    with app.app_context():
        test_user = query_db(current_app, "select * from users where username = 'test_user'", one=True)
        user_id = test_user['user_id']

    response = client.get(f'/api/v1/users/{user_id}', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.json['username'] == 'test_user'

def test_get_user_unauthorized(app, client):
    token = get_token(app)
    response = client.get(f'/api/v1/users/9999', headers={'Authorization': f'Bearer {token}'})  # Non-existent user
    assert response.status_code == 404

def test_create_user_admin_only(app, client):
    token = get_token(app)
    new_user_data = {
        'username': 'new_user2',
        'password': 'new_password',
        'role': 'Staff'
    }
    response = client.post('/api/v1/users', json=new_user_data, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 201
    assert response.json['username'] == 'new_user2'
    assert response.json['role'] == 'Staff'

def test_create_user_missing_fields(app, client):
    token = get_token(app)
    invalid_user_data = {
        'username': 'invalid_user'
    }
    response = client.post('/api/v1/users', json=invalid_user_data, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 400  # Bad Request

def test_update_user_admin_or_self(app, client):
    setup_test_data(app, client)
    token = get_token(app)
    updated_user_data = {
        'username': 'updated_user',
        'password': 'updated_password',
        'role': 'Manager',
        'is_active': 1
    }
    with app.app_context():
        new_user = query_db(current_app, "select * from users where username = 'new_user'", one=True)
        new_user_id = new_user['user_id']

    response = client.put(f'/api/v1/users/{new_user_id}', json=updated_user_data, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.json['username'] == 'updated_user'
    assert response.json['role'] == 'Manager'

def test_patch_user_partial_update_admin_or_self(app, client):
    setup_test_data(app, client)
    token = get_token(app)
    with app.app_context():
        new_user = query_db(current_app, "select * from users where username = 'new_user'", one=True)
        new_user_id = new_user['user_id']
    patch_data = {
        'role': 'Administrator'
    }
    response = client.patch(f'/api/v1/users/{new_user_id}', json=patch_data, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.json['role'] == 'Administrator'

def test_delete_user_deactivate_admin_only(app, client):
    setup_test_data(app, client)
    token = get_token(app)
    with app.app_context():
        new_user = query_db(current_app, "select * from users where username = 'new_user'", one=True)
        new_user_id = new_user['user_id']
    response = client.delete(f'/api/v1/users/{new_user_id}', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 204

    # Verify user is deactivated
    with app.app_context():
        deactivated_user = query_db(current_app, f"SELECT * FROM users WHERE user_id = {new_user_id}", one=True)
        assert deactivated_user['is_active'] == 0

def test_login_valid(app, client):
    login_data = {
        'username': 'test_user',
        'password': 'test_password'
    }

    response = client.post('/api/v1/users/login', json=login_data)
    assert response.status_code == 200
    assert 'access_token' in response.json
    assert 'refresh_token' in response.json

def test_login_invalid(app, client):
    invalid_login_data = {
        'username': 'test_user',
        'password': 'wrong_password'
    }
    response = client.post('/api/v1/users/login', json=invalid_login_data)
    assert response.status_code == 401
