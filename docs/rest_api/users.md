### 2. User Management (Administrator Only)

#### 2.1. Get All Users

*   **Method:** `GET`
*   **Endpoint:** `/api/v1/users`
*   **Description:** Retrieves a list of all users.
*   **Authentication:** Required (Administrator role)
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
*   **Authentication:** Required (Administrator or the user themselves)
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
*   **Response (403 Forbidden):**
    ```json
    {
        "message": "Unauthorized"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "User not found"
    }
    ```

#### 2.3. Create User

*   **Method:** `POST`
*   **Endpoint:** `/api/v1/users`
*   **Description:** Creates a new user.
*   **Authentication:** Required (Administrator role)
*   **Request Body:**

    ```json
    {
        "username": "newuser",
        "password": "secure_password",
        "role": "Staff"
        // Role must be one of "Administrator", "Manager", "Staff"
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
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields" // or "Invalid role"
    }
    ```

#### 2.4. Update User (PUT - Complete Replacement)

*   **Method:** `PUT`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Updates a user's information (complete replacement).
*   **Authentication:** Required (Administrator or the user themselves)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Request Body:**

    ```json
    {
        "username": "updateduser",
        "password": "new_secure_password",
        "role": "Manager",
        "is_active": 1
         // Role must be one of "Administrator", "Manager", "Staff"
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
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "Missing required fields for PUT" // or "Invalid role"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "User not found"
    }
    ```
*   **Response (403 Forbidden):**
    ```json
    {
        "message": "Unauthorized"
    }
    ```

#### 2.5. Update User (PATCH - Partial Update)

*   **Method:** `PATCH`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Partially updates a user's information.
*   **Authentication:** Required (Administrator or the user themselves)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Request Body:**

    ```json
    {
        "password": "new_secure_password",
        "role": "Staff", // Optional, Role must be one of "Administrator", "Manager", "Staff"
        "username": "newUsername", // Optional
        "is_active": 0 // Optional
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
*   **Response (400 Bad Request):**
    ```json
    {
        "message": "No valid fields to update" // or "Invalid role"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
        "message": "User not found"
    }
    ```
*   **Response (403 Forbidden):**
    ```json
    {
        "message": "Unauthorized"
    }
    ```


#### 2.6. Deactivate User

*   **Method:** `DELETE`
*   **Endpoint:** `/api/v1/users/{user_id}`
*   **Description:** Deactivates a user (soft delete).
*   **Authentication:** Required (Administrator role)
*   **Parameters:**
    *   `user_id` (integer, required): The ID of the user.
*   **Response (204 No Content):**  (Empty body)
