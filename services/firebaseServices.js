// initialize firebase
import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "../config/ttest-4bb00-firebase-adminsdk-x5lko-19d21f50cd.json" assert { type: "json" };
import {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} from "firebase-admin/firestore";
import validateSubscriberId from "../utils/validateSubscriberId.js";

initializeApp({
  credential: cert(serviceAccount),
});

const collectionRef = getFirestore().collection("masked-ids");

const saveSubscriberId = async (subscriberId, maskedId) => {
  console.log("Saving subscriber id", subscriberId, maskedId);

  if (!subscriberId || !maskedId) {
    console.log("Invalid subscriber id or masked id");
    return false;
  }

  try {
    const data = {
      subscriberId,
      maskedId,
      createdAt: Timestamp.now(),
    };

    const docRef = collectionRef.doc(subscriberId);

    await docRef.set(data);

    return true;
  } catch (error) {
    console.log("Error in saveSubscriberId", error);
    return false;
  }
};

const getMaskedId = async (subscriberId) => {
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

export { saveSubscriberId, getMaskedId };
