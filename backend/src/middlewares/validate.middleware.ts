import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidationTarget = "body" | "query" | "params";

const validate = (
  schema: ZodSchema,
  target: ValidationTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[target];

    const result = schema.safeParse(data);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: result.error.flatten().fieldErrors,
        },
      });
    }

    if (target === "body") {
      req.body = result.data;
    }

    next();
  };
};

export default validate;