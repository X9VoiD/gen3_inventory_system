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
