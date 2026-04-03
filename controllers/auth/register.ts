import registerSchema from "../../utils/parseRegisterPayload.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

export default async function registerUser(req: any, res: any): Promise<void> {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({ success: false, message: "Validation failed", data: parsed.error.format() });
            return;
        }

        const { name, email, password, role } = parsed.data;

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: "Email already exists" });
            return;
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
        });

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
            message: "User registered successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to register user" });
    }
}
