import pytest
from core.database import get_db, query_db, execute_query

def test_insert_delivery_transaction_updates_stock(app):
    with app.app_context():
        db = get_db(app)

        # --- Setup test data (supplier, category, product) ---
        execute_query(app, "INSERT OR IGNORE INTO suppliers (supplier_id, name) VALUES (?, ?)", [1, 'Test Supplier'])
        execute_query(app, "INSERT OR IGNORE INTO categories (category_id, name) VALUES (?, ?)", [1, 'Test Category'])
        execute_query(app, '''
            INSERT OR IGNORE INTO products (product_id, item_code, name, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt, stock_on_hand)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [1, 'TEST_PRODUCT_FOR_TRIGGERS', 'Test Product for Triggers', 1, 1, 10.00, 20.00, 0, 20])

        product_id = 1
        initial_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        delivery_quantity = 10

        execute_query(app, '''
            INSERT INTO transactions (product_id, transaction_type, quantity, transaction_date, supplier_id, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', [product_id, 'Delivery', delivery_quantity, '2025-03-23', 1, 1]) # Using dummy supplier_id and user_id

        updated_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        assert updated_stock == initial_stock + delivery_quantity

def test_insert_sale_transaction_updates_stock(app):
    with app.app_context():
        db = get_db(app)

        # --- Setup test data (supplier, category, product) ---
        execute_query(app, "INSERT OR IGNORE INTO suppliers (supplier_id, name) VALUES (?, ?)", [1, 'Test Supplier'])
        execute_query(app, "INSERT OR IGNORE INTO categories (category_id, name) VALUES (?, ?)", [1, 'Test Category'])
        execute_query(app, '''
            INSERT OR IGNORE INTO products (product_id, item_code, name, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt, stock_on_hand)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [1, 'TEST_PRODUCT_FOR_TRIGGERS', 'Test Product for Triggers', 1, 1, 10.00, 20.00, 0, 20])

        product_id = 1
        initial_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        sale_quantity = 5

        execute_query(app, '''
            INSERT INTO transactions (product_id, transaction_type, quantity, transaction_date, user_id)
            VALUES (?, ?, ?, ?, ?)
        ''', [product_id, 'Sale', sale_quantity, '2025-03-23', 1]) # Using dummy user_id, no supplier_id for sale

        updated_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        assert updated_stock == initial_stock - sale_quantity

def test_insert_pullout_transaction_updates_stock(app):
    with app.app_context():
        db = get_db(app)

        # --- Setup test data (supplier, category, product) ---
        execute_query(app, "INSERT OR IGNORE INTO suppliers (supplier_id, name) VALUES (?, ?)", [1, 'Test Supplier'])
        execute_query(app, "INSERT OR IGNORE INTO categories (category_id, name) VALUES (?, ?)", [1, 'Test Category'])
        execute_query(app, '''
            INSERT OR IGNORE INTO products (product_id, item_code, name, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt, stock_on_hand)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [1, 'TEST_PRODUCT_FOR_TRIGGERS', 'Test Product for Triggers', 1, 1, 10.00, 20.00, 0, 20])

        product_id = 1
        initial_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        pullout_quantity = 3

        execute_query(app, '''
            INSERT INTO transactions (product_id, transaction_type, quantity, transaction_date, supplier_id, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', [product_id, 'Pull-out', pullout_quantity, '2025-03-23', 1, 1]) # Using dummy supplier_id and user_id

        updated_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        assert updated_stock == initial_stock - pullout_quantity

def test_insert_return_transaction_updates_stock(app):
    with app.app_context():
        db = get_db(app)

        # --- Setup test data (supplier, category, product) ---
        execute_query(app, "INSERT OR IGNORE INTO suppliers (supplier_id, name) VALUES (?, ?)", [1, 'Test Supplier'])
        execute_query(app, "INSERT OR IGNORE INTO categories (category_id, name) VALUES (?, ?)", [1, 'Test Category'])
        execute_query(app, '''
            INSERT OR IGNORE INTO products (product_id, item_code, name, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt, stock_on_hand)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [1, 'TEST_PRODUCT_FOR_TRIGGERS', 'Test Product for Triggers', 1, 1, 10.00, 20.00, 0, 20])

        product_id = 1
        initial_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        return_quantity = 2

        execute_query(app, '''
            INSERT INTO transactions (product_id, transaction_type, quantity, transaction_date, user_id, price)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', [product_id, 'Return', return_quantity, '2025-03-23', 1, 10]) # Using dummy user_id and price

        updated_stock = query_db(app, 'SELECT stock_on_hand FROM products WHERE product_id = ?', [product_id], one=True)['stock_on_hand']
        assert updated_stock == initial_stock - return_quantity

# Add tests for update and delete triggers later
