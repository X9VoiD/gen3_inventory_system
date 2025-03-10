import os
import sqlite3
import secrets
from datetime import datetime, timedelta, timezone

from flask import Flask, request, jsonify, g
from functools import wraps

from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidKey
import jwt

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)  # Generate a strong secret key
app.config['DATABASE'] = 'inventory.db'
app.config['JWT_SECRET_KEY'] = secrets.token_hex(32)  # Secret key for JWT
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token expiration

# --- Database Helper Functions ---

def get_db():
    db_path = app.config['DATABASE']
    db_exists = os.path.exists(db_path)
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row  # Access columns by name

        if not db_exists:
            with open('backend/init.sql', 'r') as f:
                sql = f.read()
            db.executescript(sql)
            db.commit()
    return db

@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_query(query, args=()):
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    lastrowid = cur.lastrowid
    cur.close()
    return lastrowid

# --- Password Hashing (scrypt) ---

def hash_password(password):
    salt = os.urandom(16)
    kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1, backend=default_backend())
    key = kdf.derive(password.encode())
    return salt + key  # Store salt with the hash

def verify_password(stored_password, provided_password):
    salt = stored_password[:16]
    stored_key = stored_password[16:]
    kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1, backend=default_backend())
    try:
        kdf.verify(provided_password.encode(), stored_key)
        return True  # Password is correct
    except InvalidKey:
        return False  # Password is incorrect

# --- JWT Authentication Decorator ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1] # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token is missing or malformed!'}), 401
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = query_db('SELECT * FROM users WHERE user_id = ?', [data['user_id']], one=True)
            if not current_user:
                return jsonify({'message': 'User not found'}), 404
            if not current_user['is_active']:
                return jsonify({'message': 'User is inactive'}), 403
            g.current_user = current_user # Store the user in the global object
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401

        return f(*args, **kwargs)

    return decorated

