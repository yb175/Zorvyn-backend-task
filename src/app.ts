import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import express from "express";
import authRouter  from "./routes/auth.js";
import userRouter from "./routes/user.js";
import customerRouter from "./routes/customers.js";
import bodyParser from "body-parser";
import tasksRouter from "./routes/tasks.js";
import dashboardRouter from "./routes/dashboard.js";


const app = express();
app.use(express.json());
app.use(bodyParser.json({
  strict: true, // Ensures only valid JSON is parsed
}));

// Error handler for JSON parsing errors
app.use((err: SyntaxError & { status?: number; body?: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      error: err.message,
    });
  }
  next();
});

app.use("/auth", authRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/users", userRouter);
app.use("/customers", customerRouter);
app.use("/tasks", tasksRouter);
app.use("/dashboard", dashboardRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
