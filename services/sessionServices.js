/**
 * Session Services Module
 *
 * This module provides services for managing user sessions and device authentication.
 * It uses SQLite to store session information, allowing for device-based authentication
 * where users can only be logged in from one device at a time.
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../database");

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

// Initialize SQLite database for session storage
const db = new Database(path.join(dbPath, "sessions.db"));

// Create sessions table if it doesn't exist
// This table stores user sessions with device information
// The UNIQUE constraint on userId ensures one active session per user
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    deviceId TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    isActive INTEGER DEFAULT 1,
    UNIQUE(userId)
  )
`);

/**
 * Register or update a device for a user
 * This function either creates a new session or updates an existing one
 * with a new device ID, implementing the "one device per user" policy
 *
 * @param {string} userId - The user ID from Firebase authentication
 * @param {string} deviceId - The device ID to register
 * @returns {Object} Session object with id and updatedAt timestamp
 */
const registerDevice = (userId, deviceId) => {
  const now = Math.floor(Date.now() / 1000);
  const sessionId = uuidv4();

  // Check if user already has a session
  const checkStmt = db.prepare("SELECT * FROM sessions WHERE userId = ?");
  const existingSession = checkStmt.get(userId);

  if (existingSession) {
    // Update existing session with new device ID
    // This effectively logs out any other device
    const updateStmt = db.prepare(`
      UPDATE sessions 
      SET deviceId = ?, updatedAt = ?, isActive = 1
      WHERE userId = ?
    `);
    updateStmt.run(deviceId, now, userId);

    return {
      id: existingSession.id,
      deviceId,
      updatedAt: now,
    };
  } else {
    // Create a new session for first-time login
    const insertStmt = db.prepare(`
      INSERT INTO sessions (id, userId, deviceId, createdAt, updatedAt, isActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insertStmt.run(sessionId, userId, deviceId, now, now);

    return {
      id: sessionId,
      deviceId,
      updatedAt: now,
    };
  }
};

/**
 * Check if the device is the current registered device for the user
 * Used by the session verification middleware to validate requests
 *
 * @param {string} userId - The user ID from Firebase authentication
 * @param {string} deviceId - The device ID to check
 * @returns {boolean} True if device is valid, false otherwise
 */
const isValidDevice = (userId, deviceId) => {
  const stmt = db.prepare(`
    SELECT * FROM sessions 
    WHERE userId = ? AND deviceId = ? AND isActive = 1
  `);

  const session = stmt.get(userId, deviceId);
  return !!session;
};

/**
 * Get the current device ID for a user
 * Used to check which device is currently registered for a user
 *
 * @param {string} userId - The user ID from Firebase authentication
 * @returns {Object|null} Object with deviceId and updatedAt, or null if not found
 */
const getCurrentDeviceId = (userId) => {
  const stmt = db.prepare(`
    SELECT deviceId, updatedAt FROM sessions 
    WHERE userId = ? AND isActive = 1
  `);

  const session = stmt.get(userId);
  return session
    ? { deviceId: session.deviceId, updatedAt: session.updatedAt }
    : null;
};

export { registerDevice, isValidDevice, getCurrentDeviceId };
