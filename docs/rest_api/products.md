### 5. Product Management

#### 5.1. Get All Products

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/products`
*   **Description:** Retrieves a list of all products. Supports filtering via query parameters.
*   **Authentication:** Required (token authentication)
*   **Query Parameters (Optional):**
    *   `category_id` (integer): Filter by category ID.
    *   `supplier_id` (integer): Filter by supplier ID.
    *   `item_code` (string): Filter by item code.
    *   `name` (string): Filter by product name (partial match).
    *   `is_active` (integer, 0 or 1): Filter by active status.
    *   `stock_on_hand_lte` (integer): Filter by the stock on hand less than or equal to the number.
    *   `stock_on_hand_gte` (integer): Filter by the stock on hand greater than or equal to the number.
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

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/products/{product_id}`
*   **Description:** Retrieves a specific product by ID.
*   **Authentication:** Required (token authentication)
*   **Parameters:**
    *   `product_id` (integer, required): The ID of the product.
*   **Response (200 OK):**

    ```json
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
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Product not found"
    }
    ```

#### 5.3. Create Product

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/products`
*   **Description:** Creates a new product.
*   **Authentication:** Required (Administrator or Manager role)
*   **Request Body:**

    ```json
    {
        "item_code": "NB-002",
        "name": "Notebook",
        "description": "100 leaves",
        "supplier_id": 1,
        "category_id": 4,
        "unit_cost": 10.00,
        "selling_price": 12.00,
        "is_vat_exempt": 0
    }
    ```

*   **Response (201 Created):**

    ```json
    {
        "product_id": 3,
        "item_code": "NB-002",
        "name": "Notebook",
        "description": "100 leaves",
        "supplier_id": 1,
        "category_id": 4,
        "unit_cost": 10.00,
        "selling_price": 12.00,
        "is_vat_exempt": 0,
        "stock_on_hand": 0,
        "is_active": 1
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields" // or "Invalid supplier_id or category_id"
    }
    ```

#### 5.4. Update Product (PUT - Complete Replacement)

*   **Method:** `PUT`
*   **Endpoint:** `/api/v1/products/{product_id}`
*   **Description:** Updates a product's information (complete replacement).
*   **Authentication:** Required (Administrator or Manager role)
*   **Parameters:**
    *   `product_id` (integer, required): The ID of the product.
*   **Request Body:**

    ```json
    {
        "item_code": "NB-003",
        "name": "Updated Notebook",
        "description": "120 leaves",
        "supplier_id": 2,
        "category_id": 4,
        "unit_cost": 11.00,
        "selling_price": 13.00,
        "is_vat_exempt": 1,
        "is_active": 1
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "product_id": 3,
        "item_code": "NB-003",
        "name": "Updated Notebook",
        "description": "120 leaves",
        "supplier_id": 2,
        "category_id": 4,
        "unit_cost": 11.00,
        "selling_price": 13.00,
        "is_vat_exempt": 1,
        "stock_on_hand": 0,
        "is_active": 1
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields for PUT" // or "Invalid supplier_id or category_id"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Product not found"
    }
    ```

#### 5.5. Update Product (PATCH - Partial Update)

*   **Method:** `PATCH`
*   **Endpoint:** `/api/v1/products/{product_id}`
*   **Description:** Partially updates a product's information.
*   **Authentication:** Required (Administrator or Manager role)
*   **Parameters:**
    *   `product_id` (integer, required): The ID of the product.
*   **Request Body:**

    ```json
    {
        "name": "Partially Updated Product Name", // Optional
        "selling_price": 14.00, // Optional
        "is_active": 0 // Optional
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "product_id": 3,
        "item_code": "NB-003",
        "name": "Partially Updated Notebook",
        "description": "120 leaves",
        "supplier_id": 2,
        "category_id": 4,
        "unit_cost": 11.00,
        "selling_price": 14.00,
        "is_vat_exempt": 1,
        "stock_on_hand": 0,
        "is_active": 0
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "No valid fields to update" // or  "Invalid supplier_id or category_id"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Product not found"
    }
    ```

#### 5.6. Deactivate Product

*   **Method:** `DELETE`
*   **Endpoint:** `/api/v1/products/{product_id}`
*   **Description:** Deactivates a product (soft delete).
*   **Authentication:** Required (Administrator role)
*   **Parameters:**
    *   `product_id` (integer, required): The ID of the product.
*   **Response (204 No Content):** (Empty body)
