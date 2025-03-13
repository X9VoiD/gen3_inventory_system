# Inventory Management System

## Project Overview

This project is a web-based inventory management system designed to track products, manage suppliers, categories, and record transactions (deliveries, pull-outs, sales, and returns). It provides a REST API for interacting with the system and supports multiple user roles with different levels of access.

## Features

The system provides the following key features, based on the user requirements document (`docs/user_requirements.md`):

*   **User Management (Administrator only):**
    *   Create, edit, and deactivate user accounts.
    *   Assign roles (Administrator, Manager, Staff) to users.
    *   Manage user passwords.
*   **Product Management (Administrator and Manager):**
    *   Add, edit, and deactivate products.
    *   Manage product information (Item Code, Name, Description, Supplier, Category, Unit Cost, Selling Price, VAT Exemption).
    *   Search for products.
*   **Inventory Tracking (All Users):**
    *   Record deliveries, pull-outs (returns to suppliers), sales, and customer returns.
    *   Track stock on hand.
    *   View transaction history.
*   **Reporting (All Users):**
    *   Generate reports on stock on hand, sales, unsold items, deliveries, pull-outs, and transaction history.
    *   Filter and sort reports.
    *   Export reports to Excel.

## User Roles

The system supports the following user roles:

*   **Administrator:** Full access to all system features.
*   **Manager:** Access to product management, inventory tracking, and reporting.
*   **Staff:** Access to basic inventory tracking and limited reporting.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd inventory_system
    ```

2.  **Create a virtual environment (recommended):**

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use .venv\Scripts\activate
    ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set environment variables:**

    You need to set the following environment variables:

    *   `SECRET_KEY`: A strong, random secret key for Flask.
    *   `JWT_SECRET_KEY`: A strong, random secret key for JWT authentication.

    You can set these in your shell or create a `.env` file in the project root:

    ```
    SECRET_KEY=<your_secret_key>
    JWT_SECRET_KEY=<your_jwt_secret_key>
    ```
     **Note:** You may use a tool like `python-dotenv` to load environment variables from a `.env` file.

5.  **Initialize the database and create an admin user:**

    Run the `bootstrap_server.py` script, providing a username and password for the initial administrator account:

    ```bash
    python backend/bootstrap_server.py <admin_username> <admin_password>
    ```

6.  **Start the server:**

    ```bash
    python backend/server.py
    ```

    The server will be running on `http://0.0.0.0:5000`.

## Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Build the static site:**

    ```bash
    npm run build
    ```

    This will create a `dist` directory containing the compiled frontend files.

## Deployment with Caddy

Caddy is a powerful, open-source web server with automatic HTTPS. We'll use it as a reverse proxy to serve both the frontend and backend.

1.  **Install Caddy:** Follow the instructions on the official Caddy website ([https://caddyserver.com/docs/install](https://caddyserver.com/docs/install)) for your operating system.

2.  **Create a Caddyfile:** Create a file named `Caddyfile` in the project root directory (same level as this README.md).

3.  **Configure Caddyfile:** Add the following configuration to your `Caddyfile`, replacing `your_domain.com` with your actual domain name (or use `:80` for local development without a domain):

    ```caddy
    your_domain.com {
        root * frontend/dist
        file_server

        @backend {
            path /api/*
        }
        reverse_proxy @backend http://localhost:5000
    }

    # For local development without a domain, use:
    # :80 {
    #     root * frontend/dist
    #     file_server
    #
    #     @backend {
    #          path /api/*
    #     }
    #     reverse_proxy @backend http://localhost:5000
    # }
    ```

    **Explanation:**

    *   `your_domain.com`:  This is the domain name where your application will be accessible.  If you don't have a domain, you can use `:80` for local testing (access via `http://localhost`).
    *   `root * frontend/dist`:  This tells Caddy to serve files from the `frontend/dist` directory (where the built frontend files are located).
    *   `file_server`: Enables serving static files.
    *   `@backend { path /api/* }`: This defines a matcher named `@backend` that matches any request path starting with `/api/`.
    *   `reverse_proxy @backend http://localhost:5000`: This proxies requests matching the `@backend` matcher to your backend server running on `http://localhost:5000`.

4.  **Run Caddy:**

    ```bash
    caddy run
    ```
    If you would like to use a different Caddyfile path:
    ```
    caddy run --config /path/to/your/Caddyfile
    ```

    Caddy will automatically obtain and manage TLS certificates if you've configured a domain name.  If you're using `:80` for local development, it will serve over plain HTTP.

5.  **Access your application:**  Open your web browser and go to your domain name (or `http://localhost` if you're using `:80`).

## Deployment Instructions (using Tailscale Funnel)

Tailscale Funnel allows you to expose your local server to the internet securely.

1.  **Install Tailscale:** Follow the instructions on the Tailscale website ([https://tailscale.com/download](https://tailscale.com/download)) to install Tailscale on your machine.

2.  **Authenticate with Tailscale:**

    ```bash
    tailscale up
    ```

    This will prompt you to authenticate with your Tailscale account.

3.  **Enable Funnel:**

    ```bash
    tailscale serve https / http://localhost:5000
    tailscale funnel 5000
    ```

   This command tells Tailscale to expose your local server running on port 5000 to the internet via a Tailscale Funnel. It will provide you with a unique Tailscale URL (e.g., `https://your-tailscale-name.ts.net`).

4. **Access your application:** You can now access your inventory management system through the Tailscale URL provided.

**Important Notes on Tailscale Funnel:**

*   **Security:** Tailscale Funnel uses HTTPS encryption, providing a secure connection.
*   **Authentication:** By default, anyone with the Tailscale URL can access your application. You can configure Tailscale to require authentication.
*   **Availability:** Your application will only be accessible while your server is running and Tailscale Funnel is enabled.

## API Documentation

The system provides a REST API organized by resource (users, suppliers, categories, products, transactions). The API endpoints are defined in the `backend/api` directory. You can use tools like Postman or curl to interact with the API. The base URL for the API is `/api/v1/`.