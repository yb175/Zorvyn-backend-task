import { prisma } from "../../lib/prisma.js";
import { z } from "zod";

// Schema for updating task status (financial record status)
const updateTaskStatusSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
});

export async function createTask(req: any, res: any): Promise<void> {
    // Create a financial record (task) assigned to an employee for a customer
    try {
        const { title, description, assignedTo, customerId, status } = req.body;
        if (!title || !assignedTo || !customerId) {
            return res.status(400).json({ success: false, message: "title, assignedTo and customerId are required" });
        }
        const employee = await prisma.user.findUnique({ where: { id: assignedTo } });
        if (!employee || employee.role !== "EMPLOYEE") {
            return res.status(404).json({ success: false, message: "Assigned employee not found" });
        }

        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const allowedStatuses = ["PENDING", "IN_PROGRESS", "DONE"];
        const finalStatus = allowedStatuses.includes(status) ? status : "PENDING";
        const task = await prisma.task.create({
            data: {
                title,
                description,
                assignedToId: assignedTo,
                customerId,
                status: finalStatus,
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

        const tasks = await prisma.task.findMany({
            where: user.role === "ADMIN" ? {} : { assignedToId: user.userId },
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
        });

        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve financial records" });
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

export  { getTasks, updateTaskStatus };