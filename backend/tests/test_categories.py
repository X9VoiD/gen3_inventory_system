import pytest
from flask import current_app
from core.database import query_db, execute_query
from core.auth import generate_auth_token

# Helper function to get a valid token (admin)
def get_admin_token(app):
    with app.app_context():
        user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
        if user:
            return generate_auth_token(current_app, user['user_id'])
        return None

def setup_test_data(app):
    admin_token = get_admin_token(app)
    new_category_data = {
        'name': 'New Category'
    }
    with app.test_client() as client:
        client.post('/api/v1/categories', json=new_category_data, headers={'Authorization': f'Bearer {admin_token}'})

def test_create_category(app, client):
    admin_token = get_admin_token(app)
    new_category_data = {
        'name': 'New Category 2'
    }
    response = client.post('/api/v1/categories', json=new_category_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'New Category 2'

def test_get_all_categories(app, client):
    setup_test_data(app)
    response = client.get('/api/v1/categories')
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 1 # at least the default category

def test_get_category(app, client):
    setup_test_data(app)
    with app.app_context():
        new_category = query_db(current_app, "select * from categories where name = 'New Category'", one=True)
        category_id = new_category['category_id']
    response = client.get(f'/api/v1/categories/{category_id}')
    assert response.status_code == 200
    assert response.json['name'] == 'New Category'

def test_update_category(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_category = query_db(current_app, "select * from categories where name = 'New Category'", one=True)
        category_id = new_category['category_id']
    updated_category_data = {
        'name': 'Updated Category'
    }
    response = client.put(f'/api/v1/categories/{category_id}', json=updated_category_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated Category'

def test_patch_category(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_category = query_db(current_app, "select * from categories where name = 'New Category'", one=True)
        category_id = new_category['category_id']
    patch_data = {'name': 'Patched Category'}
    response = client.patch(f'/api/v1/categories/{category_id}', json=patch_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Patched Category'

def test_delete_category(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_category = query_db(current_app, "select * from categories where name = 'New Category'", one=True)
        category_id = new_category['category_id']
    # We expect this to fail because we haven't implemented product creation yet, and thus no associations
    response = client.delete(f'/api/v1/categories/{category_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 204

def test_create_category_missing_data(app, client):
    admin_token = get_admin_token(app)
    response = client.post('/api/v1/categories', json={}, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 400
