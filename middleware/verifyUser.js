/**
 * User Verification Middleware Module
 *
 * This module provides middleware for authenticating users via Firebase.
 * It extracts and verifies the Firebase ID token from the Authorization header
 * and attaches the decoded user information to the request object.
 */
import { verifyFirebaseUser } from "../services/firebaseServices.js";

/**
 * Middleware to verify user authentication using Firebase ID token from Authorization header
 * This middleware is applied globally to all routes in the application
 *
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header containing the Firebase ID token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const verifyUserMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and has the correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({
      apiStatus: "error",
      message: "Authorization header with Bearer token is required",
    });
    return;
  }

  // Extract the token from "Bearer <token>"
  const idToken = authHeader.split(" ")[1];

  try {
    // Verify the token with Firebase
    const decodedToken = await verifyFirebaseUser(idToken);
    if (!decodedToken) {
      res.status(401).send({ apiStatus: "error", message: "Unauthorized" });
    } else {
      // Attach the verified user object to the request for use in subsequent middleware and routes
      req.user = decodedToken;
      next();
    }
  } catch (error) {
    res.status(401).send({ apiStatus: "error", message: error.message });
  }
};

export { verifyUserMiddleware };
