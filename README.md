---

# 💰 Finance Data Processing & Access Control Backend

A role-based financial records backend built with **Express + TypeScript + Prisma + PostgreSQL**.
This system processes financial transactions with role-based access control (RBAC), comprehensive analytics, and secure user management.

**Features:**
- 🔐 Role-based access control (ADMIN, ANALYST, EMPLOYEE)
- 📊 Financial analytics and dashboard insights
- 💳 Transaction management (income/expense)
- 👥 User and role management
- 📈 Category-wise breakdown and trends
- 🔑 JWT authentication with password management

---

## 🚀 Tech Stack

* **Node.js + Express**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **JWT Authentication**
* **Zod Validation**
* **Swagger (OpenAPI) Documentation**

---

## 📁 Project Structure

```
finance-backend/
├── controllers/        # Business logic for each module
├── middleware/         # Auth & role guards
├── routes/             # API route definitions
├── prisma/             # Database schema & migrations
├── lib/                # Prisma client setup
├── utils/              # Validation schemas
├── src/                # App entry point + swagger config
├── generated/          # Prisma generated types
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public
JWT_SECRET=your_super_secret_key_min_32_chars
NODE_ENV=development
PORT=5000
```

---

## 🛠 Installation & Setup

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Generate Prisma client

```bash
npx prisma generate
```

### 3️⃣ Run database migration

```bash
npx prisma migrate dev --name init
```

### 4️⃣ Start the server

```bash
npx tsx src/app.ts
```

Server runs at:

```
http://localhost:5000
```

Swagger Docs:

```
http://localhost:5000/api-docs
```

---

## 🔐 Authentication & Authorization

JWT-based authentication using Bearer tokens. Includes support for password management.

### Register

`POST /auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "EMPLOYEE|ANALYST|ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "status": "ACTIVE"
  },
  "message": "User registered successfully"
}
```

### Login

`POST /auth/login`

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "JWT_TOKEN",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE",
      "status": "ACTIVE"
    }
  }
}
```

### Change Password

`POST /auth/change-password`

**Request:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

Use token in requests:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👥 Roles & Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full CRUD on all records, user management, financial analytics, dashboard access |
| **ANALYST** | Read-only access to all records, view analytics, access dashboard insights |
| **EMPLOYEE** | View assigned records only, update own record status, no dashboard access |

**User Status:** `ACTIVE` or `INACTIVE` - Inactive users cannot access any protected endpoints.

---

## 📊 Standardized API Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null
}
```

### HTTP Status Codes
- `200/201` - Success
- `400` - Validation errors
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions or inactive user)
- `404` - Resource not found
- `409` - Conflict (duplicate entry)
- `500` - Server errors

---

## 📦 API Modules

### 🔑 Auth Module

* **Register** - `POST /auth/register` - Create new user account
* **Login** - `POST /auth/login` - Authenticate and receive JWT token
* **Change Password** - `POST /auth/change-password` - Update user password (authenticated)

### 👤 Users Module (Admin Only)

* **Create User** - `POST /users` - Create new user with role assignment
* **Get All Users** - `GET /users` - Retrieve all system users
* **Get User by ID** - `GET /users/{id}` - Retrieve specific user details
* **Update User Role** - `PATCH /users/{id}` - Change user role
* **Update User Status** - `PATCH /users/{id}/status` - Activate/deactivate user
* **Delete User** - `DELETE /users/{id}` - Permanently remove user account

### 💼 Customers Module (Financial Entities)

* **Create Customer** - `POST /customers` - Create financial entity (Admin)
* **Get Customers** - `GET /customers?page=1&limit=10` - Paginated list (Admin/Analyst)
* **Get Customer by ID** - `GET /customers/{id}` - Retrieve customer details
* **Update Customer** - `PUT /customers/{id}` - Modify customer info
* **Delete Customer** - `DELETE /customers/{id}` - Remove customer

### 💳 Financial Records Module (Tasks)

* **Create Record** - `POST /tasks` - Create financial transaction (Admin only)
* **Get Records** - `GET /tasks?type=INCOME&category=Salary&dateFrom=2026-01-01&dateTo=2026-12-31` - View records with filtering
* **Update Record** - `PATCH /tasks/{id}` - Update transaction details (amount, category, type, date, notes)
* **Update Status** - `PATCH /tasks/{id}/status` - Change record status
* **Delete Record** - `DELETE /tasks/{id}` - Remove record (Admin only)
* **Get Insights** - `GET /tasks/insights` - Financial analytics (Admin/Analyst)

**Record Types:** `INCOME`, `EXPENSE`  
**Record Status:** `PENDING`, `IN_PROGRESS`, `DONE`

