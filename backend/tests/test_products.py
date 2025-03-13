import pytest
from flask import current_app
from core.database import query_db, execute_query
from core.auth import generate_auth_token

def test_products_api(app, client):
    # Helper function to get a valid token (admin)
    def get_admin_token():
        with app.app_context():
            user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
            if user:
                return generate_auth_token(current_app, user['user_id'])
            return None

    admin_token = get_admin_token()

    # --- Setup test data (supplier and category) ---
    with app.app_context():
      execute_query(current_app, "INSERT INTO suppliers (name) VALUES (?)", ['Test Supplier'])
      supplier = query_db(current_app, "SELECT * FROM suppliers WHERE name = ?", ['Test Supplier'], one=True)
      supplier_id = supplier['supplier_id']

      execute_query(current_app, "INSERT INTO categories (name) VALUES (?)", ['Test Category'])
      category = query_db(current_app, 'SELECT * FROM categories WHERE name = ?', ['Test Category'], one=True)
      category_id = category['category_id']

    # Test POST /api/v1/products (create product - admin/manager)
    new_product_data = {
        'item_code': 'ITEM001',
        'name': 'New Product',
        'description': 'Product description',
        'supplier_id': supplier_id,
        'category_id': category_id,
        'unit_cost': 10.50,
        'selling_price': 15.75,
        'is_vat_exempt': 0
    }
    response = client.post('/api/v1/products', json=new_product_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 201
    assert response.json['item_code'] == 'ITEM001'
    assert response.json['name'] == 'New Product'

    # Test GET /api/v1/products (get all products)
    response = client.get('/api/v1/products', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 1

    # Test GET /api/v1/products/<product_id> (get specific product)
    with app.app_context():
        new_product = query_db(current_app, "select * from products where item_code = 'ITEM001'", one=True)
        product_id = new_product['product_id']

    response = client.get(f'/api/v1/products/{product_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['item_code'] == 'ITEM001'

    # Test PUT /api/v1/products/<product_id> (update product - admin/manager)
    updated_product_data = {
        'item_code': 'ITEM001',
        'name': 'Updated Product',
        'description': 'Updated description',
        'supplier_id': supplier_id,
        'category_id': category_id,
        'unit_cost': 12.00,
        'selling_price': 18.00,
        'is_vat_exempt': 1,
        'is_active': 1
    }
    response = client.put(f'/api/v1/products/{product_id}', json=updated_product_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated Product'
    assert response.json['is_vat_exempt'] == 1

    # Test PATCH /api/v1/products/<product_id> (partial update - admin/manager)
    patch_data = {
        'description': 'Patched description'
    }
    response = client.patch(f'/api/v1/products/{product_id}', json=patch_data, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    assert response.json['description'] == 'Patched description'

    # Test DELETE /api/v1/products/<product_id> (deactivate - admin only)
    response = client.delete(f'/api/v1/products/{product_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 204

    # Verify product is deactivated
    with app.app_context():
        deactivated_product = query_db(current_app, f"SELECT * FROM products WHERE product_id = {product_id}", one=True)
        assert deactivated_product['is_active'] == 0

    # Test creating a product with missing data
    response = client.post('/api/v1/products', json={}, headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 400