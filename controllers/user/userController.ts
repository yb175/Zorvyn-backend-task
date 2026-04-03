import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

const allowedRoles = ["ADMIN", "ANALYST", "EMPLOYEE"];
const allowedStatuses = ["ACTIVE", "INACTIVE"];

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} as const;

const createUser = async (req: any, res: any) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "name, email, password and role are required" });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role. Must be ADMIN, ANALYST or EMPLOYEE" });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                status: "ACTIVE",
            },
            select: userSelect,
        });

        return res.status(201).json({
            success: true,
            data: user,
            message: "User created successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to create user" });
    }
};

const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await prisma.user.findMany({
            select: userSelect,
        });
        res.json({ success: true, data: users, message: "Users retrieved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve users" });
    }
};

const getUserById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user, message: "User retrieved successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve user" });
    }
};

const updateUserRole = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role. Must be ADMIN, ANALYST or EMPLOYEE" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: userSelect,
        });

        res.json({
            success: true,
            data: user,
            message: "User role updated successfully"
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update user role" });
    }
};

const updateUserStatus = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Must be ACTIVE or INACTIVE" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { status },
            select: userSelect,
        });

        return res.json({
            success: true,
            data: user,
            message: "User status updated successfully",
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(500).json({ success: false, message: "Failed to update user status" });
    }
};

export default { createUser, getAllUsers, getUserById, updateUserRole, updateUserStatus };