import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) => {
    const clientIp = req.headers["cf-connecting-ip"];

    if (typeof clientIp === "string" && clientIp.trim()) {
      return clientIp.trim();
    }

    return req.ip ?? "unknown";
  },

  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    },
  },
});

export default authRateLimiter;