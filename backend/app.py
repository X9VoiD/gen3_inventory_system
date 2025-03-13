from datetime import timedelta

from flask import Flask
from flask_cors import CORS

from backend.database import close_db, get_db
from backend.api.users import users_bp
from backend.api.suppliers import suppliers_bp
from backend.api.categories import categories_bp
from backend.api.products import products_bp
from backend.api.transactions import transactions_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['DATABASE'] = 'inventory.db'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token expiration

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