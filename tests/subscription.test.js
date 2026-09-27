import { beforeEach, describe, expect, it } from "vitest";
import { clearFirestore, signUp, subscribe } from "./helpers.js";

const NUMBER = "94771234567";

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
