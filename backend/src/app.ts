// Packages
import express from "express";
import cookieParser from "cookie-parser";

// Routes
import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";

// Middlewares
import loggerMiddleware from "./middlewares/logger.middleware";
import errorMiddleware from "./middlewares/error.middleware";
import notFoundMiddleware from "./middlewares/notFound.middleware";

const app = express();

// Application Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

// APIs Routes
app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter); 

// Error Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;