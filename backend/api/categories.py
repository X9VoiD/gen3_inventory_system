from flask import Blueprint, jsonify, g, request, current_app
from backend.database import query_db, execute_query
from backend.auth import role_required

categories_bp = Blueprint('categories', __name__, url_prefix='/api/v1/categories')

@categories_bp.route('', methods=['GET'])
def get_categories():
    categories = query_db(current_app, 'SELECT * FROM categories')
    return jsonify([dict(category) for category in categories])

@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = query_db(current_app, 'SELECT * FROM categories WHERE category_id = ?', [category_id], one=True)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    return jsonify(dict(category))

@categories_bp.route('', methods=['POST'])
@role_required(['Administrator', 'Manager'])
def create_category():
    data = request.json
    required_fields = ['name']
    if not all(field in data for field in required_fields):
        return jsonify({'message':'Missing required fields'}), 400

    category_id = execute_query(current_app, 'INSERT INTO categories (name) VALUES (?)', [data['name']])
    new_category = query_db(current_app, 'SELECT * FROM categories WHERE category_id = ?', [category_id], one=True)
    return jsonify(dict(new_category)), 201

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@role_required(['Administrator', 'Manager'])
def update_category(category_id):
    data = request.json
    required_fields = ['name']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    execute_query(current_app, 'UPDATE categories SET name = ? WHERE category_id = ?', [data['name'], category_id])
    updated_category = query_db(current_app, 'SELECT * FROM categories WHERE category_id = ?', [category_id], one=True)

    if not updated_category:
        return jsonify({'message': 'Category not found'}), 404
    return jsonify(dict(updated_category))

@categories_bp.route('/<int:category_id>', methods=['PATCH'])
@role_required(['Administrator', 'Manager'])
def partial_update_category(category_id):
    data = request.json
    if 'name' not in data:
        return jsonify({'message': 'No valid fields to update'}), 400

    execute_query(current_app, 'UPDATE categories SET name = ? WHERE category_id = ?', [data['name'], category_id])
    updated_category = query_db(current_app, 'SELECT * FROM categories WHERE category_id = ?', [category_id], one=True)
    if not updated_category:
        return  jsonify({'message':'Category not found'}), 404
    return jsonify(dict(updated_category))

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_category(category_id):
    # Check if category is in use
    products = query_db(current_app, 'SELECT * FROM products WHERE category_id = ?', [category_id])
    if products:
        return jsonify({'message': 'Cannot delete category with associated products.'}), 409

    execute_query(current_app, 'DELETE FROM categories WHERE category_id = ?', [category_id])
    return jsonify({'message': 'Category deleted'}), 204