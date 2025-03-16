import { verifyFirebaseUser } from "../services/firebaseServices.js";

/**
 * Middleware to verify user authentication using Firebase ID token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header containing the Firebase ID token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */

const verifyUserMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

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
    const decodedToken = await verifyFirebaseUser(idToken);
    if (!decodedToken) {
      res.status(401).send({ apiStatus: "error", message: "Unauthorized" });
    } else {
      req.user = decodedToken;
      next();
    }
  } catch (error) {
    res.status(401).send({ apiStatus: "error", message: error.message });
  }
};

export { verifyUserMiddleware };
