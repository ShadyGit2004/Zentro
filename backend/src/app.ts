// Packages
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

// Routes
import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import followRouter from "./routes/follow.routes";
import postRouter from "./routes/post.routes";
import likeRouter from "./routes/like.routes";
import commentRouter from "./routes/comment.routes";
import feedRouter from "./routes/feed.routes";

// Middlewares
import loggerMiddleware from "./middlewares/logger.middleware";
import errorMiddleware from "./middlewares/error.middleware";
import notFoundMiddleware from "./middlewares/notFound.middleware";

const app = express();

// Application Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(loggerMiddleware);

// APIs Routes
app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/feed", feedRouter);
app.use("/api/v1/users", userRouter); 
app.use("/api/v1/users/:userId", followRouter); 
app.use("/api/v1/posts", postRouter); 
app.use("/api/v1/posts/:postId/like", likeRouter);
app.use("/api/v1/posts/:postId/comments", commentRouter);

// Error Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;