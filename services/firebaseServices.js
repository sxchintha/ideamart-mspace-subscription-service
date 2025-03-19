/**
 * Firebase Services Module
 *
 * This module provides services for Firebase integration, including user authentication,
 * Firestore database operations, and subscriber ID management. It handles the connection
 * to Firebase and provides methods for verifying users and managing subscriber data.
 */

// Initialize Firebase Admin SDK
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../config/firebase.json" assert { type: "json" };
import validateSubscriberId from "../utils/validateSubscriberId.js";

// Initialize Firebase application with service account credentials
initializeApp({
  credential: cert(serviceAccount),
});

// Get references to Firestore collection and Auth service
const collectionRef = getFirestore().collection("masked-ids");
const admin = getAuth();

/**
 * Verify a Firebase ID token and return the decoded user information
 * Used by the authentication middleware to validate user requests
 *
 * @param {string} idToken - The Firebase ID token to verify
 * @returns {Object} Decoded token containing user information
 * @throws {Error} If token verification fails
 */
const verifyFirebaseUser = async (idToken) => {
  try {
    const decodedToken = await admin.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(error.message ?? "Unauthorized");
  }
};

/**
 * Save a subscriber ID and its masked version to Firestore
 * Associates a subscriber ID with a Firebase user account
 *
 * @param {Object} user - The Firebase user object
 * @param {string} subscriberId - The subscriber identifier (phone number)
 * @param {string} maskedId - The masked version of the subscriber ID
 * @returns {boolean} True if save was successful, false otherwise
 */
const saveSubscriberId = async (user, subscriberId, maskedId) => {
  console.log("Saving subscriber id", user, subscriberId, maskedId);

  if (!subscriberId || !maskedId) {
    console.log("Invalid subscriber id or masked id");
    return false;
  }

  try {
    // Prepare data for Firestore document
    const data = {
      userId: user.uid,
      subscriberId,
      maskedId,
      createdAt: Timestamp.now(),
    };

    const docRef = collectionRef.doc(subscriberId);

    // Save data to Firestore
    await docRef.set(data);

    return true;
  } catch (error) {
    console.log("Error in saveSubscriberId", error);
    return false;
  }
};

/**
 * Get the masked ID for a subscriber ID from Firestore
 * Used to retrieve the masked version of a subscriber ID for API calls
 *
 * @param {string} subscriberId - The subscriber identifier (phone number)
 * @returns {string} The masked subscriber ID
 * @throws {Error} If subscriber ID is not found in the database
 */
const getMaskedId = async (subscriberId) => {
  // Ensure subscriber ID is in the correct format
  subscriberId = validateSubscriberId(subscriberId, null);

  const docRef = collectionRef.doc(subscriberId);

  const doc = await docRef.get();

  if (doc.exists) {
    return doc.data().maskedId;
  } else {
    console.log("Error in getMaskedId", subscriberId);
    throw new Error("Subscriber id not found in database");
  }
};

/**
 * Get the subscriber ID associated with a Firebase user ID
 * Used to retrieve the subscriber ID for an authenticated user
 *
 * @param {string} userId - The Firebase user ID
 * @returns {string} The subscriber ID associated with the user
 * @throws {Error} If no subscriber ID is found for the user
 */
const getSubscriberIdByUserId = async (userId) => {
  const docRef = await collectionRef.where("userId", "==", userId).get();

  if (docRef.docs.length > 0) {
    return docRef.docs[0].data().subscriberId;
  } else {
    throw new Error("Subscriber id not found in database");
  }
};

export {
  saveSubscriberId,
  getMaskedId,
  verifyFirebaseUser,
  getSubscriberIdByUserId,
};
