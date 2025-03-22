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

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/categories/{category_id}`
*   **Description:** Retrieves a specific category by ID.
*   **Authentication:** Not Required
*   **Parameters:**
    *   `category_id` (integer, required): The ID of the category.
*   **Response (200 OK):**

    ```json
    {
        "category_id": 1,
        "name": "College Books"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "Category not found"
    }
    ```

#### 4.3. Create Category

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/categories`
*   **Description:** Creates a new category.
*   **Authentication:** Required (Administrator or Manager role)
*   **Request Body:**

    ```json
    {
        "name": "New Category Name"
    }
    ```

*   **Response (201 Created):**

    ```json
    {
        "category_id": 5,
        "name": "New Category Name"
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields"
    }
    ```

#### 4.4. Update Category (PUT - Complete Replacement)

*   **Method:** `PUT`
*   **Endpoint:** `/api/v1/categories/{category_id}`
*   **Description:** Updates a category's information (complete replacement).
*   **Authentication:** Required (Administrator or Manager role)
*   **Parameters:**
    *   `category_id` (integer, required): The ID of the category.
*   **Request Body:**

    ```json
    {
        "name": "Updated Category Name"
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "category_id": 1,
        "name": "Updated Category Name"
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
        "message": "Category not found"
    }
    ```

#### 4.5. Update Category (PATCH - Partial Update)

*   **Method:** `PATCH`
*   **Endpoint:** `/api/v1/categories/{category_id}`
*   **Description:** Partially updates a category's information.
*   **Authentication:** Required (Administrator or Manager role)
*   **Parameters:**
    *   `category_id` (integer, required): The ID of the category.
*   **Request Body:**

    ```json
    {
        "name": "Partially Updated Category Name" // Optional
    }
    ```

*   **Response (200 OK):**

    ```json
    {
        "category_id": 1,
        "name": "Partially Updated Category Name"
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
        "message": "Category not found"
    }
    ```

#### 4.6. Delete Category

*   **Method:** `DELETE`
*   **Endpoint:** `/api/v1/categories/{category_id}`
*   **Description:** Deletes a category. Checks for associated products before deleting.
*   **Authentication:** Required (Administrator role)
*   **Parameters:**
    *   `category_id` (integer, required): The ID of the category.
*   **Response (204 No Content):** (Empty body)
*   **Response (409 Conflict):**
    ```json
    {
        "message": "Cannot delete category with associated products."
    }
