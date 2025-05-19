/**
 * Logging Middleware Module
 *
 * This module provides utilities for logging events and HTTP requests.
 * It creates log files with timestamps and unique identifiers for each log entry.
 */
import { format, subMonths, parseISO } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";

// Get the directory name for the current module
const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Ensure logs directory exists
 *
 * @returns {Promise<void>}
 */
const ensureLogsDirectory = async () => {
  const logsDir = path.join(__dirname, "..", "logs");
  try {
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir, { recursive: true });
      console.log("Logs directory created successfully");
    }
  } catch (error) {
    console.error(`Error creating logs directory: ${error.message}`);
    throw error;
  }
};

/**
 * Clean up log files older than 3 months
 *
 * @returns {Promise<void>}
 */
const cleanupOldLogs = async () => {
  const logsDir = path.join(__dirname, "..", "logs");
  const threeMonthsAgo = subMonths(new Date(), 3);

  try {
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      return; // No logs directory, nothing to clean
    }

    // Get all files in the logs directory
    const files = await fsPromises.readdir(logsDir);

    for (const file of files) {
      if (file.startsWith("reqLog_")) {
        try {
          // Extract date from filename (format: reqLog_yyyy-MM-dd.log)
          const dateStr = file.substring(7, 17); // Extract yyyy-MM-dd
          const fileDate = parseISO(dateStr);

          // Check if file is older than 3 months
          if (fileDate < threeMonthsAgo) {
            const filePath = path.join(logsDir, file);
            await fsPromises.unlink(filePath);
            console.log(`Deleted old log file: ${file}`);
          }
        } catch (parseErr) {
          console.error(
            `Error processing log file ${file}: ${parseErr.message}`
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning up old logs: ${error.message}`);
  }
};

/**
 * Log an event message to a specified log file
 *
 * @param {string} message - The message to log
 * @param {string} logName - The name of the log file
 * @returns {Promise<void>}
 */
const logEvents = async (message, logName) => {
  // Format the current date and time for the log entry
  const dateTime = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
  // Create a log entry with timestamp, unique ID, and message
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // Ensure logs directory exists
    await ensureLogsDirectory();

    // Write log to file
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (error) {
    console.error(`Error writing to log file: ${error.message}`);
  }
};

// Track when we last cleaned up logs
let lastCleanupTime = 0;

/**
 * Get client IP address from request
 *
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
const getClientIP = (req) => {
  // Check X-Forwarded-For header first (contains original client IP)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, first one is the original client
    const firstIP = forwardedFor.split(",")[0].trim();
    return firstIP.replace(/^::ffff:/, "");
  }

  // Check X-Real-IP header (set by some proxies)
  const realIP = req.headers["x-real-ip"];
  if (realIP) {
    return realIP.replace(/^::ffff:/, "");
  }

  // Fallback to other methods
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return ip.replace(/^::ffff:/, "");
};

/**
 * Middleware to log HTTP requests and responses
 * Logs the HTTP method, origin, URL, status code, response time, and more
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const logger = (req, res, next) => {
  // Create a log file name with the current date
  const fileName = `reqLog_${format(new Date(), "yyyy-MM-dd")}.log`;

  // Record request start time
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response data
  res.end = function (chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Get client IP address
    const clientIP = getClientIP(req);

    // Get user agent
    const userAgent = req.headers["user-agent"] || "unknown";

    // Create log message with enhanced details
    const logMessage = [
      `${req.method}`,
      `${req.headers.origin || "unknown"}`,
      `${req.url}`,
      `status:${res.statusCode}`,
      `ip:${clientIP}`,
      `time:${responseTime}ms`,
      `agent:${userAgent}`,
    ].join("\t");

    // Log the request and response details
    logEvents(logMessage, fileName).catch((err) =>
      console.error("Failed to log request:", err)
    );

    // Run cleanup once per day (86400000 ms = 24 hours)
    const now = Date.now();
    if (now - lastCleanupTime > 86400000) {
      lastCleanupTime = now;
      cleanupOldLogs().catch((err) =>
        console.error("Failed to clean up old logs:", err)
      );
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding);
  };

  // Continue to the next middleware
  next();
};

/**
 * Log an error event
 *
 * @param {Error} err - The error object
 * @param {string} [additionalInfo=''] - Any additional information
 * @returns {Promise<void>}
 */
const logError = async (err, additionalInfo = "") => {
  const fileName = `errorLog_${format(new Date(), "yyyy-MM-dd")}.log`;
  const errorMessage = `${err.name}: ${err.message}\t${err.stack}\t${additionalInfo}`;

  await logEvents(errorMessage, fileName);
};

export { logger, logEvents, cleanupOldLogs, logError };
