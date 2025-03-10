# Inventory Management System REST22222222 API Documentation

This document describes the REST API for the Inventory Management System. This API allows for managing users, suppliers, categories, products, and inventory transactions.

**Base URL:** `https://<your-tailscale-machine-name>.ts.net/api/v1/`

(Replace `<your-tailscale-machine-name>` with your Tailscale machine name.)

**Authentication:**

Most API endpoints require authentication using a JSON Web Token (JWT).  Obtain a token by sending a `POST` request to `/api/v1/login` with your username and password.  Include the token in the `Authorization` header of subsequent requests:

```
Authorization: Bearer <token>
```

**Error Handling:**

The API uses standard HTTP status codes to indicate success or failure.  Error responses will include a JSON body with a `message` field describing the error.

*   **200 OK:** Successful request (GET, PUT, PATCH, DELETE).
*   **201 Created:** Successful creation of a new resource (POST).
*   **204 No Content:** Successful request, but no content to return (e.g., successful DELETE, deactivation).
*   **400 Bad Request:** Invalid request data (e.g., missing required fields, invalid data types).
*   **401 Unauthorized:** Authentication required (user not logged in or invalid token).
*   **403 Forbidden:** User is authenticated but doesn't have permission to access the resource.
*   **404 Not Found:** Resource not found.
*   **409 Conflict:** Request conflicts with the current state of the resource.
*   **500 Internal Server Error:** An unexpected error occurred on the server.

**Data Formats:**

*   **Request and Response Bodies:** JSON
*   **Dates and Times:** ISO 8601 format (e.g., "2023-10-27T14:30:00")

**User Roles:**

The system has three user roles:

*   **Administrator:** Full access to all features.
*   **Manager:** Access to product management, inventory tracking, and reporting.
*   **Staff:** Access to basic inventory tracking and limited reporting.

---

## Endpoints

### 1. Authentication

#### 1.1. Login

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/login`
*   **Description:** Authenticates a user and returns a JWT.
*   **Request Body:**

    ```json
    {
        "username": "your_username",
        "password": "your_password"
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "token": "your_jwt_token"
    }
    ```

*   **Response (401 Unauthorized):**

    ```json
    {
        "message": "Could not verify",
        "WWW-Authenticate": "Basic realm=\"Login required!\""
    }
    ```

*   **Response (404 Not Found):**

    ```json
    {
        "message": "User not found"
    }
    ```

### 2. User Management (Administrator Only)

#### 2.1. Get All Users

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/users`
*   **Description:** Retrieves a list of all users.
*   **Authentication:** Required (Administrator)
*   **Response (200 OK):**

    ```json
    [
        {
            "user_id": 1,
            "username": "admin",
            "role": "Administrator",
            "is_active": 1
        },
        {
            "user_id": 2,
            "username": "manager1",
            "role": "Manager",
            "is_active": 1
        }
    ]
    ```

#### 2.2. Get User by ID

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Retrieves a specific user by ID.
*   **Authentication:** Required (Administrator, or user getting their own info)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Response (200 OK):**

    ```json
    {
        "user_id": 1,
        "username": "admin",
        "role": "Administrator",
        "is_active": 1
    }
    ```
* **Response (403 Forbidden):**
   ```json
   {
       "message": "Unauthorized"
   }
   ```

#### 2.3. Create User

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/users`
*   **Description:** Creates a new user.
*   **Authentication:** Required (Administrator)
*   **Request Body:**

    ```json
    {
        "username": "newuser",
        "password": "secure_password",
        "role": "Staff"
    }
    ```

*   **Response (201 Created):**

    ```json
    {
        "user_id": 3,
        "username": "newuser",
        "role": "Staff",
        "is_active": 1
    }
    ```

#### 2.4. Update User (PUT - Complete Replacement)

*   **Method:** `PUT`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Updates a user's information (complete replacement).
*   **Authentication:** Required (Administrator, or user updating their own info)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Request Body:**

    ```json
    {
        "username": "updateduser",
        "password": "new_secure_password",
        "role": "Manager",
        "is_active": 1
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "user_id": 3,
        "username": "updateduser",
        "role": "Manager",
        "is_active": 1
    }
    ```

#### 2.5. Update User (PATCH - Partial Update)

*   **Method:** `PATCH`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Partially updates a user's information.
*   **Authentication:** Required (Administrator, or user updating their own info)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Request Body:**

    ```json
    {
        "password": "new_secure_password"
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "user_id": 3,
        "username": "updateduser",
        "role": "Manager",
        "is_active": 1
    }
    ```
#### 2.6. Deactivate User

*   **Method:** `DELETE`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Deactivates a user (soft delete).
*   **Authentication:** Required (Administrator)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Response (204 No Content):**  (Empty body)

### 3. Supplier Management

#### 3.1. Get All Suppliers

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/suppliers`
*   **Description:** Retrieves a list of all suppliers.
*   **Authentication:** Required
*   **Response (200 OK):**

    ```json
    [
        {
            "supplier_id": 1,
            "name": "Supplier A",
            "contact_info": "123 Main St"
        },
        {
            "supplier_id": 2,
            "name": "Supplier B",
            "contact_info": "456 Elm St"
        }
    ]
    ```

#### 3.2. Get Supplier by ID
(Similar to Get All Suppliers, but returns a single supplier object)

#### 3.3. Create Supplier
(Similar to Create User, but with supplier-specific fields)

#### 3.4. Update Supplier (PUT)
(Similar to Update User (PUT), but with supplier-specific fields)

