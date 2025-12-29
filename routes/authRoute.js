/**
 * Authentication Routes Module
 *
 * This module defines routes related to user authentication, device management,
 * and subscriber identification. It handles both authenticated and unauthenticated
 * endpoints with appropriate middleware.
 */
import express from "express";
import {
  handleGetSubscriberId,
  updateDevice,
  checkDevice,
} from "../controllers/authController.js";
import { verifySessionMiddleware } from "../middleware/verifySession.js";

const route = express.Router();

/**
 * Public Authentication Routes
 * These routes don't require session verification but still require user authentication
 * via the global verifyUserMiddleware applied in index.js
 */
// Get the subscriber ID associated with the authenticated user
route.get("/subscriber-id", handleGetSubscriberId);
// Register or update a device for the authenticated user
route.post("/update-device", updateDevice);
// Check if the current device is registered for the authenticated user
route.get("/check-device", checkDevice);

/**
 * Protected Authentication Routes
 * These routes require both user authentication and session verification
 */
// Apply session verification middleware for routes that require it
route.use(verifySessionMiddleware);

// Routes that require session verification
// Add any routes that need device verification here

export default route;
