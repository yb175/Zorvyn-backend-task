import express from "express";
import userController from "../../controllers/user/userController.js";
import adminMiddleware from "../../middleware/adminmiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

const userRouter: express.Router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Accessible only by Admin users. Creates a user with ACTIVE status.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *           example:
 *             name: Jane Analyst
 *             email: jane@example.com
 *             password: password123
 *             role: ANALYST
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
userRouter.post("/", adminMiddleware, userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     description: Accessible only by Admin users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       500:
 *         description: Internal server error
 */
userRouter.get("/", adminMiddleware, userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     description: Accessible only by Admin users.
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
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.get("/:id", adminMiddleware, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user role
 *     tags: [Users]
 *     description: Accessible only by Admin users to update user roles.
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
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ANALYST, EMPLOYEE]
 *           example:
 *             role: ANALYST
 *     responses:
 *       200:
 *         description: User role updated
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.patch("/:id", adminMiddleware, userController.updateUserRole);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Users]
 *     description: Accessible only by Admin users to activate or deactivate users.
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
 *             $ref: '#/components/schemas/UpdateUserStatus'
 *           example:
 *             status: INACTIVE
 *     responses:
 *       200:
 *         description: User status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.patch("/:id/status", adminMiddleware, userController.updateUserStatus);

export default userRouter;