import { getFirestore } from "firebase-admin/firestore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { carrier } from "./carrier.js";
import { clearFirestore, REGISTERED, signUp, subscribe, UNREGISTERED } from "./helpers.js";

const NUMBER = "94771234567";
const OTHER_NUMBER = "94777654321";

beforeEach(clearFirestore);

describe("OTP verify", () => {
  it("links the number to the caller", async () => {
    const user = await signUp();

    const res = await subscribe(user, NUMBER);

    expect(res.status).toBe(200);
    expect(res.body.apiStatus).toBe("success");
    const linked = await user.get("/auth/subscriber-id");
    expect(linked.body.subscriberId).toBe(NUMBER);
  });
});

describe.each([
  ["/subscription/get-status", "/getStatus", REGISTERED],
  ["/subscription/unsubscribe", "/subscription/send", { ...REGISTERED, subscriptionStatus: "UNREGISTERED" }],
  [
    "/subscription/get-charging-info",
    "/getSubscriberChargingInfo",
    { version: "1.0", statusCode: "S1000", destinationResponses: [] },
  ],
])("%s", (path, carrierEndpoint, carrierResponse) => {
  it("acts on a number linked to the caller", async () => {
    const owner = await signUp();
    await subscribe(owner, NUMBER);
    carrier(carrierEndpoint, carrierResponse);

    const res = await owner.post(path, { subscriberId: "0771234567" });

    expect(res.status).toBe(200);
    expect(res.body.apiStatus).toBe("success");
  });

  it("rejects a number linked to another account without calling the carrier", async () => {
    const owner = await signUp();
    const intruder = await signUp();
    await subscribe(owner, NUMBER);

    const res = await intruder.post(path, { subscriberId: NUMBER });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ apiStatus: "error", statusCode: "SUBSCRIBER_ID_NOT_OWNED" });
  });
});

describe("one number per account, one account per number", () => {
  it("rejects a number linked to another account that is still subscribed", async () => {
    const owner = await signUp();
    const other = await signUp();
    await subscribe(owner, NUMBER);
    carrier("/getStatus", REGISTERED);

    const res = await subscribe(other, NUMBER);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ apiStatus: "error", statusCode: "SUBSCRIBER_ID_IN_USE" });
  });

  it("rejects a second number while the account's current number is still subscribed", async () => {
    const user = await signUp();
    await subscribe(user, NUMBER);
    carrier("/getStatus", REGISTERED);

    const res = await subscribe(user, OTHER_NUMBER);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ apiStatus: "error", statusCode: "USER_ALREADY_SUBSCRIBED" });
  });

  it("lets the same account subscribe its own number again", async () => {
    const user = await signUp();
    await subscribe(user, NUMBER);

    const res = await subscribe(user, NUMBER);

    expect(res.status).toBe(200);
  });

  it.each([
    ["an E1951 error", UNREGISTERED],
    ["an UNREGISTERED. status", { ...REGISTERED, subscriptionStatus: "UNREGISTERED." }],
  ])("relinks a number to a new account once the carrier reports %s", async (_, status) => {
    const previous = await signUp();
    const next = await signUp();
    await subscribe(previous, NUMBER);
    carrier("/getStatus", status);

    const res = await subscribe(next, NUMBER);

    expect(res.status).toBe(200);
    const previousStatus = await previous.post("/subscription/get-status", { subscriberId: NUMBER });
    expect(previousStatus.status).toBe(403);
  });

  it("treats a failed status check as still subscribed", async () => {
    const owner = await signUp();
    const other = await signUp();
    await subscribe(owner, NUMBER);
    carrier("/getStatus", { statusCode: "E1603", statusDetail: "System error" }, 500);

    const res = await subscribe(other, NUMBER);

    expect(res.status).toBe(409);
  });

  it("relinks a number whose account was deleted without calling the carrier", async () => {
    const deleted = await signUp();
    const next = await signUp();
    await subscribe(deleted, NUMBER);
    await getFirestore().doc(`masked-ids/${NUMBER}`).update({ userId: null });

    const res = await subscribe(next, NUMBER);

    expect(res.status).toBe(200);
  });

  it("moves an account to a new number once its old number has been unsubscribed", async () => {
    const user = await signUp();
    await subscribe(user, NUMBER);
    carrier("/getStatus", UNREGISTERED);

    const res = await subscribe(user, OTHER_NUMBER);

    expect(res.status).toBe(200);
    const linked = await user.get("/auth/subscriber-id");
    expect(linked.body.subscriberId).toBe(OTHER_NUMBER);
    const oldStatus = await user.post("/subscription/get-status", { subscriberId: NUMBER });
    expect(oldStatus.body.statusCode).toBe("SUBSCRIBER_ID_NOT_FOUND");
  });
});

describe("whitelisted test numbers", () => {
  const TEST_NUMBER = "94700000000";

  beforeEach(() => {
    vi.stubEnv("ENABLE_WHITELIST", "true");
    vi.stubEnv("WHITELISTED_SUBSCRIBER_IDS", TEST_NUMBER);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("go through the same linking and ownership rules with a mocked carrier", async () => {
    const tester = await signUp();
    const other = await signUp();

    const verify = await tester.post("/subscription/otp/verify", {
      subscriberId: TEST_NUMBER,
      referenceNo: "ref-1",
      otp: "123456",
    });

    expect(verify.status).toBe(200);
    const status = await tester.post("/subscription/get-status", { subscriberId: TEST_NUMBER });
    expect(status.body.subscriptionStatus).toBe("REGISTERED");
    const intruder = await other.post("/subscription/get-status", { subscriberId: TEST_NUMBER });
    expect(intruder.status).toBe(403);
  });
});
