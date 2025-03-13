from flask import Blueprint, request, jsonify, g, current_app
from core.auth import token_required, role_required
from core.database import query_db, execute_query

products_bp = Blueprint('products', __name__, url_prefix='/api/v1/products')

@products_bp.route('', methods=['GET'])
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

    products = query_db(current_app, query, args)
    return jsonify([dict(product) for product in products])

@products_bp.route('/<int:product_id>', methods=['GET'])
@token_required
def get_product(product_id):
    product = query_db(current_app, 'SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(dict(product))

@products_bp.route('', methods=['POST'])
@role_required(['Administrator', 'Manager'])
def create_product():
    data = request.json
    required_fields = ['item_code', 'name', 'supplier_id', 'category_id', 'unit_cost', 'selling_price', 'is_vat_exempt']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if supplier_id and category_id exist
    supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id = ?', [data['supplier_id']], one=True)
    category = query_db(current_app, 'SELECT * FROM categories WHERE category_id = ?', [data['category_id']], one=True)

    if not supplier or not category:
        return jsonify({'message':'Invalid supplier_id or category_id'}), 400

    product_id = execute_query(current_app, '''
        INSERT INTO products (item_code, name, description, supplier_id, category_id, unit_cost, selling_price, is_vat_exempt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', [data['item_code'], data['name'], data.get('description'), data['supplier_id'], data['category_id'],
          data['unit_cost'], data['selling_price'], data['is_vat_exempt']])
    new_product = query_db(current_app, 'SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    return jsonify(dict(new_product)), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@role_required(['Administrator', 'Manager'])
def update_product(product_id):
    data = request.json
    required_fields = ['item_code', 'name', 'description', 'supplier_id', 'category_id', 'unit_cost', 'selling_price', 'is_vat_exempt','is_active']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields for PUT'}), 400

    # Check if supplier_id and category_id exist
    supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id = ?', [data['supplier_id']], one=True)
    category = query_db(current_app, 'SELECT * FROM categories WHERE category_id = ?', [data['category_id']], one=True)

    if not supplier or not category:
        return jsonify({'message':'Invalid supplier_id or category_id'}), 400

    execute_query(current_app, '''
        UPDATE products
        SET item_code = ?, name = ?, description = ?, supplier_id = ?, category_id = ?,
        unit_cost = ?, selling_price = ?, is_vat_exempt = ?, is_active = ?
        WHERE product_id = ?
    ''', [data['item_code'], data['name'], data.get('description'), data['supplier_id'], data['category_id'],
          data['unit_cost'], data['selling_price'], data['is_vat_exempt'], data['is_active'], product_id])
    updated_product = query_db(current_app, 'SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    if not updated_product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(dict(updated_product))

@products_bp.route('/<int:product_id>', methods=['PATCH'])
@role_required(['Administrator', 'Manager'])
def partial_update_product(product_id):
    data = request.json
    updates = []
    args = []

    allowed_fields = ['item_code', 'name', 'description', 'supplier_id', 'category_id', 'unit_cost', 'selling_price', 'is_vat_exempt', 'is_active']
    for field in allowed_fields:
        if field in data:
            if field == 'supplier_id':
                supplier = query_db(current_app, 'SELECT * from suppliers WHERE supplier_id=?', [data['supplier_id']], one=True)
                if not supplier:
                    return jsonify({'message':'Invalid supplier_id'}), 400
            if field == 'category_id':
                category = query_db(current_app, 'SELECT * FROM categories WHERE category_id=?', [data['category_id']], one=True)
                if not category:
                    return jsonify({'message':'Invalid category_id'}), 400
            updates.append(f'{field} = ?')
            args.append(data[field])

    if not updates:
        return jsonify({'message': 'No valid fields to update'}), 400

    args.append(product_id)
    query = f'UPDATE products SET {", ".join(updates)} WHERE product_id = ?'
    execute_query(current_app, query, args)

    updated_product = query_db(current_app, 'SELECT * FROM products WHERE product_id = ?', [product_id], one=True)
    if not updated_product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify(dict(updated_product))

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_product(product_id):
    #Soft delete
    execute_query(current_app, 'UPDATE products SET is_active = 0 WHERE product_id = ?', [product_id])
    return jsonify({'message':'Product deactivated'}), 204