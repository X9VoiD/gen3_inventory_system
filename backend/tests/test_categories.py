import pytest
from flask import current_app
from core.database import query_db, execute_query
from core.auth import generate_auth_token

def test_categories_api(app, client):
    # Helper function to get a valid token (admin)
    def get_admin_token():
        with app.app_context():
            user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
            if user:
                return generate_auth_token(current_app, user['user_id'])
            return None

    admin_token = get_admin_token()

    # Test POST /api/v1/categories (create category - admin/manager)
    new_category_data = {
        'name': 'New Category'
    }
    response = client.post('/api/v1/categories', json=new_category_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'New Category'

    # Test GET /api/v1/categories (get all categories)
    response = client.get('/api/v1/categories')
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 1 # at least the default category

    # Test GET /api/v1/categories/<category_id> (get specific category)
    with app.app_context():
        new_category = query_db(current_app, "select * from categories where name = 'New Category'", one=True)
        category_id = new_category['category_id']
    response = client.get(f'/api/v1/categories/{category_id}')
    assert response.status_code == 200
    assert response.json['name'] == 'New Category'

    # Test PUT /api/v1/categories/<category_id> (update category - admin/manager)
    updated_category_data = {
        'name': 'Updated Category'
    }
    response = client.put(f'/api/v1/categories/{category_id}', json=updated_category_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated Category'


    # Test PATCH /api/v1/categories/<category_id> (partial update - admin/manager)
    patch_data = {'name': 'Patched Category'}
    response = client.patch(f'/api/v1/categories/{category_id}', json=patch_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Patched Category'

    # Test DELETE /api/v1/categories/<category_id> (delete - admin only, fails if associated products)
    # We expect this to fail because we haven't implemented product creation yet, and thus no associations
    response = client.delete(f'/api/v1/categories/{category_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 204

    # Test creating a category with missing data
    response = client.post('/api/v1/categories', json={}, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 400