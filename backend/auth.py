import os
import secrets
from datetime import timedelta, timezone, datetime
from functools import wraps

from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidKey
import jwt
from flask import request, jsonify, g

from backend.database import query_db

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
            data = jwt.decode(token, g.app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = query_db(g.app, 'SELECT * FROM users WHERE user_id = ?', [data['user_id']], one=True)
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

def generate_auth_token(app, user_id):
     token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.now(timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'], algorithm="HS256")
     return token