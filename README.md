---

# 🧩 Mini CRM Backend API

A role-based CRM backend built with **Express + TypeScript + Prisma + PostgreSQL**.
This system supports authentication, user management, customer tracking, and task assignment with strict role-based access control.

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
crm-task/
├── controllers/        # Business logic
├── middleware/         # Auth & role guards
├── routes/             # API route definitions
├── prisma/             # Database schema
├── lib/                # Prisma client setup
├── utils/              # Validation schemas
├── src/                # App entry + swagger config
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public
JWT_SECRET=your_super_secret_key
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

## 🔐 Authentication

JWT-based authentication using Bearer tokens.

### Register

`POST /auth/register`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE"
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
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE"
    }
  }
}
```

Use token in requests:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👥 Roles

| Role         | Permissions                                                      |
| ------------ | ---------------------------------------------------------------- |
| **ADMIN**    | Full access to users, customers, and tasks                       |
| **EMPLOYEE** | Can view customers, see assigned tasks, update their task status |

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
  "message": "Descriptive error message"
}
```

### Key Points
- **success**: Boolean indicating operation success/failure
- **data**: Contains the response payload (present only on success)
- **message**: Human-readable message describing the operation or error
- All responses use appropriate **HTTP status codes**:
  - `200/201` for success
  - `400` for validation errors
  - `401` for unauthorized access
  - `403` for forbidden actions
  - `404` for not found
  - `409` for duplicate entries
  - `500` for server errors

---

## 📦 API Modules

### 🔑 Auth Module

* **Register** - `POST /auth/register` - Create new user account
* **Login** - `POST /auth/login` - Authenticate and receive JWT token

Responses follow standardized format with `success`, `data`, and `message` fields.

### 👤 Users Module (Admin Only)

* **Get All Users** - `GET /users` - Retrieve all system users
* **Get User by ID** - `GET /users/{id}` - Retrieve specific user details
* **Update User Role** - `PATCH /users/{id}` - Change user role (ADMIN/EMPLOYEE)

All responses include `success` status and user `data`.

### 🧑‍💼 Customers Module

* **Create Customer** - `POST /customers` - Create financial entity (Admin)
* **Get Customers** - `GET /customers?page=1&limit=10` - Paginated customer list (All authenticated)
* **Get Customer by ID** - `GET /customers/{id}` - Retrieve specific customer
* **Update Customer** - `PATCH /customers/{id}` - Modify customer details (Admin)
* **Delete Customer** - `DELETE /customers/{id}` - Remove customer (Admin)

Example paginated response:
```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 10,
    "totalRecords": 50,
    "totalPages": 5,
    "customers": [/* array of customers */]
  }
}
```

### 📝 Tasks Module (Financial Records)

* **Create Task** - `POST /tasks` - Create financial record (Admin)
* **Get Tasks** - `GET /tasks` - View financial records (Admin → all, Employee → assigned only)
* **Update Task Status** - `PATCH /tasks/{id}/status` - Change financial record status

Task statuses: `PENDING`, `IN_PROGRESS`, `DONE`

All task responses labeled as "financial records" in messages for domain clarity.

---

## 🧠 Business Rules

* Passwords are hashed with **bcrypt**
* JWT contains `userId` and `role`
* Employees cannot modify other employees' tasks/financial records
* Financial records (tasks) must be linked to:
  * A valid **customer** (financial entity)
  * A valid **employee** (assigned worker)
  * A valid **status** (PENDING, IN_PROGRESS, DONE)

---

## 🔧 Error Handling

All endpoints return consistent error responses with meaningful messages:

```json
{
  "success": false,
  "message": "Specific error description"
}
```

Error types handled:
- **Validation Errors** (400) - Invalid input data
- **Duplicate Entries** (409) - Email/phone already exists
- **Not Found** (404) - Resource doesn't exist
- **Access Denied** (403) - Insufficient permissions
- **Unauthorized** (401) - Missing/invalid authentication
- **Server Errors** (500) - Unexpected failures with descriptive messages

---

## 📚 Swagger API Documentation

Interactive documentation available at:

```
http://localhost:5000/api-docs
```

Includes:

* Request/response schemas
* Authentication
* All endpoints grouped by module

---

## 🗄 Database Schema (Overview)

### User

* id, name, email, password, role

### Customer

* id, name, email, phone, company

### Task

* id, title, description, status
* assignedTo → User
* customerId → Customer

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

