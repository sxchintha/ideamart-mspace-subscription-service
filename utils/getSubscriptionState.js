import checkStatusCode from "./checkStatusCode.js";

export const SUBSCRIPTION_STATE = {
  REGISTERED: "REGISTERED",
  UNREGISTERED: "UNREGISTERED",
  // A failed or pending request tells us nothing about the subscription
  UNKNOWN: "UNKNOWN",
};

// Carrier status code for a number that isn't subscribed
const UNREGISTERED_STATUS_CODE = "E1951";

/**
 * Read the subscription state from a carrier response
 *
 * @param {Object} response - Carrier API response
 * @returns {string} One of SUBSCRIPTION_STATE
 */
const getSubscriptionState = (response) => {
  const { statusCode, subscriptionStatus } = response?.data ?? {};

  if (checkStatusCode(statusCode) && subscriptionStatus === "REGISTERED") {
    return SUBSCRIPTION_STATE.REGISTERED;
  }

  // Some responses spell it "UNREGISTERED." with a trailing dot
  if (
    statusCode === UNREGISTERED_STATUS_CODE ||
    subscriptionStatus?.startsWith("UNREGISTERED")
  ) {
    return SUBSCRIPTION_STATE.UNREGISTERED;
  }

  return SUBSCRIPTION_STATE.UNKNOWN;
};

export default getSubscriptionState;