### 📈 Dashboard Module

* **Summary** - `GET /dashboard/summary` - Total income, expense, net balance
* **Insights** - `GET /dashboard/insights` - Category breakdown, recent activity, monthly trends

**Access:** ADMIN and ANALYST only

---

## 🧠 Business Rules

* Passwords are hashed with **bcrypt** (10 salt rounds)
* JWT tokens expire in **1 hour**
* Inactive users get **403 Forbidden** on all protected routes
* Employees can only:
  - View their assigned financial records
  - Update their own record **status only** (PENDING, IN_PROGRESS, DONE)
  - Cannot update financial details (amount, category, type, date, notes)
  - Cannot access dashboard or view all records
* Analysts can:
  - View all records (read-only)
  - Access dashboard and analytics
  - Cannot create, update, or delete records
* Admins have full system access
* Financial records must be linked to valid customer and employee entities

### Financial Calculations
- **Total Income:** Sum of all INCOME type records
- **Total Expense:** Sum of all EXPENSE type records
- **Net Balance:** Total Income - Total Expense
- **Category Breakdown:** Sum aggregated by (type + category)
- **Monthly Trends:** Income, expense, and net balance grouped by month (YYYY-MM)

---

## 🔧 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Specific error description"
}
```

Error types and HTTP codes:
- **Validation Errors** (400) - Invalid input, missing fields, constraint violations
- **Unauthorized** (401) - Missing or invalid JWT token
- **Inactive User** (403) - User account is deactivated
- **Forbidden** (403) - Insufficient permissions for operation
- **Not Found** (404) - Resource doesn't exist
- **Conflict** (409) - Duplicate entry (email, phone, etc.)
- **Server Errors** (500) - Unexpected failures with descriptive messages

---

## 📚 Swagger API Documentation

Interactive documentation available at:

```
http://localhost:5000/api-docs
```

Includes:
* Complete request/response schemas
* Authentication requirements per endpoint
* All endpoints grouped by module
* Example payloads for each operation
* Error response documentation

---

## 🗄 Database Schema

### User
- `id` (UUID, primary key)
- `name` (string)
- `email` (string, unique)
- `password` (hashed)
- `role` (ADMIN | ANALYST | EMPLOYEE)
- `status` (ACTIVE | INACTIVE)
- `createdAt`, `updatedAt`

### Customer (Financial Entity)
- `id` (UUID, primary key)
- `name` (string)
- `email` (string, unique)
- `phone` (string, unique)
- `company` (string, optional)
- `createdAt`, `updatedAt`

### Task (Financial Record)
- `id` (UUID, primary key)
- `title` (string)
- `description` (string, optional)
- `status` (PENDING | IN_PROGRESS | DONE)
- `amount` (Decimal) ← Uses Decimal for financial precision
- `type` (INCOME | EXPENSE)
- `category` (string)
- `date` (DateTime)
- `notes` (string, max 500 chars)
- `assignedToId` (FK → User)
- `customerId` (FK → Customer)
- `createdAt`, `updatedAt`

---

## 🚀 Deployment Notes

* Ensure `JWT_SECRET` is set to a strong, random string (min 32 characters)
* Set `NODE_ENV=production` for production builds
* Use a managed PostgreSQL instance in production
* Enable HTTPS on production endpoints
* Configure appropriate rate limiting on auth endpoints
* Set up proper logging and monitoring
* Use environment-specific `.env` files (`.env.production`, `.env.development`)

---

## 📝 Notes

- All timestamps use ISO 8601 format
- UUID format for all IDs
- Decimal type used for financial amounts to prevent floating-point precision loss
- Date filtering uses inclusive boundaries (gte/lte)
- Category search is case-insensitive

---

## 🧪 Sample Test Flow

1. Register an **ADMIN**
2. Login → Copy JWT
3. Authorize in Swagger
4. Create Customers
5. Register EMPLOYEE
6. Create Tasks assigned to EMPLOYEE
7. Login as EMPLOYEE → View only own tasks

---

## ✅ Features Implemented

✔ JWT Authentication
✔ Role-based Authorization (Admin/Employee)
✔ CRUD Operations
✔ Pagination with filtering
✔ Input Validation (Zod schemas)
✔ Relational Data Handling
✔ Swagger (OpenAPI) Documentation
✔ **Standardized API Response Format** (success/data/message)
✔ Consistent Error Handling with meaningful messages
✔ Express Router Type Safety (TypeScript)
✔ Semantic domain clarity (Financial records, entities)

---

## 👨‍💻 Author

Built as part of a backend engineering assignment demonstrating API design, security, and relational data modeling.

---

