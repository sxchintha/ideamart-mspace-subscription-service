# Middleware Documentation

## Rate Limiting

The application uses `express-rate-limit` to protect API endpoints from abuse by limiting the number of requests that can be made by a single IP address within a specified time window.

### Available Rate Limiters

1. **Standard Limiter (`standardLimiter`)**

   - Applied globally to all routes
   - Limit: 100 requests per 15-minute window per IP
   - Use case: General protection for all API endpoints

2. **Authentication Limiter (`authLimiter`)**

   - Applied specifically to `/auth` routes
   - Limit: 5 requests per 15-minute window per IP
   - Use case: Protect against brute force attacks on authentication endpoints

3. **Heavy Operation Limiter (`heavyOperationLimiter`)**
   - Available for resource-intensive operations
   - Limit: 30 requests per 60-minute window per IP
   - Use case: Protect endpoints that consume significant server resources

### How to Apply

1. **Global application** (already applied in index.js):

   ```javascript
   // Apply standard rate limiting middleware globally
   app.use(standardLimiter);
   ```

2. **Route-specific application**:

   ```javascript
   // Example: Apply to a specific route
   app.use(
     "/api/resource-intensive-endpoint",
     heavyOperationLimiter,
     yourRouteHandler
   );
   ```

3. **Router-level application**:

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
