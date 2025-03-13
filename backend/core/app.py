from datetime import timedelta
import os
import os.path

from flask import Flask
from flask_cors import CORS

from core.database import close_db
from api.users import users_bp
from api.suppliers import suppliers_bp
from api.categories import categories_bp
from api.products import products_bp
from api.transactions import transactions_bp

def create_app(config_overrides=None):
    app = Flask(__name__)
    CORS(app)

    app.config['DATABASE'] = config_overrides.get('DATABASE', 'inventory.db')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = config_overrides.get('JWT_ACCESS_TOKEN_EXPIRES', timedelta(hours=1))  # Token expiration
    app.config['SECRET_KEY'] = config_overrides.get('SECRET_KEY', os.getenv('SECRET_KEY'))
    app.config['JWT_SECRET_KEY'] = config_overrides.get('JWT_SECRET_KEY', os.getenv('JWT_SECRET_KEY'))

    # Check if database file exists
    if not os.path.exists(app.config['DATABASE']):
        print(f"Error: Database file '{app.config['DATABASE']}' does not exist. Exiting.")
        exit(1)

     # Check for SECRET_KEY
    if 'SECRET_KEY' not in app.config or not app.config['SECRET_KEY']:
        print("Error: SECRET_KEY is not set. Please set it in your environment variables.")
        exit(1)

    # Check for JWT_SECRET_KEY
    if 'JWT_SECRET_KEY' not in app.config or not app.config['JWT_SECRET_KEY']:
        print("Error: JWT_SECRET_KEY is not set. Please set it in your environment variables.")
        exit(1)

    # Register blueprints
    app.register_blueprint(users_bp)
    app.register_blueprint(suppliers_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(transactions_bp)

    app.teardown_appcontext(close_db)

    return app