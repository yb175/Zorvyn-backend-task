import { prisma } from "../../lib/prisma.js";

const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve users" });
    }
};

const getUserById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to retrieve user" });
    }
};

const updateUserRole = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["ADMIN", "EMPLOYEE"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role. Must be ADMIN or EMPLOYEE" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
        });

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
            message: "User role updated successfully"
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update user role" });
    }
};

export default { getAllUsers, getUserById, updateUserRole };