#### 3.5. Update Supplier (PATCH)
 (Similar to Update User (PATCH), but with supplier-specific fields)

#### 3.6. Delete Supplier
(Similar to Deactivate User, but checks for associated products/transactions before deleting)

### 4. Category Management

#### 4.1. Get All Categories

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/categories`
*   **Description:** Retrieves a list of all categories.
*   **Authentication:** Not Required
*   **Response (200 OK):**

    ```json
    [
        {
            "category_id": 1,
            "name": "College Books"
        },
        {
            "category_id": 2,
            "name": "Basic Ed Books"
        },
        {
            "category_id": 3,
            "name": "Uniforms"
        },
        {
            "category_id": 4,
            "name": "School Supplies"
        }
    ]
    ```

#### 4.2. Get Category by ID
(Similar to Get All Categories, but returns a single category object)

### 5. Product Management

#### 5.1. Get All Products

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/products`
*   **Description:** Retrieves a list of all products. Supports filtering via query parameters.
*   **Authentication:** Required
*   **Query Parameters (Optional):**
    *   `category_id` (integer): Filter by category ID.
    *   `supplier_id` (integer): Filter by supplier ID.
    *   `item_code` (string): Filter by item code.
    *   `name` (string): Filter by product name (partial match).
    *   `is_active` (integer, 0 or 1): Filter by active status.
    *  `stock_on_hand_lte` (integer): Filter by the stock on hand less than or equal to the number.
    * `stock_on_hand_gte` (integer): Filter by the stock on hand greater than or equal to the number.
*   **Response (200 OK):**

    ```json
    [
        {
            "product_id": 1,
            "item_code": "NB-001",
            "name": "Spiral Notebook",
            "description": "80 leaves",
            "supplier_id": 1,
            "category_id": 4,
            "unit_cost": 8.50,
            "selling_price": 10.00,
            "is_vat_exempt": 0,
            "stock_on_hand": 98,
            "is_active": 1
        },
       {
            "product_id": 2,
            "item_code": "BP-002",
            "name": "Ballpen",
            "description": null,
            "supplier_id": 1,
            "category_id": 4,
            "unit_cost": 5.00,
            "selling_price": 6.00,
            "is_vat_exempt": 0,
            "stock_on_hand": 200,
            "is_active": 1
        }
    ]
    ```

#### 5.2. Get Product by ID
(Similar to get all products but with specific ID)
#### 5.3. Create Product
(Similar to create user but with product fields)
#### 5.4. Update Product (PUT)
(Similar to update user but with product fields)
#### 5.5. Update Product (PATCH)
(Similar to update user but with product fields)
#### 5.6. Deactivate Product
(Soft delete)

### 6. Transaction Management

#### 6.1. Get All Transactions

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/transactions`
*   **Description:** Retrieves a list of all transactions. Supports filtering via query parameters.
*   **Authentication:** Required
*   **Query Parameters (Optional):**
    *   `product_id` (integer): Filter by product ID.
    *   `transaction_type` (string): Filter by transaction type ("Delivery", "Pull-out", "Sale", "Return").
    *   `start_date` (string, ISO 8601 format): Filter by start date.
    *   `end_date` (string, ISO 8601 format): Filter by end date.
    *   `user_id` (integer): Filter by user ID.
    *   `supplier_id` (integer): Filter by supplier ID.
*   **Response (200 OK):**

    ```json
    [
        {
            "transaction_id": 1,
            "product_id": 1,
            "transaction_type": "Delivery",
            "quantity": 100,
            "transaction_date": "2023-10-27T10:00:00",
            "supplier_id": 1,
            "user_id": 1,
            "price": null
        },
        {
            "transaction_id": 2,
            "product_id": 1,
            "transaction_type": "Sale",
            "quantity": -2,
            "transaction_date": "2023-10-27T16:00:00",
            "supplier_id": null,
            "user_id": 2,
            "price": 10
        }
    ]
    ```

#### 6.2. Get Transaction by ID
(Similar to get all transactions but with specific ID)
#### 6.3. Create Transaction

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/transactions`
*   **Description:** Creates a new transaction.
*   **Authentication:** Required
*   **Request Body (Example - Delivery):**

    ```json
    {
        "product_id": 1,
        "transaction_type": "Delivery",
        "quantity": 50,
        "transaction_date": "2023-10-27T14:30:00",
        "supplier_id": 1,
        "user_id": 1
    }
    ```
*   **Request Body (Example - Sale):**

    ```json
    {
        "product_id": 1,
        "transaction_type": "Sale",
        "quantity": -2,
        "transaction_date": "2023-10-27T14:30:00",
        "user_id": 1,
         "price": 10
    }
    ```
* **Request Body (Example - Return):**

    ```json
    {
        "product_id": 1,
        "transaction_type": "Return",
        "quantity": 2,
        "transaction_date": "2023-10-30T14:30:00",
        "user_id": 1,
         "price": 10
    }
    ```

*   **Response (201 Created):**

    ```json
    {
        "transaction_id": 3,
        "product_id": 1,
        "transaction_type": "Delivery",
        "quantity": 50,
        "transaction_date": "2023-10-27T14:30:00",
        "supplier_id": 1,
        "user_id": 1,
        "price": null
    }
    ```

---

This documentation provides a comprehensive overview of the Inventory Management System REST API. It includes details on authentication, error handling, data formats, user roles, and all available endpoints with their request and response structures. This document should be used in conjunction with the API implementation and the User Requirements document.