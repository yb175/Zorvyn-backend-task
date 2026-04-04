import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import { z } from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export default async function changePassword(req: any, res: any): Promise<void> {
    try {
        const user = req.user;

        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation failed", data: parsed.error.format() });
        }

        const { currentPassword, newPassword } = parsed.data;

        // Get full user record with password
        const fullUser = await prisma.user.findUnique({
            where: { id: user.userId },
        });

        if (!fullUser) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, fullUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        // Prevent using same password
        const isSamePassword = await bcrypt.compare(newPassword, fullUser.password);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: "New password must be different from current password" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.userId },
            data: { password: hashedPassword },
        });

        return res.status(200).json({
            success: true,
            data: null,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to change password" });
    }
}
