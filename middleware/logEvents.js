/**
 * Logging Middleware Module
 *
 * This module provides utilities for logging events and HTTP requests.
 * It creates log files with timestamps and unique identifiers for each log entry.
 */
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";

// Get the directory name for the current module
const __dirname = path.dirname(new URL(import.meta.url).pathname);

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

  // NOTE: File writing is currently commented out
  // try {
  //   if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
  //     await fsPromises.writeFile(path.join(__dirname, "..", "logs"), "");
  //   }

  //   await fsPromises.appendFile(
  //     path.join(__dirname, "..", "logs", logName),
  //     logItem
  //   );
  // } catch (error) {
  //   console.error(error);
  // }
};

/**
 * Middleware to log HTTP requests
 * Logs the HTTP method, origin, and URL for each request
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const logger = async (req, res, next) => {
  // Create a log file name with the current date
  const fileName = `reqLog_${format(new Date(), "yyyy-MM-dd")}.log`;
  // Log the request details
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, fileName);
  // Continue to the next middleware
  next();
};

export { logger, logEvents };
