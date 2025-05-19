/**
 * Error Handler Middleware Module
 *
 * This module provides a centralized error handling middleware for the application.
 * It logs errors to a file and sends appropriate error responses to clients.
 */
import { format } from "date-fns";
import { logError } from "./logEvents.js";
import { StatusCode } from "../constants/statusCodes.js";

/**
 * Global error handling middleware
 * Catches errors thrown in route handlers and middleware
 *
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  // Use the status code set in the route handler or default to 500 (Internal Server Error)
  const statusCode =
    res.statusCode && res.statusCode != 200 ? res.statusCode : 500;

  // Log the error with additional request information
  const additionalInfo = `${req.method}\t${req.url}\t${
    req.headers.origin || "unknown"
  }\tIP: ${req.ip || req.socket?.remoteAddress || "unknown"}`;

  // Use the dedicated logError function
  logError(err, additionalInfo).catch((logErr) =>
    console.error("Failed to log error:", logErr)
  );

  // Log the error stack trace to the console for debugging
  console.log(statusCode, err.stack);

  // Send a standardized error response to the client
  res.status(statusCode).send({
    apiStatus: "error",
    message: err.message,
    statusCode: err.cause.statusCode || StatusCode.INTERNAL_SERVER_ERROR,
    // Only include stack trace in development environment
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

export default errorHandler;
