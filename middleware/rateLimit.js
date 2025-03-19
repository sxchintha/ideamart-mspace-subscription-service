/**
 * Rate limiting middleware to protect the API from abuse
 * Uses express-rate-limit to limit the number of requests from a single IP
 *
 * Currently, only the standardLimiter is applied globally in the application.
 * The other limiters are defined but not currently in use.
 */
import rateLimit from "express-rate-limit";

// Standard rate limiter for general API endpoints - CURRENTLY IN USE
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});

// Stricter rate limiter for sensitive operations (e.g., login attempts) - NOT CURRENTLY IN USE
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Rate limiter for resource-intensive operations - NOT CURRENTLY IN USE
export const heavyOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Rate limit exceeded for resource-intensive operations.",
  },
});
