import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

const healthCheck = (req: Request, res: Response) => {
  const data = getHealthStatus();
  res.json({
    success: true,
    data,
  });
};

export { healthCheck };