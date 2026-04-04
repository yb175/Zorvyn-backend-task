import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Financial Records API",
      version: "2.0.0 (Refactored - Financial Records)",
      description: `Backend Intern Assignment API Docs - Financial Records Management System

    ## System Overview
    This API manages financial records (transactions) tracked against financial entities (accounts/clients).
    - Financial Records (Tasks) support income/expense categorization with detailed analytics
    - Financial Entities (Customers) represent accounts/clients
    - Enhanced filtering and financial metrics for decision-making

    ## Role Definitions

    | Role | Access |
    | --- | --- |
    | ADMIN | Full CRUD on records, financial management, insights analytics |
    | ANALYST | Read-only access to all records and financial insights |
    | EMPLOYEE | View assigned records only; no insights or deletion |

    ## Authorization Notes

    - All protected routes require a valid Bearer JWT.
    - Inactive users receive a 403 response and cannot access protected routes.
    - Responses use the format: { success: boolean, data?: any, message?: string }.
    - Date filtering uses ISO 8601 format with inclusive range boundaries
    `,
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {},
            message: { type: "string" },
          },
        },
        ApiErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        // Input Schemas
        RegisterUser: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            role: { type: "string", enum: ["ADMIN", "ANALYST", "EMPLOYEE"] },
          },
        },
        CreateUser: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            role: { type: "string", enum: ["ADMIN", "ANALYST", "EMPLOYEE"] },
          },
        },
        UpdateUserRole: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["ADMIN", "ANALYST", "EMPLOYEE"] },
          },
        },
        UpdateUserStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          },
        },
        LoginUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        
        // Data Schemas
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "ANALYST", "EMPLOYEE"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        
        CreateCustomer: {
          type: "object",
          required: ["name", "email", "phone"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
          },
        },

        UpdateCustomer: {
          type: "object",
          properties: {
            name: { type: "string", description: "Customer name (optional)" },
            email: { type: "string", format: "email", description: "Customer email (optional)" },
            phone: { type: "string", description: "Customer phone number (optional)" },
            company: { type: "string", description: "Customer company (optional)" },
          },
        },
        
        Customer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            company: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        
        CreateTask: {
          type: "object",
          required: ["title", "assignedTo", "customerId"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            assignedTo: { type: "string", format: "uuid" },
            customerId: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "DONE"] },
          },
        },
        
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "DONE"] },
            assignedToId: { type: "string", format: "uuid" },
            customerId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Financial Record Schemas
        CreateFinancialRecord: {
          type: "object",
          required: ["amount", "type", "category", "assignedTo", "customerId"],
          properties: {
            amount: { type: "number", format: "decimal", minimum: 0.01, description: "Transaction amount (must be > 0)" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"], description: "Record type: INCOME or EXPENSE" },
            category: { type: "string", description: "Expense/income category (e.g., Office Supplies, Salary, etc.)" },
            date: { type: "string", format: "date-time", description: "Transaction date (ISO 8601 format, defaults to now)" },
            notes: { type: "string", maxLength: 500, description: "Additional notes about the record (max 500 characters)" },
            title: { type: "string", description: "Optional custom title (defaults to TYPE - CATEGORY)" },
            description: { type: "string", description: "Optional description" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "DONE"], description: "Record processing status" },
            assignedTo: { type: "string", format: "uuid", description: "Employee ID who will manage this record" },
            customerId: { type: "string", format: "uuid", description: "Financial entity (customer) ID" },
          },
        },

        FinancialRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            amount: { type: "number", format: "decimal", description: "Transaction amount" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"], description: "Record type" },
            category: { type: "string", description: "Category classification" },
            date: { type: "string", format: "date-time", description: "Transaction date" },
            notes: { type: "string", description: "Additional notes" },
            title: { type: "string", description: "Record title" },
            description: { type: "string", description: "Record description" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "DONE"], description: "Processing status" },
            assignedTo: { 
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
            customer: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        
        // Standardized Response Schemas
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
        
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            data: { type: "object" },
          },
        },

        RolePermissions: {
          type: "object",
          properties: {
            ADMIN: { type: "string", example: "Full access to users, customers, tasks, and insights" },
            ANALYST: { type: "string", example: "Read-only access to records and insights" },
            EMPLOYEE: { type: "string", example: "Restricted access to assigned data only" },
          },
        },
      },
    }
  },
  apis: ["src/routes/*.ts", "src/modules/**/*.ts"]
 
});
