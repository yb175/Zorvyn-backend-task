import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini CRM API",
      version: "2.0.0 (Refactored)",
      description: "Backend Intern Assignment API Docs - Standardized Response Format",
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
        // Input Schemas
        RegisterUser: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            role: { type: "string", enum: ["ADMIN", "EMPLOYEE"] },
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
            role: { type: "string", enum: ["ADMIN", "EMPLOYEE"] },
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
      },
    }
  },
  apis: ["src/routes/*.ts", "src/modules/**/*.ts"]
 
});
