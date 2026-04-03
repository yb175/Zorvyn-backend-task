import express from "express";
import { createTask, getTaskInsights, getTasks, updateTaskStatus } from "../../controllers/tasks/tasksController.js";
import adminMiddleware from "../../middleware/adminmiddleware.js";
import userMiddleware from "../../middleware/usermiddleware.js";

const tasksRouter: express.Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     description: Accessible only by Admin users to create tasks.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *           example:
 *             title: "Task Title"
 *             description: "Task Description"
 *             assignedTo: "employeeId"
 *             customerId: "customerId"
 *             status: "PENDING"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Assigned employee or customer not found
 *       500:
 *         description: Internal server error
 */
tasksRouter.post("/", adminMiddleware, createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     description: Accessible by Admin and Analyst users to view all tasks, or by Employees to view their assigned tasks.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Internal server error
 */
tasksRouter.get("/", userMiddleware, getTasks);

/**
 * @swagger
 * /tasks/insights:
 *   get:
 *     summary: Get task insights
 *     tags: [Tasks]
 *     description: Accessible only by Admin and Analyst users. Employees cannot access analytics.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task summary information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
tasksRouter.get("/insights", userMiddleware, getTaskInsights);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
 *     description: Accessible by Admin users or the assigned employee to update task status.
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, DONE]
 *           example:
 *             status: "IN_PROGRESS"
 *     responses:
 *       200:
 *         description: Task status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Task not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
tasksRouter.patch("/:id/status", userMiddleware, updateTaskStatus);

export default tasksRouter;