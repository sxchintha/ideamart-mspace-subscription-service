import request from "supertest";
import { randomUUID } from "crypto";
import { getAuth } from "firebase-admin/auth";
import app from "../app.js";
import { carrier } from "./carrier.js";

const project = process.env.GCLOUD_PROJECT;
const authHost = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
const firestoreHost = `http://${process.env.FIRESTORE_EMULATOR_HOST}`;

export const clearFirestore = () =>
  fetch(
    `${firestoreHost}/emulator/v1/projects/${project}/databases/(default)/documents`,
    { method: "DELETE" }
  );

/**
 * Create a Firebase user on the Auth emulator and return a client for the API
 * that sends their ID token and a registered device id, like the apps do.
 */
export const signUp = async () => {
  const email = `${randomUUID()}@example.com`;
  const password = "password123";
  const { uid } = await getAuth().createUser({ email, password });

  const idToken = async () => {
    const res = await fetch(
      `${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    return (await res.json()).idToken;
  };

  const deviceId = randomUUID();
  const post = async (path, body = {}) =>
    request(app)
      .post(path)
      .set("Authorization", `Bearer ${await idToken()}`)
      .set("x-device-id", deviceId)
      .send(body);

  const get = async (path) =>
    request(app)
      .get(path)
      .set("Authorization", `Bearer ${await idToken()}`)
      .set("x-device-id", deviceId);

  await post("/auth/update-device", { deviceId });

  return { uid, email, get, post };
};

export const REGISTERED = {
  version: "1.0",
  statusCode: "S1000",
  subscriptionStatus: "REGISTERED",
  statusDetail: "Success",
};

export const UNREGISTERED = {
  version: "1.0",
  statusCode: "E1951",
  statusDetail: "User not registered",
};

/** Subscribe `user` to `subscriberId` through the OTP flow. */
export const subscribe = async (user, subscriberId, maskedId = `tel:masked-${subscriberId}`) => {
  carrier("/otp/verify", { ...REGISTERED, subscriberId: maskedId });
  return user.post("/subscription/otp/verify", {
    subscriberId,
    referenceNo: "ref-1",
    otp: "123456",
  });
};
