import { Request, Response } from "express";

const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};

export default notFoundMiddleware;