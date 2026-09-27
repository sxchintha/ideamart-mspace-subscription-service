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
import { readFileSync } from "fs";
import validateSubscriberId from "../utils/validateSubscriberId.js";

// Initialize Firebase with service account credentials, or against the emulators in tests
if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT });
} else {
  const serviceAccount = JSON.parse(
    readFileSync(new URL("../config/firebase.json", import.meta.url), "utf8")
  );
  initializeApp({ credential: cert(serviceAccount) });
}

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
  console.log("Saving subscriber id", subscriberId, maskedId);

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
 * Get the masked-ids entry linking a subscriber ID to a user
 *
 * @param {string} subscriberId - The subscriber identifier (phone number)
 * @returns {Object|null} The entry ({ userId, subscriberId, maskedId }), or null if the number isn't linked
 */
const getSubscriberLink = async (subscriberId) => {
  // Ensure subscriber ID is in the correct format
  subscriberId = validateSubscriberId(subscriberId, null);

  const doc = await collectionRef.doc(subscriberId).get();
  return doc.exists ? doc.data() : null;
};

/**
 * Get every masked-ids entry linked to a user
 *
 * @param {string} userId - The Firebase user ID
 * @returns {Object[]} The user's entries ({ userId, subscriberId, maskedId })
 */
const getSubscriberLinksByUserId = async (userId) => {
  const snapshot = await collectionRef.where("userId", "==", userId).get();
  return snapshot.docs.map((doc) => doc.data());
};

/**
 * Remove a user's links to numbers other than the one they just subscribed with
 *
 * @param {string} userId - The Firebase user ID
 * @param {string} subscriberId - The subscriber ID to keep
 * @returns {Promise<void>}
 */
const deleteOtherSubscriberLinks = async (userId, subscriberId) => {
  const links = await getSubscriberLinksByUserId(userId);
  await Promise.all(
    links
      .filter((link) => link.subscriberId !== subscriberId)
      .map((link) => collectionRef.doc(link.subscriberId).delete())
  );
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
  getSubscriberLink,
  getSubscriberLinksByUserId,
  deleteOtherSubscriberLinks,
  verifyFirebaseUser,
  getSubscriberIdByUserId,
};
