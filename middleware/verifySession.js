/**
 * Session Verification Middleware Module
 *
 * This module provides middleware for verifying user sessions based on device IDs.
 * It ensures that users can only access protected routes from their registered device,
 * implementing a security measure to prevent unauthorized access from different devices.
 */
import { isValidDevice } from "../services/sessionServices.js";
import { StatusCode } from "../constants/index.js";

/**
 * Middleware to verify user device
 * This middleware should be used after verifyUserMiddleware to ensure the user
 * is accessing the API from their registered device.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (set by verifyUserMiddleware)
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers["x-device-id"] - Device ID from request header
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const verifySessionMiddleware = (req, res, next) => {
  // Skip session verification for device registration route
  // This allows users to register a new device without having a valid session
  if (
    req.path.includes("/update-device") ||
    req.path.includes("/subscription/get-status") ||
    req.path.includes("/subscription/get-charging-info")
  ) {
    return next();
  }

  const deviceId = req.headers["x-device-id"];

  // Check if device ID is provided in the request headers
  if (!deviceId) {
    return res.status(401).send({
      apiStatus: "error",
      message: "Device ID is required",
    });
  }

  // Ensure user is authenticated (should be set by verifyUserMiddleware)
  if (!req.user || !req.user.uid) {
    return res.status(401).send({
      apiStatus: "error",
      message: "User authentication required",
    });
  }

  // Verify that the device ID matches the registered device for this user
  const isValid = isValidDevice(req.user.uid, deviceId);

  if (!isValid) {
    return res.status(401).send({
      apiStatus: "error",
      message: "This account is logged in on another device",
      statusCode: StatusCode.DEVICE_MISMATCH,
    });
  }

  // Add device ID to request object for later use in route handlers
  req.deviceId = deviceId;
  next();
};

export { verifySessionMiddleware };
