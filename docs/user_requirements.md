**User Requirements Document**

**1. Introduction**

This document outlines the user requirements for the new inventory management system for Gen3 Bookstore. It details the functionalities the system must provide (functional requirements) and the qualities the system must possess (non-functional requirements).

**2. User Roles**

The system will support the following user roles with different levels of access and permissions:

*   **Administrator:** Full access to all system features, including user management, product management, inventory tracking, reporting, and configuration.
*   **Manager:** Access to product management, inventory tracking, and reporting features. Cannot manage users or system configuration.
*   **Staff:** Access to basic inventory tracking features (recording deliveries, pull-outs, sales, and returns) and limited reporting (e.g., viewing stock on hand). Cannot manage products, users, or system configuration.

**3. Functional Requirements**

Functional requirements describe *what* the system must do. They are organized by feature area.

**3.1. User Management (Administrator Only)**

*   **FR-UM-001:** The system shall allow the Administrator to create new user accounts.
*   **FR-UM-002:** The system shall allow the Administrator to assign a role (Administrator, Manager, Staff) to each user account.
*   **FR-UM-003:** The system shall allow the Administrator to set a username and password for each user account.
*   **FR-UM-004:** The system shall allow the Administrator to edit existing user accounts (e.g., change role, reset password).
*   **FR-UM-005:** The system shall allow the Administrator to deactivate user accounts.
*   **FR-UM-006:** The system shall require users to log in with their username and password.
*   **FR-UM-007:** The system shall enforce password complexity requirements (e.g., minimum length, mix of character types).

**3.2. Product Management (Administrator and Manager)**

*   **FR-PM-001:** The system shall allow the user to add new products to the inventory.
*   **FR-PM-002:** The system shall require the user to enter the following information for each new product:
    *   Item Code (existing code, mandatory)
    *   Item Name (mandatory)
    *   Description (optional)
    *   Supplier (mandatory)
    *   Unit Cost (mandatory)
    *   Selling Price (mandatory)
    *   Category (mandatory, from a predefined list: College Books, Basic Education Books, Uniforms, School Supplies)
    *   VAT-Exempt Status (Yes/No, mandatory)
*   **FR-PM-003:** The system shall automatically calculate the total price (with and without VAT) based on the Unit Cost, Selling Price, and VAT Amount.
*   **FR-PM-004:** The system shall allow the user to edit existing product information.
*   **FR-PM-005:** The system shall allow the user to search for products by Item Code, Item Name, Description, and Supplier.
*   **FR-PM-006:** The system shall prevent the creation of duplicate Item Codes.
*   **FR-PM-007:** The system shall allow decimal values for Unit Cost and Selling Price.
*   **FR-PM-008:** The system shall allow marking a product as inactive.

**3.3. Inventory Tracking (All Users)**

*   **FR-IT-001:** The system shall allow the user to record new deliveries of items.
*   **FR-IT-002:** The system shall allow the user to scan the barcode of a delivered item to automatically populate the Item Code.
*   **FR-IT-003:** The system shall allow the user to manually enter the Item Code if barcode scanning is not possible.
*   **FR-IT-004:** The system shall require the user to enter the following information for each delivery:
    *   Supplier (mandatory, from a list of existing suppliers)
    *   Delivery Date (mandatory, defaults to current date)
    *   Items and Quantities (mandatory)
*   **FR-IT-005:** The system shall automatically update the stock on hand for each item after a delivery is recorded.
*   **FR-IT-006:** The system shall allow the user to record pull-outs (returns to suppliers) of items.
*   **FR-IT-007:** The system shall allow the user to scan the barcode of a pulled-out item to automatically populate the Item Code.
*   **FR-IT-008:** The system shall allow the user to manually enter the Item Code if barcode scanning is not possible.
*   **FR-IT-009:** The system shall require the user to enter the following information for each pull-out:
    *   Supplier (mandatory, from a list of existing suppliers)
    *   Pull-out Date (mandatory, defaults to current date)
    *   Items and Quantities (mandatory)
*   **FR-IT-010:** The system shall automatically update the stock on hand for each item after a pull-out is recorded.
*   **FR-IT-011:** The system shall allow the user to record sales transactions.
*   **FR-IT-012:** The system shall allow the user to scan the barcode of a sold item to automatically populate the Item Code.
*   **FR-IT-013:** The system shall allow the user to manually enter the Item Code if barcode scanning is not possible.
*   **FR-IT-014:** The system shall require the user to enter the quantity of each item sold.
*   **FR-IT-015:** The system shall automatically calculate the total amount of the sale (including VAT).
*   **FR-IT-016:** The system shall automatically update the stock on hand for each item after a sale is recorded.
*   **FR-IT-017:** The system shall generate a basic receipt for each sale (including date, items, quantities, prices, and total amount).
*   **FR-IT-018:** The system shall allow the user to record customer returns.
*   **FR-IT-019:** The system shall allow the user to scan the barcode of a returned item to automatically populate the Item Code.
*   **FR-IT-020:** The system shall allow the user to manually enter the Item Code if barcode scanning is not possible.
*   **FR-IT-021:** The system shall require the user to enter the following information for each return:
    *   Return Date (mandatory, defaults to current date)
    *   Items and Quantities (mandatory)
    *   Reason for Return (mandatory, from a predefined list: Exchange, Refund, Other)
