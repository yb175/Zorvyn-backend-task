import express from "express";
import { createTask, getTaskInsights, getTasks, updateTaskStatus, updateTask, deleteTask } from "../../controllers/tasks/tasksController.js";
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
 *     summary: Create a new financial record
 *     tags: [Financial Records]
 *     description: Accessible only by Admin users to create financial records.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFinancialRecord'
 *           example:
 *             amount: 150.50
 *             type: "EXPENSE"
 *             category: "Office Supplies"
 *             date: "2026-04-03T10:30:00Z"
 *             notes: "Q1 office supply purchase"
 *             assignedTo: "employeeId"
 *             customerId: "customerId"
 *     responses:
 *       201:
 *         description: Financial record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Validation failed - invalid amount, type, or category
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
 *     summary: Get financial records with filtering support
 *     tags: [Financial Records]
 *     description: Retrieve financial records. Admin/Analyst can view all records. Employees can only view their assigned records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by record type
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category (case-insensitive partial match)
 *       - in: query
 *         name: dateFrom
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records from this date (inclusive, ISO 8601 format)
 *       - in: query
 *         name: dateTo
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records until this date (inclusive, ISO 8601 format)
 *     responses:
 *       200:
 *         description: List of financial records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FinancialRecord'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tasksRouter.get("/", userMiddleware, getTasks);

/**
 * @swagger
 * /tasks/insights:
 *   get:
 *     summary: Get financial insights and analytics
 *     tags: [Financial Records]
 *     description: Retrieve financial analytics including income, expenses, balance, and category breakdown. Only accessible to Admin and Analyst users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                         totalExpense:
 *                           type: number
 *                         netBalance:
 *                           type: number
 *                     recordStatus:
 *                       type: object
 *                       properties:
 *                         totalTasks:
 *                           type: integer
 *                         pendingTasks:
 *                           type: integer
 *                         inProgressTasks:
 *                           type: integer
 *                         doneTasks:
 *                           type: integer
 *                     categoryBreakdown:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           count:
 *                             type: integer
 *                           amount:
 *                             type: number
 *                           type:
 *                             type: string
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - only Admin and Analyst roles can access insights
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

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update financial record details
 *     tags: [Financial Records]
 *     description: Update financial record details (amount, type, category, date, notes, status). Admin users can update any record. Other users can only update their assigned records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Financial record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Transaction amount (must be > 0)
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 description: Record type
 *               category:
 *                 type: string
 *                 description: Expense/income category
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Transaction date (ISO 8601 format)
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes
 *               title:
 *                 type: string
 *                 description: Record title
 *               description:
 *                 type: string
 *                 description: Record description
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, DONE]
 *                 description: Record status
 *           example:
 *             amount: 200.75
 *             type: "INCOME"
 *             category: "Salary"
 *             date: "2026-04-04T10:00:00Z"
 *             notes: "April salary payment"
 *             status: "DONE"
 *     responses:
 *       200:
 *         description: Financial record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden - cannot update this record
 *       404:
 *         description: Financial record not found
 *       500:
 *         description: Internal server error
 */
tasksRouter.patch("/:id", userMiddleware, updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a financial record
 *     tags: [Financial Records]
 *     description: Delete a financial record. Only accessible by Admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Financial record ID
 *     responses:
 *       200:
 *         description: Financial record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - only Admin users can delete records
 *       404:
 *         description: Financial record not found
 *       500:
 *         description: Internal server error
 */
tasksRouter.delete("/:id", adminMiddleware, deleteTask);

export default tasksRouter;