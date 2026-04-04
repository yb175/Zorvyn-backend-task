import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

export default async function loginUser(req: any, res: any): Promise<void> {
  try {
    console.log('[Login] Request received at:', new Date().toISOString());
    const { email, password } = req.body;
    console.log('[Login] Email:', email);
    console.log('[Login] Executing: prisma.user.findUnique...');
    
    const startTime = Date.now();
    const user = await prisma.user.findUnique({ where: { email } });
    const duration = Date.now() - startTime;
    console.log('[Login] Query completed in', duration, 'ms');
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

  } catch (error: any) {
    console.error('[Login] Error occurred:', error.message);
    console.error('[Login] Error code:', error.code);
    console.error('[Login] Error meta:', error.meta);
    console.error('[Login] Full error:', error);
    res.status(500).json({ success: false, message: "Failed to authenticate user", error: error.code });
  }
}
