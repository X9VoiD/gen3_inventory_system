from flask import Blueprint, request, jsonify, g, current_app
from core.auth import token_required, role_required
from core.database import query_db, execute_query

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/api/v1/suppliers')

@suppliers_bp.route('', methods=['GET'])
@token_required
def get_suppliers():
    suppliers = query_db(current_app, 'SELECT * FROM suppliers')
    return jsonify([dict(supplier) for supplier in suppliers])

@suppliers_bp.route('/<int:supplier_id>', methods=['GET'])
@token_required
def get_supplier(supplier_id):
    supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id = ?', [supplier_id], one=True)
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    return jsonify(dict(supplier))

@suppliers_bp.route('', methods=['POST'])
@role_required(['Administrator', 'Manager'])
def create_supplier():
    data = request.json
    required_fields = ['name']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    supplier_id = execute_query(current_app, 'INSERT INTO suppliers (name, contact_info) VALUES (?, ?)',
                               [data.get('name'), data.get('contact_info')])
    new_supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id = ?', [supplier_id], one=True)
    return jsonify(dict(new_supplier)), 201

@suppliers_bp.route('/<int:supplier_id>', methods=['PUT'])
@role_required(['Administrator', 'Manager'])
def update_supplier(supplier_id):
    data = request.json
    required_fields = ['name', 'contact_info']

    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}),400

    execute_query(current_app, 'UPDATE suppliers SET name = ?, contact_info = ? WHERE supplier_id = ?',
                  [data['name'], data.get('contact_info'), supplier_id])

    updated_supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id = ?', [supplier_id], one=True)
    if not updated_supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    return jsonify(dict(updated_supplier))

@suppliers_bp.route('/<int:supplier_id>', methods=['PATCH'])
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
    execute_query(current_app, query, args)

    updated_supplier = query_db(current_app, 'SELECT * FROM suppliers WHERE supplier_id = ?',[supplier_id], one=True)
    if not updated_supplier:
        return jsonify({'message': 'Supplier not found'}),404

    return jsonify(dict(updated_supplier))

@suppliers_bp.route('/<int:supplier_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_supplier(supplier_id):
    # Check if the supplier has associated products or transactions
    products = query_db(current_app, 'SELECT * FROM products WHERE supplier_id = ?', [supplier_id])
    transactions = query_db(current_app, 'SELECT * FROM transactions WHERE supplier_id=?', [supplier_id])
    if products or transactions:
        return jsonify({'message': 'Cannot delete supplier with associated products or transactions'}), 409

    execute_query(current_app, 'DELETE FROM suppliers WHERE supplier_id = ?', [supplier_id])
    return jsonify({'message': 'Supplier deleted'}), 204