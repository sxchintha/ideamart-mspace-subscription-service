import express from "express";
import {
  handleGetSubscriberId,
  updateDevice,
  checkDevice,
} from "../controllers/authController.js";
import { verifySessionMiddleware } from "../middleware/verifySession.js";

const route = express.Router();

// Routes that don't require session verification
route.get("/subscriber-id", handleGetSubscriberId);
route.post("/update-device", updateDevice);
route.get("/check-device", checkDevice);

// Apply session verification middleware for routes that require it
route.use(verifySessionMiddleware);

// Routes that require session verification
// Add any routes that need device verification here

export default route;
