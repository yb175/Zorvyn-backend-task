import { prisma } from "../../lib/prisma.js";
import { z } from "zod";
import { createFinancialRecordSchema, filterFinancialRecordsSchema } from "../../utils/financialRecordValidation.js";

// Schema for updating task status (financial record status)
const updateTaskStatusSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
});

export async function createTask(req: any, res: any): Promise<void> {
    // Create a financial record (task) assigned to an employee for a customer
    try {
        const parsed = createFinancialRecordSchema.safeParse(req.body);
        
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation failed", data: parsed.error.format() });
        }

        const { amount, type, category, date, notes, title, description, assignedTo, customerId, status } = parsed.data;

        const employee = await prisma.user.findUnique({ where: { id: assignedTo } });
        if (!employee || employee.role !== "EMPLOYEE" || employee.status !== "ACTIVE") {
            return res.status(404).json({ success: false, message: "Assigned employee not found" });
        }

        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const allowedStatuses = ["PENDING", "IN_PROGRESS", "DONE"];
        const finalStatus = allowedStatuses.includes(status!) ? status : "PENDING";

        const task = await prisma.task.create({
            data: {
                title: title || `${type} - ${category}`,
                description: description || notes || null,
                amount: amount || 0,
                type,
                category,
                date: date ? new Date(date) : new Date(),
                notes: notes || null,
                status: finalStatus as any,
                assignedToId: assignedTo,
                customerId,
            },
        });

        res.status(201).json({ success: true, data: task, message: "Financial record created successfully" });
    } catch (error : any) {
        res.status(500).json({ success: false, message: error.message || "Failed to create financial record" });
    }
}

const getTasks = async (req: any, res: any) => {
    try {
        const user = req.user;
        const isAdmin = user.role === "ADMIN";
        const isAnalyst = user.role === "ANALYST";

        // Parse and validate filter parameters
        const filterParsed = filterFinancialRecordsSchema.safeParse(req.query);
        
        // Return 400 error if filters are invalid
        if (Object.keys(req.query).length > 0 && !filterParsed.success) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid filters", 
                data: filterParsed.error.format() 
            });
        }
        
        // Build where clause for filtering
        const where: any = isAdmin || isAnalyst ? {} : { assignedToId: user.userId };
        
        if (filterParsed.success) {
            const { type, category, dateFrom, dateTo } = filterParsed.data;
            
            if (type) {
                where.type = type;
            }
            if (category) {
                where.category = { contains: category, mode: "insensitive" };
            }
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom) where.date.gte = new Date(dateFrom);
                if (dateTo) where.date.lte = new Date(dateTo);
            }
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                date: 'desc' as any,
            },
        });

        res.json({ success: true, data: tasks, message: "Financial records retrieved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve financial records" });
    }
};

const getTaskInsights = async (req: any, res: any) => {
    try {
        const user = req.user;

        if (user.role !== "ADMIN" && user.role !== "ANALYST") {
            return res.status(403).json({ success: false, message: "Forbidden: Insights are available to Admin and Analyst users only" });
        }

        // Financial metrics using Prisma aggregations to avoid precision loss
        const incomeAgg = await prisma.task.aggregate({
            where: { type: "INCOME" },
            _sum: { amount: true },
            _count: true,
        });

        const expenseAgg = await prisma.task.aggregate({
            where: { type: "EXPENSE" },
            _sum: { amount: true },
            _count: true,
        });

        const totalIncome = incomeAgg._sum.amount ? Number(incomeAgg._sum.amount) : 0;
        const totalExpense = expenseAgg._sum.amount ? Number(expenseAgg._sum.amount) : 0;
        const netBalance = totalIncome - totalExpense;

        // Category breakdown using Prisma groupBy to avoid in-memory calculation
        const categoryBreakdownRaw = await prisma.task.groupBy({
            by: ["type", "category"],
            _sum: { amount: true },
            _count: true,
        });

        // Build category breakdown with composite keys to avoid collisions
        const categoryBreakdown: Record<string, { count: number; amount: number; type: string }> = {};
        categoryBreakdownRaw.forEach((record: any) => {
            const compositeKey = `${record.type}:${record.category}`;
            categoryBreakdown[compositeKey] = {
                count: record._count,
                amount: record._sum.amount ? Number(record._sum.amount) : 0,
                type: record.type,
            };
        });

        // Status counts
        const [totalTasks, pendingTasks, inProgressTasks, doneTasks] = await Promise.all([
            prisma.task.count(),
            prisma.task.count({ where: { status: "PENDING" } }),
            prisma.task.count({ where: { status: "IN_PROGRESS" } }),
            prisma.task.count({ where: { status: "DONE" } }),
        ]);

        return res.json({
            success: true,
            data: {
                summary: {
                    totalIncome,
                    totalExpense,
                    netBalance,
                },
                recordStatus: {
                    totalTasks,
                    pendingTasks,
                    inProgressTasks,
                    doneTasks,
                },
                categoryBreakdown,
            },
            message: "Financial insights retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to retrieve financial insights" });
    }
};

const updateTaskStatus = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const parsed = updateTaskStatusSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation failed", data: parsed.error.format() });
        }

        const task = await prisma.task.findUnique({
            where: { id: id },
        });

        if (!task) {
            return res.status(404).json({ success: false, message: "Financial record not found" });
        }

        if (user.role !== "ADMIN" && task.assignedToId !== user.userId) {
            return res.status(403).json({ success: false, message: "Forbidden: You cannot update this financial record" });
        }

        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: { status: parsed.data.status },
        });

        res.json({ success: true, data: updatedTask, message: "Financial record updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update financial record" });
    }
};

const deleteTask = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Only ADMIN can delete financial records
        if (user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Forbidden: Only Admin users can delete financial records" });
        }

        const task = await prisma.task.findUnique({
            where: { id: id },
        });

        if (!task) {
            return res.status(404).json({ success: false, message: "Financial record not found" });
        }

        await prisma.task.delete({
            where: { id: id },
        });

        res.json({ success: true, data: null, message: "Financial record deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete financial record" });
    }
};

export { getTasks, getTaskInsights, updateTaskStatus, deleteTask };