# --- Authorization Decorator ---
def role_required(roles):
    def decorator(f):
        @wraps(f)
        @token_required  # Apply token_required first
        def decorated(*args, **kwargs):
            if g.current_user['role'] not in roles:
                return jsonify({'message': 'Unauthorized'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

# --- API Endpoints ---

# --- Authentication ---
@app.route('/api/v1/login', methods=['POST'])
def login():
    auth = request.json
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Basic realm="Login required!"'}), 401

    user = query_db('SELECT * FROM users WHERE username = ?', [auth['username']], one=True)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if verify_password(bytes.fromhex(user['password']), auth['password']):
        token = jwt.encode({
            'user_id': user['user_id'],
            'exp': datetime.now(timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token})

    return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Basic realm="Login required!"'}), 401

# --- User Management ---
@app.route('/api/v1/users', methods=['GET'])
@role_required(['Administrator'])
def get_users():
    users = query_db('SELECT user_id, username, role, is_active FROM users')
    return jsonify([dict(user) for user in users])

@app.route('/api/v1/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
     # Allow admins to get any user, or users to get their own info
    if g.current_user['role'] != 'Administrator' and g.current_user['user_id'] != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    user = query_db('SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(dict(user))

@app.route('/api/v1/users', methods=['POST'])
@role_required(['Administrator'])
def create_user():
    data = request.json
    required_fields = ['username', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    if data['role'] not in ['Administrator', 'Manager', 'Staff']:
        return jsonify({'message': 'Invalid role'}), 400

    hashed_password = hash_password(data['password']).hex()  # Store as hex string
    user_id = execute_query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                           [data['username'], hashed_password, data['role']])

    new_user = query_db('SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)
    return jsonify(dict(new_user)), 201

@app.route('/api/v1/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):

    if g.current_user['role'] != 'Administrator' and g.current_user['user_id'] != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    required_fields = ['username', 'password', 'role', 'is_active']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields for PUT'}), 400

    if data['role'] not in ['Administrator', 'Manager', 'Staff']:
         return jsonify({'message': 'Invalid role'}), 400

    hashed_password = hash_password(data['password']).hex()
    execute_query('UPDATE users SET username = ?, password = ?, role = ?, is_active = ? WHERE user_id = ?',
                  [data['username'], hashed_password, data['role'], data['is_active'], user_id])

    updated_user = query_db('SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)

    if not updated_user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(dict(updated_user))

@app.route('/api/v1/users/<int:user_id>', methods=['PATCH'])
@token_required
def partial_update_user(user_id):
    if g.current_user['role'] != 'Administrator' and g.current_user['user_id'] != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    allowed_fields = ['username', 'password', 'role', 'is_active']
    updates = []
    args = []

    for field in allowed_fields:
        if field in data:
            if field == 'password':
                updates.append(f'{field} = ?')
                args.append(hash_password(data[field]).hex())
            elif field == 'role' and data['role'] not in ['Administrator', 'Manager', 'Staff']:
                return jsonify({'message': 'Invalid role'}),400
            else:
                updates.append(f'{field} = ?')
                args.append(data[field])

    if not updates:
        return jsonify({'message': 'No valid fields to update'}), 400

    args.append(user_id)
    query = f'UPDATE users SET {", ".join(updates)} WHERE user_id = ?'
    execute_query(query, args)

    updated_user = query_db('SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)
    if not updated_user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(dict(updated_user))

@app.route('/api/v1/users/<int:user_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_user(user_id):
    # Soft delete (set is_active to 0)
    execute_query('UPDATE users SET is_active = 0 WHERE user_id = ?', [user_id])
    return jsonify({'message': 'User deactivated'}), 204

# --- Supplier Management ---
@app.route('/api/v1/suppliers', methods=['GET'])
@token_required
def get_suppliers():
    suppliers = query_db('SELECT * FROM suppliers')
    return jsonify([dict(supplier) for supplier in suppliers])

@app.route('/api/v1/suppliers/<int:supplier_id>', methods=['GET'])
@token_required
def get_supplier(supplier_id):
    supplier = query_db('SELECT * FROM suppliers WHERE supplier_id = ?', [supplier_id], one=True)
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    return jsonify(dict(supplier))

@app.route('/api/v1/suppliers', methods=['POST'])
@role_required(['Administrator', 'Manager'])
def create_supplier():
    data = request.json
    required_fields = ['name']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    supplier_id = execute_query('INSERT INTO suppliers (name, contact_info) VALUES (?, ?)',
                               [data.get('name'), data.get('contact_info')])
    new_supplier = query_db('SELECT * FROM suppliers WHERE supplier_id = ?', [supplier_id], one=True)
    return jsonify(dict(new_supplier)), 201

@app.route('/api/v1/suppliers/<int:supplier_id>', methods=['PUT'])
@role_required(['Administrator', 'Manager'])
def update_supplier(supplier_id):
    data = request.json
    required_fields = ['name', 'contact_info']

    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}),400

    execute_query('UPDATE suppliers SET name = ?, contact_info = ? WHERE supplier_id = ?',
                  [data['name'], data.get('contact_info'), supplier_id])

    updated_supplier = query_db('SELECT * FROM suppliers WHERE supplier_id = ?', [supplier_id], one=True)
    if not updated_supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    return jsonify(dict(updated_supplier))

@app.route('/api/v1/suppliers/<int:supplier_id>', methods=['PATCH'])
@role_required(['Administrator', 'Manager'])
def partial_update_supplier(supplier_id):
    data = request.json
    updates = []
    args = []

    if 'name' in data:
        updates.append('name = ?')
        args.append(data['name'])
    if 'contact_info' in data:
        updates.append('contact_info = ?')
        args.append(data['contact_info'])

    if not updates:
        return jsonify({'message': 'No valid fields to update'}), 400
    args.append(supplier_id)
    query = f'UPDATE suppliers SET {", ".join(updates)} WHERE supplier_id = ?'
    execute_query(query, args)

    updated_supplier = query_db('SELECT * FROM suppliers WHERE supplier_id = ?',[supplier_id], one=True)
    if not updated_supplier:
        return jsonify({'message': 'Supplier not found'}),404

    return jsonify(dict(updated_supplier))

@app.route('/api/v1/suppliers/<int:supplier_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_supplier(supplier_id):
    # Check if the supplier has associated products or transactions
    products = query_db('SELECT * FROM products WHERE supplier_id = ?', [supplier_id])
    transactions = query_db('SELECT * FROM transactions WHERE supplier_id=?', [supplier_id])
    if products or transactions:
        return jsonify({'message': 'Cannot delete supplier with associated products or transactions'}), 409

    execute_query('DELETE FROM suppliers WHERE supplier_id = ?', [supplier_id])
    return jsonify({'message': 'Supplier deleted'}), 204

# --- Category Management ---
@app.route('/api/v1/categories', methods=['GET'])
def get_categories():
    categories = query_db('SELECT * FROM categories')
    return jsonify([dict(category) for category in categories])

@app.route('/api/v1/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = query_db('SELECT * FROM categories WHERE category_id = ?', [category_id], one=True)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    return jsonify(dict(category))

# --- Product Management ---

@app.route('/api/v1/products', methods=['GET'])
@token_required
def get_products():
    query = 'SELECT * FROM products'
    args = []
    where_clauses = []

    # Filtering
    if 'category_id' in request.args:
        where_clauses.append('category_id = ?')
        args.append(request.args['category_id'])
    if 'supplier_id' in request.args:
        where_clauses.append('supplier_id = ?')
        args.append(request.args['supplier_id'])
    if 'item_code' in request.args:
        where_clauses.append('item_code = ?')
        args.append(request.args['item_code'])
    if 'name' in request.args:
        where_clauses.append('name LIKE ?')
        args.append(f"%{request.args['name']}%")  # Use % for partial matching
    if 'is_active' in request.args:
        where_clauses.append('is_active = ?')
        args.append(request.args['is_active'])
    if 'stock_on_hand_lte' in request.args:
        where_clauses.append('stock_on_hand <= ?')
        args.append(request.args['stock_on_hand_lte'])
    if 'stock_on_hand_gte' in request.args:
        where_clauses.append('stock_on_hand >= ?')
        args.append(request.args['stock_on_hand_gte'])

    if where_clauses:
        query += ' WHERE ' + ' AND '.join(where_clauses)

    products = query_db(query, args)
    return jsonify([dict(product) for product in products])
@app.route('/api/v1/products/<int:product_id>', methods=['GET'])
@token_required
def get_product(product_id):
    product = query_db('SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(dict(product))

@app.route('/api/v1/products', methods=['POST'])
@role_required(['Administrator', 'Manager'])
def create_product():
    data = request.json
    required_fields = ['item_code', 'name', 'supplier_id', 'category_id', 'unit_cost', 'selling_price', 'is_vat_exempt']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if supplier_id and category_id exist
    supplier = query_db('SELECT * FROM suppliers WHERE supplier_id = ?', [data['supplier_id']], one=True)
    category = query_db('SELECT * FROM categories WHERE category_id = ?', [data['category_id']], one=True)

    if not supplier or not category:
        return jsonify({'message':'Invalid supplier_id or category_id'}), 400

    product_id = execute_query('''
        INSERT INTO products (item_code, name, description, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', [data['item_code'], data['name'], data.get('description'), data['supplier_id'], data['category_id'],
          data['unit_cost'], data['selling_price'], data['is_vat_exempt']])
    new_product = query_db('SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    return jsonify(dict(new_product)), 201

@app.route('/api/v1/products/<int:product_id>', methods=['PUT'])
@role_required(['Administrator', 'Manager'])
def update_product(product_id):
    data = request.json
    required_fields = ['item_code', 'name', 'description', 'supplier_id', 'category_id', 'unit_cost', 'selling_price', 'is_vat_exempt','is_active']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields for PUT'}), 400

    # Check if supplier_id and category_id exist
    supplier = query_db('SELECT * FROM suppliers WHERE supplier_id = ?', [data['supplier_id']], one=True)
    category = query_db('SELECT * FROM categories WHERE category_id = ?', [data['category_id']], one=True)

    if not supplier or not category:
        return jsonify({'message':'Invalid supplier_id or category_id'}), 400

    execute_query('''
        UPDATE products
        SET item_code = ?, name = ?, description = ?, supplier_id = ?, category_id = ?,
        unit_cost = ?, selling_price = ?, is_vat_exempt = ?, is_active = ?
        WHERE product_id = ?
    ''', [data['item_code'], data['name'], data.get('description'), data['supplier_id'], data['category_id'],
          data['unit_cost'], data['selling_price'], data['is_vat_exempt'], data['is_active'], product_id])
    updated_product = query_db('SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    if not updated_product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(dict(updated_product))

@app.route('/api/v1/products/<int:product_id>', methods=['PATCH'])
@role_required(['Administrator', 'Manager'])
def partial_update_product(product_id):
    data = request.json
    updates = []
    args = []

    allowed_fields = ['item_code', 'name', 'description', 'supplier_id', 'category_id', 'unit_cost', 'selling_price', 'is_vat_exempt', 'is_active']
    for field in allowed_fields:
        if field in data:
            if field == 'supplier_id':
                supplier = query_db('SELECT * from suppliers WHERE supplier_id=?', [data['supplier_id']], one=True)
                if not supplier:
                    return jsonify({'message':'Invalid supplier_id'}), 400
            if field == 'category_id':
                category = query_db('SELECT * FROM categories WHERE category_id=?', [data['category_id']], one=True)
                if not category:
                    return jsonify({'message':'Invalid category_id'}), 400
            updates.append(f'{field} = ?')
            args.append(data[field])

    if not updates:
        return jsonify({'message': 'No valid fields to update'}), 400

    args.append(product_id)
    query = f'UPDATE products SET {", ".join(updates)} WHERE product_id = ?'
    execute_query(query, args)

    updated_product = query_db('SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    if not updated_product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(dict(updated_product))

@app.route('/api/v1/products/<int:product_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_product(product_id):
    #Soft delete
    execute_query('UPDATE products SET is_active = 0 WHERE product_id = ?', [product_id])
    return jsonify({'message':'Product deactivated'}), 204

# --- Transaction Management ---

@app.route('/api/v1/transactions', methods=['GET'])
@token_required
def get_transactions():
    query = 'SELECT * FROM transactions'
    args = []
    where_clauses = []

    # Filtering
    if 'product_id' in request.args:
        where_clauses.append('product_id = ?')
        args.append(request.args['product_id'])
    if 'transaction_type' in request.args:
        where_clauses.append('transaction_type = ?')
        args.append(request.args['transaction_type'])
    if 'start_date' in request.args:
        where_clauses.append('transaction_date >= ?')
        args.append(request.args['start_date'])
    if 'end_date' in request.args:
        where_clauses.append('transaction_date <= ?')
        args.append(request.args['end_date'])
    if 'user_id' in request.args:
        where_clauses.append('user_id = ?')
        args.append(request.args['user_id'])
    if 'supplier_id' in request.args:
        where_clauses.append('supplier_id = ?')
        args.append(request.args['supplier_id'])

    if where_clauses:
        query += ' WHERE ' + ' AND '.join(where_clauses)

    transactions = query_db(query, args)
    return jsonify([dict(transaction) for transaction in transactions])

@app.route('/api/v1/transactions/<int:transaction_id>', methods=['GET'])
@token_required
def get_transaction(transaction_id):
    transaction = query_db('SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id], one=True)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    return jsonify(dict(transaction))

@app.route('/api/v1/transactions', methods=['POST'])
@token_required
def create_transaction():
    data = request.json
    required_fields = ['product_id', 'transaction_type', 'quantity', 'transaction_date', 'user_id']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    if data['transaction_type'] not in ['Delivery', 'Pull-out', 'Sale', 'Return']:
        return jsonify({'message': 'Invalid transaction type'}), 400

    # Check if product_id exists
    product = query_db('SELECT * FROM products WHERE product_id = ?', [data['product_id']], one=True)
    if not product:
        return jsonify({'message': 'Invalid product_id'}), 400

    #Check if user_id exists
    user = query_db('SELECT * FROM users WHERE user_id=?', [data['user_id']], one=True)
    if not user:
        return jsonify({'message':'Invalid user_id'}), 400

    # Validate supplier_id for Delivery and Pull-out
    supplier_id = data.get('supplier_id')
    if data['transaction_type'] in ('Delivery', 'Pull-out'):
        if supplier_id is None:
            return jsonify({'message': 'supplier_id is required for Delivery and Pull-out transactions'}), 400
        supplier = query_db('SELECT * FROM suppliers WHERE supplier_id=?',[supplier_id], one=True)
        if not supplier:
            return jsonify({'message':'Invalid supplier_id'}), 400

    # For sales and returns, use selling_price from products table.
    price = None
    if data['transaction_type'] in ('Sale', 'Return'):
        price = product['selling_price']

    transaction_id = execute_query('''
        INSERT INTO transactions (product_id, transaction_type, quantity, transaction_date, supplier_id, user_id, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [data['product_id'], data['transaction_type'], data['quantity'], data['transaction_date'], supplier_id, data['user_id'], price])
    new_transaction = query_db('SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id], one=True)
    return jsonify(dict(new_transaction)), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) # Make it accessible on the network