import express from "express";
import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import loggerMiddleware from "./middlewares/logger.middleware";
import errorMiddleware from "./middlewares/error.middleware";
import notFoundMiddleware from "./middlewares/notFound.middleware";

const app = express();

app.use(express.json());
app.use(loggerMiddleware)

app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;