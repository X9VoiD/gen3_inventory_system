# Inventory System UI Specification

## Page Catalog

### 1. Authentication Pages
**Purpose:** Handle user login and password management

| Page | Components | Description | API Endpoints |
|------|------------|-------------|---------------|
| Login | LoginForm | Email/password entry with validation | POST /login |
| Password Reset | PasswordResetForm | Secure password recovery flow | POST /password-reset |

### 2. User Management (Admin Only)
**Purpose:** Manage system users and permissions

| Page | Key Components | Functionality | Linked API |
|------|----------------|---------------|------------|
| User List | - Searchable table<br>- Role filters<br>- Activation toggles | View/search all users<br>Bulk actions | GET /users<br>PATCH /users/{id} |
| User Profile | - Role selector<br>- Password validator<br>- Activity log | Create/edit users<br>View audit history | POST /users<br>PUT/PATCH /users/{id} |

### 3. Product Catalog
**Purpose:** Manage inventory items and pricing

| Component | Description | Data Source | Validation |
|-----------|-------------|-------------|------------|
| Product Table | Sortable grid with stock alerts | GET /products | Item code uniqueness |
| Product Form | VAT calculator<br>Barcode scanner integration | POST/PUT /products | Price formatting<br>Category selection |

### 4. Inventory Operations
**Purpose:** Handle stock movements and transactions

#### 4.1 Core Flows:
- **Delivery Receiving**
  Components: Supplier selector, Bulk entry table
  API: POST /transactions (type=Delivery)

- **Point of Sale**
  Components: Barcode scanner, Cart manager, Receipt printer
  API: POST /transactions (type=Sale)

- **Returns Processing**
  Components: Transaction lookup, Reason selector
  API: POST /transactions (type=Return)

### 5. Reporting Hub
**Purpose:** Generate business insights

| Report Type | Filters | Visualization | Export | API Source |
|-------------|---------|---------------|--------|------------|
| Stock Levels | Category<br>Supplier | Inventory heatmap | Excel | GET /products?stock_on_hand_gte= |
| Sales Trends | Date range<br>Product | Line charts | PDF | GET /transactions?type=Sale |

## Key UI Patterns

1. **Form Handling**:
   - Real-time validation using API endpoints
   - Auto-save drafts for complex forms
   - Error recovery for failed submissions

2. **Data Tables**:
   - Server-side pagination (?_page=2&_limit=50)
   - Column sorting matching API params
   - Bulk action controls

3. **Notifications**:
   - Transaction success/failure alerts
   - Stock level warnings
   - System maintenance notices

## Security & Permissions

| Role | Accessible Pages | API Scope |
|------|------------------|-----------|
| Staff | Inventory ops<br>Basic reports | POST /transactions<br>GET /products |
| Manager | + Product mgmt<br>Advanced reports | + POST /products<br>GET /transactions |
| Admin | Full system access | All endpoints |

## Mobile Optimization
- Touch-friendly transaction forms
- Offline sales recording (syncs when online)
- Barcode scanning prioritization