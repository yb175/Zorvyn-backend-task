import express from 'express';
import userMiddleware from '../../middleware/usermiddleware.js';
import adminMiddleware from "../../middleware/adminmiddleware.js";
import customerController from "../../controllers/customer/customerController.js";

const customerRouter: express.Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
 */

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     description: Accessible only by Admin users to create customers.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *           example:
 *             name: "John Doe"
 *             email: "johndoe@example.com"
 *             phone: "1234567890"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation errors
 *       409:
 *         description: Duplicate entry
 *       500:
 *         description: Internal server error
 */
customerRouter.post("/", adminMiddleware, customerController.createCustomer);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     description: Accessible only by Admin and Analyst users to view customers.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of customers with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid pagination parameters
 *       500:
 *         description: Internal server error
 */
customerRouter.get("/", userMiddleware, customerController.getCustomers);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     description: Accessible only by Admin and Analyst users to view a specific customer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
customerRouter.get("/:id", userMiddleware, customerController.getCustomerById);

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     summary: Update customer details
 *     tags: [Customers]
 *     description: Accessible only by Admin users to update customer details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomer'
 *           example:
 *             name: "Jane Doe"
 *             email: "janedoe@example.com"
 *             phone: "0987654321"
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
customerRouter.patch("/:id", adminMiddleware, customerController.updateCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     description: Accessible only by Admin users to delete a customer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
customerRouter.delete("/:id", adminMiddleware, customerController.deleteCustomer);

export default customerRouter;
