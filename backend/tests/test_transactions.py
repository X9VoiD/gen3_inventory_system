import pytest
from flask import current_app
from core.database import query_db, execute_query
from core.auth import generate_auth_token

def test_transactions_api(app, client):
    # Helper function to get a valid token (any logged in user)
    def get_user_token():
        with app.app_context():
            user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
            if user:
                return generate_auth_token(current_app, user['user_id'])
            return None

    user_token = get_user_token()

    # --- Setup test data (product, supplier) ---
    with app.app_context():
        execute_query(current_app, "INSERT INTO suppliers (name) VALUES (?)", ['Test Supplier'])
        supplier = query_db(current_app, "SELECT * FROM suppliers WHERE name = ?", ['Test Supplier'], one=True)
        supplier_id = supplier['supplier_id']
        execute_query(current_app, "INSERT INTO categories (name) VALUES (?)", ['Test Category'])
        category = query_db(current_app, 'SELECT * FROM categories WHERE name = ?', ['Test Category'], one=True)
        category_id = category['category_id']
        execute_query(current_app, '''
            INSERT INTO products (item_code, name, description, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ['ITEM001', 'Test Product', 'Product description', supplier_id, category_id, 10.50, 15.75, 0, 1])
        product = query_db(current_app, "SELECT * FROM products WHERE item_code = ?", ['ITEM001'], one=True)
        product_id = product['product_id']
        test_user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', ['test_user'], one=True)
        user_id = test_user['user_id']

    # Test POST /api/v1/transactions (create transaction)
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

    # Test GET /api/v1/transactions (get all transactions)
    response = client.get('/api/v1/transactions', headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 1

    # Test GET /api/v1/transactions/<transaction_id> (get specific transaction)
    with app.app_context():
        new_transaction = query_db(current_app, "select * from transactions where product_id = ?", [product_id], one=True)
        transaction_id = new_transaction['transaction_id']

    response = client.get(f'/api/v1/transactions/{transaction_id}', headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 200
    assert response.json['product_id'] == product_id

    # Test creating a transaction with missing data
    response = client.post('/api/v1/transactions', json={}, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 400

    # Test creating a transaction with an invalid product_id
    invalid_transaction_data = {
        'product_id': 9999,  # Invalid product_id
        'transaction_type': 'Sale',
        'quantity': 5,
        'transaction_date': '2024-03-15',
        'user_id': user_id
    }
    response = client.post('/api/v1/transactions', json=invalid_transaction_data, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 400

    # Test creating a transaction with invalid transaction type
    invalid_transaction_data = {
        'product_id': product_id,
        'transaction_type': 'InvalidType',
        'quantity': 5,
        'transaction_date': '2024-03-15',
        'user_id': user_id
    }
    response = client.post('/api/v1/transactions', json=invalid_transaction_data, headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 400