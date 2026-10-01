import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    },
  },
  handler: (req, res, next, options) => {
    console.log("RATE LIMIT HIT", {
      ip: req.ip,
      ips: req.ips,
      forwardedFor: req.headers["x-forwarded-for"],
    });

    res.status(options.statusCode).json(options.message);
  },
});

export default authRateLimiter;