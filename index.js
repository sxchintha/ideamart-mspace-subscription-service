/**
 * Main entry point for the MCQ Karamu Backend API
 * This file sets up the Express server, middleware, and routes
 */
import "dotenv/config";
import express from "express";

import errorHandler from "./middleware/errorHandler.js";
import { standardLimiter } from "./middleware/rateLimit.js";

// Import route modules
import subscriptionRoute from "./routes/subscriptionRoute.js";
import authRoute from "./routes/authRoute.js";

// Server configuration
const PORT = process.env.PORT || 8080;

// Initialize Express application
const app = express();

// Trust proxy - this is important for getting real client IPs behind AWS ELB/ALB
app.set("trust proxy", true);

app.use(express.json());

// Custom middleware for logging all requests
import { logger } from "./middleware/logEvents.js";
app.use(logger);

/****************** Routes Configuration ******************/
// Root route - simple health check endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Apply rate limiting middleware globally to protect against abuse
// This limits each IP to 100 requests per 15-minute window
app.use(standardLimiter);

// User verification middleware - authenticates users via Firebase
import { verifyUserMiddleware } from "./middleware/verifyUser.js";
app.use(verifyUserMiddleware);

// Auth Routes - These handle their own session verification internally
app.use("/auth", authRoute);

// Apply session verification middleware for all subsequent routes
// This ensures device verification for protected endpoints
import { verifySessionMiddleware } from "./middleware/verifySession.js";
app.use(verifySessionMiddleware);

// Subscription Routes - These require session verification
app.use("/subscription", subscriptionRoute);

// 404 Error handler for undefined routes
app.use((req, res) => {
  res.status(404).send("404 Error: Page not found");
});
/*********************************************/

// Global error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
