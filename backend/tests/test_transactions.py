import pytest
from flask import current_app
from core.database import query_db, execute_query
from core.auth import generate_auth_token

# Helper function to get a valid token (any logged in user)
def get_user_token(app):
    with app.app_context():
        user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
        if user:
            return generate_auth_token(current_app, user['user_id'])
        return None

def setup_test_data(app, client):
    user_token = get_user_token(app)

    # --- Setup test data (product, supplier) ---
    with app.app_context():
        execute_query(current_app, "INSERT OR IGNORE INTO suppliers (name) VALUES (?)", ['Test Supplier'])
        supplier = query_db(current_app, "SELECT * FROM suppliers WHERE name = ?", ['Test Supplier'], one=True)
        supplier_id = supplier['supplier_id']
        execute_query(current_app, "INSERT OR IGNORE INTO categories (name) VALUES (?)", ['Test Category'])
        category = query_db(current_app, 'SELECT * FROM categories WHERE name = ?', ['Test Category'], one=True)
        category_id = category['category_id']
        execute_query(current_app, '''
            INSERT OR IGNORE INTO products (item_code, name, description, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ['ITEM001', 'Test Product', 'Product description', supplier_id, category_id, 10.50, 15.75, 0, 1])
        product = query_db(current_app, "SELECT * FROM products WHERE item_code = ?", ['ITEM001'], one=True)
        product_id = product['product_id']
        test_user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
        user_id = test_user['user_id']
    return user_token, product_id, supplier_id, user_id

def setup_test_data_create_transaction(app, client):
    user_token, product_id, supplier_id, user_id = setup_test_data(app, client)
    new_transaction_data = {
        'product_id': product_id,
        'transaction_type': 'Delivery',
        'quantity': 50,
        'transaction_date': '2024-03-15',
        'user_id': user_id,
        'supplier_id': supplier_id
    }
    client.post('/api/v1/transactions', json=new_transaction_data, headers={'Authorization': f'Bearer {user_token}'})

def test_create_transaction(app, client):
    user_token, product_id, supplier_id, user_id = setup_test_data(app, client)
    new_transaction_data = {
        'product_id': product_id,
        'transaction_type': 'Delivery',
        'quantity': 50,
        'transaction_date': '2024-03-15',
        'user_id': user_id,
        'supplier_id': supplier_id
    }
    response = client.post('/api/v1/transactions', json=new_transaction_data, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 201
    assert response.json['product_id'] == product_id
    assert response.json['transaction_type'] == 'Delivery'

def test_get_all_transactions(app, client):
    setup_test_data_create_transaction(app, client)
    user_token = get_user_token(app)
    response = client.get('/api/v1/transactions', headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 1

def test_get_transaction(app, client):
    setup_test_data_create_transaction(app, client)
    user_token, product_id, supplier_id, user_id = setup_test_data(app, client)
    with app.app_context():
        new_transaction = query_db(current_app, "select * from transactions where product_id = ?", [product_id], one=True)
        transaction_id = new_transaction['transaction_id']

    response = client.get(f'/api/v1/transactions/{transaction_id}', headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 200
    assert response.json['product_id'] == product_id

def test_create_transaction_missing_data(app, client):
    user_token = get_user_token(app)
    response = client.post('/api/v1/transactions', json={}, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 400

def test_create_transaction_invalid_product_id(app, client):
    user_token = get_user_token(app)
    with app.app_context():
        user_id = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)['user_id']
    invalid_transaction_data = {
        'product_id': 9999,  # Invalid product_id
        'transaction_type': 'Sale',
        'quantity': 5,
        'transaction_date': '2024-03-15',
        'user_id': user_id
    }
    response = client.post('/api/v1/transactions', json=invalid_transaction_data, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 400

def test_create_transaction_invalid_transaction_type(app, client):
    setup_test_data(app, client)
    user_token = get_user_token(app)
    with app.app_context():
        user_id = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)['user_id']
        product_id = query_db(current_app, "SELECT * FROM products WHERE item_code = ?", ['ITEM001'], one=True)['product_id']
    invalid_transaction_data = {
        'product_id': product_id,
        'transaction_type': 'InvalidType',
        'quantity': 5,
        'transaction_date': '2024-03-15',
        'user_id': user_id
    }
    response = client.post('/api/v1/transactions', json=invalid_transaction_data, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 400
