import { describe, expect, it } from "vitest";
import { signUp } from "./helpers.js";

describe("error handler", () => {
  it("returns a JSON error response for an error thrown without a cause", async () => {
    const user = await signUp();

    const res = await user.post("/subscription/otp/request", {});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      apiStatus: "error",
      message: "subscriberId is required",
      statusCode: "INTERNAL_SERVER_ERROR",
    });
  });
});
