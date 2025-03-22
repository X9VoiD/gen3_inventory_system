### 6. Transaction Management

#### 6.1. Get All Transactions

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/transactions`
*   **Description:** Retrieves a list of all transactions. Supports filtering via query parameters.
*   **Authentication:** Required (token authentication)
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

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/transactions/{transaction_id}`
*   **Description:** Retrieves a specific transaction by ID.
*   **Authentication:** Required (token authentication)
*   **Parameters:**
    *   `transaction_id` (integer, required): The ID of the transaction.
*   **Response (200 OK):**

    ```json
    {
        "transaction_id": 1,
        "product_id": 1,
        "transaction_type": "Delivery",
        "quantity": 100,
        "transaction_date": "2023-10-27T10:00:00",
        "supplier_id": 1,
        "user_id": 1,
        "price": null
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Transaction not found"
    }
    ```

#### 6.3. Create Transaction

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/transactions`
*   **Description:** Creates a new transaction.
*   **Authentication:** Required (token authentication)
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
*   **Request Body (Example - Return):**

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
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields" // or "Invalid transaction type" or "Invalid product_id" or "Invalid user_id" or "supplier_id is required for Delivery and Pull-out transactions"
    }
