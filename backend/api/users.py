from flask import Blueprint, request, jsonify, g, current_app
from core.auth import token_required, role_required, generate_auth_token, verify_password, hash_password
from core.database import query_db, execute_query

users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@users_bp.route('/login', methods=['POST'])
def login():
    auth = request.json
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Basic realm="Login required!"'}), 401

    user = query_db(current_app, 'SELECT * FROM users WHERE username = ?', [auth['username']], one=True)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if verify_password(bytes.fromhex(user['password']), auth['password']):
        token = generate_auth_token(current_app, user['user_id'])
        return jsonify({'token': token})

    return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Basic realm="Login required!"'}), 401

@users_bp.route('', methods=['GET'])
@role_required(['Administrator'])
def get_users():
    users = query_db(current_app, 'SELECT user_id, username, role, is_active FROM users')
    return jsonify([dict(user) for user in users])

@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
     # Allow admins to get any user, or users to get their own info
    if g.current_user['role'] != 'Administrator' and g.current_user['user_id'] != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    user = query_db(current_app, 'SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(dict(user))

@users_bp.route('', methods=['POST'])
@role_required(['Administrator'])
def create_user():
    data = request.json
    required_fields = ['username', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    if data['role'] not in ['Administrator', 'Manager', 'Staff']:
        return jsonify({'message': 'Invalid role'}), 400

    hashed_password = hash_password(data['password']).hex()  # Store as hex string
    user_id = execute_query(current_app, 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                           [data['username'], hashed_password, data['role']])

    new_user = query_db(current_app, 'SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)
    return jsonify(dict(new_user)), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
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
    execute_query(current_app, 'UPDATE users SET username = ?, password = ?, role = ?, is_active = ? WHERE user_id = ?',
                  [data['username'], hashed_password, data['role'], data['is_active'], user_id])

    updated_user = query_db(current_app, 'SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)

    if not updated_user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(dict(updated_user))

@users_bp.route('/<int:user_id>', methods=['PATCH'])
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
    execute_query(current_app, query, args)

    updated_user = query_db(current_app, 'SELECT user_id, username, role, is_active FROM users WHERE user_id = ?', [user_id], one=True)
    if not updated_user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(dict(updated_user))

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@role_required(['Administrator'])
def delete_user(user_id):
    # Soft delete (set is_active to 0)
    execute_query(current_app, 'UPDATE users SET is_active = 0 WHERE user_id = ?', [user_id])
    return jsonify({'message': 'User deactivated'}), 204