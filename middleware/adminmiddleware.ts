import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export default async function adminMiddleware(req: any, res: any, next: any): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: (decoded as any).userId },
            select: { id: true, role: true, status: true },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (user.status === "INACTIVE") {
            return res.status(403).json({ success: false, message: "Forbidden: User account is inactive" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
        }

        req.user = { userId: user.id, role: user.role, status: user.status };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}
