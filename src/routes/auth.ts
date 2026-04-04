import express from "express";
import registerUser from "../../controllers/auth/register.js";
import loginUser from "../../controllers/auth/login.js";
import changePassword from "../../controllers/auth/changePassword.js";
import authMiddleware from "../../middleware/authmiddleware.js";

const authRouter: express.Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Accessible by anyone to create a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *           example:
 *             name: John Doe
 *             email: johndoe@example.com
 *             password: password123
 *             role: ANALYST
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation errors
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
authRouter.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     description: Accessible by anyone to authenticate and obtain a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *           example:
 *             email: johndoe@example.com
 *             password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Inactive user
 *       500:
 *         description: Internal server error
 */
authRouter.post("/login", loginUser);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     description: Accessible by authenticated users to change their password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["currentPassword", "newPassword"]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *           example:
 *             currentPassword: "oldPassword123"
 *             newPassword: "newPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation failed or new password same as current
 *       401:
 *         description: Current password is incorrect or user not found
 *       500:
 *         description: Internal server error
 */
authRouter.post("/change-password", authMiddleware, changePassword);


export default authRouter;
