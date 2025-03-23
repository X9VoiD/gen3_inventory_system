import sqlite3
from flask import g

DATABASE_NAME = 'inventory.db'

def get_db(app=None):
    if app is not None:
        db_path = app.config['DATABASE']
    else:
        db_path = DATABASE_NAME  # Default path for non-test environment
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row  # Access columns by name
    return db

def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(app, query, args=(), one=False):
    cur = get_db(app).execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_query(app, query, args=()):
    db = get_db(app)
    cur = db.execute(query, args)
    db.commit()
    lastrowid = cur.lastrowid
    cur.close()
    return lastrowid

def init_db(app):
    db = get_db(app)
    with app.app_context():
        sql_script = """
-- Create the users table
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Staff')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    refresh_token TEXT
);

-- Create the suppliers table
CREATE TABLE suppliers (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    contact_info TEXT
);

-- Create the categories table
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Create the products table
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    supplier_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
    selling_price REAL NOT NULL CHECK (selling_price >= 0),
    is_vat_exempt INTEGER NOT NULL CHECK (is_vat_exempt IN (0, 1)),
    stock_on_hand REAL NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- Create the transactions table
CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Delivery', 'Pull-out', 'Sale', 'Return')),
    quantity REAL NOT NULL,
    transaction_date TEXT NOT NULL,
    supplier_id INTEGER,
    user_id INTEGER NOT NULL,
    price REAL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Create triggers to update stock_on_hand

-- Trigger for INSERT operations
CREATE TRIGGER update_stock_on_hand_insert
AFTER INSERT ON transactions
BEGIN
    UPDATE products
    SET stock_on_hand = CASE
        WHEN NEW.transaction_type = 'Delivery' THEN stock_on_hand + NEW.quantity
        WHEN NEW.transaction_type IN ('Sale', 'Pull-out', 'Return') THEN stock_on_hand - NEW.quantity
        ELSE stock_on_hand -- Handle other transaction types if needed, or do nothing
    END
    WHERE product_id = NEW.product_id;
END;

--Trigger for UPDATE operations
CREATE TRIGGER update_stock_on_hand_update
AFTER UPDATE ON transactions
BEGIN
	UPDATE products
	SET stock_on_hand = stock_on_hand
        + CASE
            WHEN NEW.transaction_type = 'Delivery' THEN NEW.quantity - OLD.quantity
            WHEN NEW.transaction_type IN ('Sale', 'Pull-out', 'Return') THEN -(NEW.quantity - OLD.quantity)
            ELSE 0 -- Handle other transaction types if needed, or do nothing
        END
	WHERE product_id = NEW.product_id;
END;

-- Trigger for DELETE operations
CREATE TRIGGER update_stock_on_hand_delete
AFTER DELETE ON transactions
BEGIN
    UPDATE products
    SET stock_on_hand = stock_on_hand + CASE
        WHEN OLD.transaction_type = 'Delivery' THEN -OLD.quantity
        WHEN OLD.transaction_type IN ('Sale', 'Pull-out', 'Return') THEN OLD.quantity
        ELSE 0 -- Handle other transaction types if needed, or do nothing
    END
    WHERE product_id = OLD.product_id;
END;

-- Insert initial categories
INSERT INTO categories (name) VALUES ('College Books');
INSERT INTO categories (name) VALUES ('Basic Ed Books');
INSERT INTO categories (name) VALUES ('Uniforms');
INSERT INTO categories (name) VALUES ('School Supplies');
        """
        db.executescript(sql_script)
        db.commit()
        print("Database initialized.")
