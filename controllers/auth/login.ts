import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

export default async function loginUser(req: any, res: any): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({ success: false, message: "Forbidden: User account is inactive" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to authenticate user" });
  }
}