*   **FR-IT-022:** The system shall automatically update the stock on hand for each item after a return is recorded.
*   **FR-IT-023:** The system shall maintain a complete transaction history for all inventory movements (deliveries, pull-outs, sales, returns).
*   **FR-IT-024:** The system shall allow the user to view the transaction history, filterable by date range, supplier, transaction type, and item.
*   **FR-IT-025:** The system shall provide visual and auditory feedback upon successful barcode scan.
*    **FR-IT-026:** The system shall allow decimal values for quantity.

**3.4. Reporting (All Users)**

*   **FR-RP-001:** The system shall generate a Stock on Hand report showing the current quantity of each item in inventory.
*   **FR-RP-002:** The Stock on Hand report shall include the Item Code, Item Name, Description, and Quantity on Hand for each item.
*   **FR-RP-003:** The system shall generate a Sales report showing the items sold within a specified date range.
*   **FR-RP-004:** The Sales report shall exclude zero-sales items.
*   **FR-RP-005:** The Sales report shall include the Item Code, Item Name, Description, Quantity Sold, and Total Sales Amount for each item.
*   **FR-RP-006:** The system shall generate an Unsold Items report listing items with zero sales within a specified date range.
*   **FR-RP-007:** The system shall generate a Delivery report showing deliveries within a specified date range.
*   **FR-RP-008:** The Delivery report shall include the Supplier, Delivery Date, Item Code, Item Name, and Quantity Delivered for each delivery.
*   **FR-RP-009:** The system shall generate a Pull-out report showing pull-outs (returns to suppliers) within a specified date range.
*   **FR-RP-010:** The Pull-out report shall include the Supplier, Pull-out Date, Item Code, Item Name, and Quantity Pulled Out for each pull-out.
*   **FR-RP-011:** The system shall generate a Transaction History report showing all inventory movements (deliveries, pull-outs, sales, returns) within a specified date range.
*   **FR-RP-012:** The user shall be able to filter all reports by date range.
*   **FR-RP-013:** The user shall be able to filter the Delivery and Pull-out reports by supplier.
*   **FR-RP-014:** The user shall be able to sort reports by relevant columns (e.g., Item Code, Item Name, Quantity).
*   **FR-RP-015:** The user shall be able to print all reports.
*   **FR-RP-016:** The user shall be able to export all reports to Excel format.

**4. Non-Functional Requirements**

Non-functional requirements describe the *qualities* of the system, such as performance, security, usability, etc.

*   **NFR-PE-001 (Performance):** The system shall respond to user actions (e.g., data entry, report generation) within 2 seconds under normal operating conditions.
*   **NFR-PE-002 (Performance):** The system shall be able to handle up to 50 concurrent users without significant performance degradation. (Adjust this number based on expected usage).
*   **NFR-SE-001 (Security):** The system shall protect user data from unauthorized access.
*   **NFR-SE-002 (Security):** The system shall encrypt user passwords.
*   **NFR-SE-003 (Security):** The system shall log all user login attempts (successful and failed).
*   **NFR-US-001 (Usability):** The system shall have a clear, intuitive, and easy-to-navigate user interface.
*   **NFR-US-002 (Usability):** The system shall provide clear and informative error messages.
*   **NFR-US-003 (Usability):** The system shall be usable on both desktop and mobile devices (responsive design).
*   **NFR-RE-001 (Reliability):** The system shall be available and operational at least 99% of the time (excluding scheduled maintenance).
*   **NFR-MA-001 (Maintainability):** The system shall be designed in a modular and well-documented manner to facilitate future maintenance and enhancements.
*   **NFR-PO-001 (Portability):** The system shall be accessible on standard web browsers (Chrome, Firefox, Safari, Edge).
*   **NFR-SC-001 (Scalability):** The system should be designed to accommodate future growth in data volume and user base without significant architectural changes. (This is a "should," not a "shall," as major scalability is out of scope for the initial development).
* **NFR-DA-001 (Data Accuracy):** The system will ensure the accuracy of the data by validating the inputs.

This User Requirements document provides a detailed specification of the new inventory management system. It serves as a guide for developers, testers, and stakeholders throughout the project lifecycle. This document is subject to review and revision as needed.
