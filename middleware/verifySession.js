import { isValidDevice } from "../services/sessionServices.js";
import { StatusCode } from "../constants/index.js";

/**
 * Middleware to verify user device
 * This middleware should be used after verifyUserMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const verifySessionMiddleware = (req, res, next) => {
  // Skip session verification for login, register, and update-device routes
  if (req.path.includes("/update-device")) {
    return next();
  }

  const deviceId = req.headers["x-device-id"];

  if (!deviceId) {
    return res.status(401).send({
      apiStatus: "error",
      message: "Device ID is required",
    });
  }

  // req.user should be set by verifyUserMiddleware
  if (!req.user || !req.user.uid) {
    return res.status(401).send({
      apiStatus: "error",
      message: "User authentication required",
    });
  }

  const isValid = isValidDevice(req.user.uid, deviceId);

  if (!isValid) {
    return res.status(401).send({
      apiStatus: "error",
      message: "This account is logged in on another device",
      statusCode: StatusCode.DEVICE_MISMATCH,
    });
  }

  // Add device ID to request object for later use
  req.deviceId = deviceId;
  next();
};

export { verifySessionMiddleware };
