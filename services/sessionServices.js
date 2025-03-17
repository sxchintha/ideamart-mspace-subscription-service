import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const db = new Database(path.join(__dirname, "../database/sessions.db"));

// Create sessions table if it doesn't exist
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
 * @param {string} userId - The user ID
 * @param {string} deviceId - The device ID
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
    // Create a new session
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
 * @param {string} userId - The user ID
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
 * @param {string} userId - The user ID
 * @returns {string|null} The device ID or null if not found
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
