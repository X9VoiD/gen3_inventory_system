# Inventory Management System REST API Documentation

This document describes the REST API for the Inventory Management System. This API allows for managing users, suppliers, categories, products, and inventory transactions.

**Base URL:** `https://<your-tailscale-machine-name>.ts.net/api/v1/`

(Replace `<your-tailscale-machine-name>` with your Tailscale machine name.)

**Authentication:**

[See Authentication Documentation](./authentication.md)

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

## Endpoints Documentation

*   [1. Authentication](./authentication.md)
*   [2. User Management](./users.md)
*   [3. Supplier Management](./suppliers.md)
*   [4. Category Management](./categories.md)
*   [5. Product Management](./products.md)
*   [6. Transaction Management](./transactions.md)

This documentation provides a comprehensive overview of the Inventory Management System REST API. It includes details on authentication, error handling, data formats, user roles, and all available endpoints with links to their detailed documentation. This document should be used in conjunction with the API implementation and the User Requirements document.
