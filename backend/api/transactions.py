from flask import Blueprint, request, jsonify, g, current_app
from backend.auth import token_required
from backend.database import query_db, execute_query

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/v1/transactions')

@transactions_bp.route('', methods=['GET'])
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

    transactions = query_db(current_app, query, args)
    return jsonify([dict(transaction) for transaction in transactions])

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@token_required
def get_transaction(transaction_id):
    transaction = query_db(current_app, 'SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id], one=True)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    return jsonify(dict(transaction))

@transactions_bp.route('', methods=['POST'])
@token_required
def create_transaction():
    data = request.json
    required_fields = ['product_id', 'transaction_type', 'quantity', 'transaction_date', 'user_id']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    if data['transaction_type'] not in ['Delivery', 'Pull-out', 'Sale', 'Return']:
        return jsonify({'message': 'Invalid transaction type'}), 400

    # Check if product_id exists
    product = query_db(current_app, 'SELECT * FROM products WHERE product_id = ?', [data['product_id']], one=True)
    if not product:
        return jsonify({'message': 'Invalid product_id'}), 400

    #Check if user_id exists
    user = query_db(current_app, 'SELECT * FROM users WHERE user_id=?', [data['user_id']], one=True)
    if not user:
        return jsonify({'message':'Invalid user_id'}), 400

    # Validate supplier_id for Delivery and Pull-out
    supplier_id = data.get('supplier_id')
    if data['transaction_type'] in ('Delivery', 'Pull-out'):
        if supplier_id is None:
            return jsonify({'message': 'supplier_id is required for Delivery and Pull-out transactions'}), 400
        supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id=?',[supplier_id], one=True)
        if not supplier:
            return jsonify({'message':'Invalid supplier_id'}), 400

    # For sales and returns, use selling_price from products table.
    price = None
    if data['transaction_type'] in ('Sale', 'Return'):
        price = product['selling_price']

    transaction_id = execute_query(current_app, '''
        INSERT INTO transactions (product_id, transaction_type, quantity, transaction_date, supplier_id, user_id, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [data['product_id'], data['transaction_type'], data['quantity'], data['transaction_date'], supplier_id, data['user_id'], price])
    new_transaction = query_db(current_app, 'SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id], one=True)
    return jsonify(dict(new_transaction)), 201