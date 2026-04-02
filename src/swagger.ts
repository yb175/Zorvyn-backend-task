import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini CRM API",
      version: "1.0.0",
      description: "Backend Intern Assignment API Docs",
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
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "EMPLOYEE"] },
          },
        },
      },
    }
  },
  apis: ["src/routes/*.ts", "src/modules/**/*.ts"]
 
});
