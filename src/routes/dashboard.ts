import express from "express";
import { getDashboardSummary, getDashboardInsights } from "../../controllers/dashboard/dashboardController.js";
import dashboardMiddleware from "../../middleware/dashboardmiddleware.js";

const dashboardRouter: express.Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Financial dashboard and analytics endpoints
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get financial summary
 *     tags: [Dashboard]
 *     description: Retrieve key financial metrics including total income, total expense, and net balance. Only accessible to Admin and Analyst users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
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
 *                     totalIncome:
 *                       type: number
 *                       description: Total income across all records
 *                       example: 50000.00
 *                     totalExpense:
 *                       type: number
 *                       description: Total expense across all records
 *                       example: 35000.00
 *                     netBalance:
 *                       type: number
 *                       description: Net balance (total income - total expense)
 *                       example: 15000.00
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only Admin and Analyst users can access this endpoint
 *       500:
 *         description: Internal server error
 */
dashboardRouter.get("/summary", dashboardMiddleware, getDashboardSummary);

/**
 * @swagger
 * /dashboard/insights:
 *   get:
 *     summary: Get financial insights and analytics
 *     tags: [Dashboard]
 *     description: Retrieve comprehensive financial analytics including category-wise totals, recent transaction activity, and monthly trend analysis. Only accessible to Admin and Analyst users.
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
 *                     categoryWiseTotals:
 *                       type: object
 *                       description: Breakdown of income and expense by category
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           count:
 *                             type: integer
 *                           total:
 *                             type: number
 *                           type:
 *                             type: string
 *                             enum: [INCOME, EXPENSE]
 *                       example:
 *                         "INCOME:Salary":
 *                           count: 12
 *                           total: 48000
 *                           type: "INCOME"
 *                         "EXPENSE:Office Supplies":
 *                           count: 5
 *                           total: 1500
 *                           type: "EXPENSE"
 *                     recentActivity:
 *                       type: array
 *                       maxItems: 5
 *                       description: Last 5 financial records
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           type:
 *                             type: string
 *                             enum: [INCOME, EXPENSE]
 *                           category:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [PENDING, IN_PROGRESS, DONE]
 *                           assignedTo:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           customer:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                     monthlyTrend:
 *                       type: array
 *                       description: Monthly breakdown of income, expense, and net balance
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             description: Month in YYYY-MM format
 *                             example: "2026-04"
 *                           income:
 *                             type: number
 *                           expense:
 *                             type: number
 *                           net:
 *                             type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only Admin and Analyst users can access this endpoint
 *       500:
 *         description: Internal server error
 */
dashboardRouter.get("/insights", dashboardMiddleware, getDashboardInsights);

export default dashboardRouter;
