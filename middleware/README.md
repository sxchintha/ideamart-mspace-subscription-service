# Middleware Documentation

## Rate Limiting

The application uses `express-rate-limit` to protect API endpoints from abuse by limiting the number of requests that can be made by a single IP address within a specified time window.

### Currently Implemented Rate Limiting

The application uses a single global rate limiter:

**Standard Limiter (`standardLimiter`)**

- Applied globally to all routes
- Limit: 100 requests per 15-minute window per IP
- Use case: General protection for the entire API against abuse

### How It's Applied

In the main `index.js` file, the rate limiter is applied globally:

```javascript
// Apply rate limiting middleware globally to protect against abuse
// This limits each IP to 100 requests per 15-minute window
app.use(standardLimiter);
```

### Additional Rate Limiters (Not Currently Used)

The `rateLimit.js` file includes additional rate limiter configurations that can be enabled if needed:

1. **Authentication Limiter (`authLimiter`)**

   - Could be applied to auth routes for stricter limits
   - Configured for 5 requests per 15-minute window per IP
   - Use case: Protect against brute force attacks on authentication endpoints

2. **Heavy Operation Limiter (`heavyOperationLimiter`)**
   - Could be applied to resource-intensive operations
   - Configured for 30 requests per 60-minute window per IP
   - Use case: Protect endpoints that consume significant server resources

### Applying Additional Rate Limiters

If needed in the future, you can apply additional rate limiters in various ways:

1. **Route-specific application**:

   ```javascript
   // Example: Apply to a specific route
   import { authLimiter } from "./middleware/rateLimit.js";
   app.use("/auth", authLimiter, authRoute);
   ```

2. **Router-level application**:

   ```javascript
   // Example: Apply to all routes in a router
   import express from "express";
   import { heavyOperationLimiter } from "../middleware/rateLimit.js";

   const router = express.Router();
   router.use(heavyOperationLimiter);

   // Define routes...
   export default router;
   ```

### Customizing Rate Limits

To create a new rate limiter with custom settings, import the `rateLimit` function from `express-rate-limit` and define your limiter:

```javascript
import rateLimit from "express-rate-limit";

const customLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    status: 429,
    message: "Custom rate limit message",
  },
});
```
