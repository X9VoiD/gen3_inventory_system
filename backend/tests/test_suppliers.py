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
    new_supplier_data = {
        'name': 'New Supplier',
        'contact_info': 'supplier@example.com'
    }
    with app.test_client() as client:
        client.post('/api/v1/suppliers', json=new_supplier_data, headers={'Authorization': f'Bearer {admin_token}'})

def test_create_supplier(app, client):
    admin_token = get_admin_token(app)
    new_supplier_data = {
        'name': 'New Supplier 2',
        'contact_info': 'supplier2@example.com'
    }
    response = client.post('/api/v1/suppliers', json=new_supplier_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'New Supplier 2'

def test_get_all_suppliers(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    response = client.get('/api/v1/suppliers', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 1 # At least the one we just created

def test_get_supplier(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_supplier = query_db(current_app, "select * from suppliers where name = 'New Supplier'", one=True)
        supplier_id = new_supplier['supplier_id']

    response = client.get(f'/api/v1/suppliers/{supplier_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'New Supplier'

def test_update_supplier(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_supplier = query_db(current_app, "select * from suppliers where name = 'New Supplier'", one=True)
        supplier_id = new_supplier['supplier_id']
    updated_supplier_data = {
        'name': 'Updated Supplier',
        'contact_info': 'updated@example.com'
    }
    response = client.put(f'/api/v1/suppliers/{supplier_id}', json=updated_supplier_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated Supplier'
    assert response.json['contact_info'] == 'updated@example.com'

def test_patch_supplier(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_supplier = query_db(current_app, "select * from suppliers where name = 'New Supplier'", one=True)
        supplier_id = new_supplier['supplier_id']
    patch_data = {
        'contact_info': 'patched@example.com'
    }
    response = client.patch(f'/api/v1/suppliers/{supplier_id}', json=patch_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['contact_info'] == 'patched@example.com'

def test_delete_supplier(app, client):
    setup_test_data(app)
    admin_token = get_admin_token(app)
    with app.app_context():
        new_supplier = query_db(current_app, "select * from suppliers where name = 'New Supplier'", one=True)
        supplier_id = new_supplier['supplier_id']
    # We expect this to fail because we haven't implemented product creation yet, and thus no associations
    response = client.delete(f'/api/v1/suppliers/{supplier_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 204

def test_create_supplier_missing_data(app, client):
    admin_token = get_admin_token(app)
    missing_data = {}
    response = client.post('/api/v1/suppliers', json=missing_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 400
