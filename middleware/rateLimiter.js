import rateLimit from "express-rate-limit";

// 🛡 Strict limiter for auth endpoints (login/register)
// 5 attempts per IP per 15 min — blocks brute-force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// General API limiter — generous, just stops abuse.
// 100 requests per IP per 15 min.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Slow down a bit.",
  },
});
