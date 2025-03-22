### 3. Supplier Management

#### 3.1. Get All Suppliers

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/suppliers`
*   **Description:** Retrieves a list of all suppliers.
*   **Authentication:** Required (token authentication)
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

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/suppliers/{supplier_id}`
*   **Description:** Retrieves a specific supplier by ID.
*   **Authentication:** Required (token authentication)
*   **Parameters:**
    *   `supplier_id` (integer, required): The ID of the supplier.
*   **Response (200 OK):**

    ```json
    {
        "supplier_id": 1,
        "name": "Supplier A",
        "contact_info": "123 Main St"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Supplier not found"
    }
    ```

#### 3.3. Create Supplier

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/suppliers`
*   **Description:** Creates a new supplier.
*   **Authentication:** Required (Administrator or Manager role)
*   **Request Body:**

    ```json
    {
        "name": "Supplier C",
        "contact_info": "789 Oak St" // Optional
    }
    ```

*   **Response (201 Created):**

    ```json
    {
        "supplier_id": 3,
        "name": "Supplier C",
        "contact_info": "789 Oak St"
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields"
    }
    ```

#### 3.4. Update Supplier (PUT - Complete Replacement)

*   **Method:** `PUT`
*   **Endpoint:** `/api/v1/suppliers/{supplier_id}`
*   **Description:** Updates a supplier's information (complete replacement).
*   **Authentication:** Required (Administrator or Manager role)
*   **Parameters:**
    *   `supplier_id` (integer, required): The ID of the supplier.
*   **Request Body:**

    ```json
    {
        "name": "Updated Supplier A",
        "contact_info": "Updated Address"
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "supplier_id": 1,
        "name": "Updated Supplier A",
        "contact_info": "Updated Address"
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Supplier not found"
    }
    ```

#### 3.5. Update Supplier (PATCH - Partial Update)

*   **Method:** `PATCH`
*   **Endpoint:** `/api/v1/suppliers/{supplier_id}`
*   **Description:** Partially updates a supplier's information.
*   **Authentication:** Required (Administrator or Manager role)
*   **Parameters:**
    *   `supplier_id` (integer, required): The ID of the supplier.
*   **Request Body:**

    ```json
    {
        "name": "Partially Updated Supplier A", // Optional
        "contact_info": "Partially Updated Address" // Optional
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "supplier_id": 1,
        "name": "Partially Updated Supplier A",
        "contact_info": "Partially Updated Address"
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "No valid fields to update"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Supplier not found"
    }
    ```

#### 3.6. Delete Supplier

*   **Method:** `DELETE`
*   **Endpoint:** `/api/v1/suppliers/{supplier_id}`
*   **Description:** Deletes a supplier. Checks for associated products or transactions before deleting.
*   **Authentication:** Required (Administrator role)
*   **Parameters:**
    *   `supplier_id` (integer, required): The ID of the supplier.
*   **Response (204 No Content):** (Empty body)
*   **Response (409 Conflict):**
    ```json
    {
        "message": "Cannot delete supplier with associated products or transactions"
    }
