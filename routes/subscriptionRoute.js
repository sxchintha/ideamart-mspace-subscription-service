/**
 * Subscription Routes Module
 *
 * This module defines routes related to subscription management, including
 * OTP-based verification, subscription status checks, and unsubscribe functionality.
 * All routes in this module require both user authentication and session verification.
 */
import express from "express";
import {
  handleOtpRequest,
  handleOtpVerify,
  handleUnsubscribe,
  handleGetStatus,
  handleGetChargingInfo,
} from "../controllers/subscriptionController.js";

const route = express.Router();

// Request an OTP for subscription verification
route.post("/otp/request", handleOtpRequest);

// Verify an OTP to complete subscription process
route.post("/otp/verify", handleOtpVerify);

// Unsubscribe a user from the service
route.post("/unsubscribe", handleUnsubscribe);

// Get the current subscription status for a user
route.post("/get-status", handleGetStatus);

// Get charging information for a subscriber
route.post("/get-charging-info", handleGetChargingInfo);

export default route;
