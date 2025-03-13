# UI Components, Routes, and Pages Specification

## 1. Authentication
### Components
- LoginForm
- PasswordResetForm
- JWTTokenHandler

### Routes
- `/login` (Public)
- `/password-reset` (Public)

### Features
- JWT token management
- Session timeout handling
- API error code mapping (401/403/404)

## 2. User Management (Administrator Only)
### Components
- UserList (With API pagination)
- UserForm (Supports PUT/PATCH operations)
- RoleSelector (Matches API role enum)
- ActivityLogTable (For audit requirements)

### Routes
- `/users` (Implements ?_page=2&_limit=20)
- `/users/new` (POST)
- `/users/edit/:id` (PUT/PATCH)
- `/users/deactivate/:id` (DELETE)

## 3. Supplier Management
### Components
- SupplierList (With API filters)
- SupplierForm (CRUD operations)
- SupplierProductsTable (Linked data)

### Routes
- `/suppliers` (GET/POST)
- `/suppliers/:id` (GET/PUT/PATCH/DELETE)
- `/suppliers/:id/products`

## 4. Category Management
### Components
- CategorySelector (Syncs with /categories API)
- CategoryBadges (Visual filtering)
- CategoryForm (Admin-only)

### Routes
- `/categories` (Public GET)
- `/categories/manage` (Admin CRUD)

## 5. Product Management
### Components
- ProductTable (Supports API query params)
- ProductForm (All fields from API spec)
- BarcodeScannerInput (With API fallback)
- StockAlertBadge (Uses stock_on_hand_gte/lte)

### Routes
- `/products` (Implements all API filters)
- `/products/new` (POST with validation)
- `/products/:id` (GET/PUT/PATCH)

## 6. Inventory Transactions
### Components
- TransactionTypeTabs (Delivery/Pull-out/Sale/Return)
- TransactionForm (Dynamic fields per type)
- ReceiptPreview (Matches API response format)
- StockMovementGraph (Uses /transactions data)

### Routes
- `/transactions` (All types with filters)
- `/transactions/deliveries` (POST)
- `/transactions/sales` (POST)
- `/transactions/returns` (POST)

## 7. Reporting
### Components
- ReportBuilder (Generates API query params)
- DataExporter (Matches API Excel format)
- DateRangePicker (ISO 8601 compliance)

### Routes
- `/reports/stock` (Uses stock_on_hand filters)
- `/reports/transactions` (All API params)

## 8. API Integration Layer
### Components
- APIErrorHandler (Maps to UI errors)
- RequestInterceptor (Handles Auth headers)
- ResponseNormalizer (Standardizes API data)

## 9. UI/UX Enhancements
1. **API-Driven Validation**:
   - Real-time validation using API endpoints
   - Duplicate checking for item codes
   - Supplier/category existence verification

2. **Pagination Controls**:
   - Server-side pagination components
   - Page size selectors
   - Sortable table headers

3. **Loading States**:
   - Skeleton loaders for API calls
   - Progressive form submission
   - Background data refreshing

4. **Error Recovery**:
   - Automatic JWT refresh flow
   - Retry mechanisms for failed API calls
   - Offline transaction queuing