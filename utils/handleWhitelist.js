/**
 * Utilities for handling whitelist functionality and mock responses
 */

/**
 * Checks if a subscriber ID is whitelisted when whitelist is enabled
 *
 * @param {string} subscriberId - The subscriber ID to check
 * @returns {boolean} True if the subscriber is whitelisted or whitelist is disabled, false otherwise
 */
const isWhitelisted = (subscriberId) => {
  if (process.env.ENABLE_WHITELIST !== "true") {
    return false;
  }

  // Get the list of whitelisted subscriber IDs from environment variables
  const whitelistedSubscriberIds =
    process.env.WHITELISTED_SUBSCRIBER_IDS?.split(",") || [];

  // Check if the subscriber ID is in the whitelist
  return whitelistedSubscriberIds.includes(subscriberId);
};

/**
 * Generates a mock success response for whitelisted subscribers
 *
 * @param {string} subscriberId - The subscriber ID to include in the reference number
 * @returns {Object} A mock success response object
 */
const getMockOtpRequestResponse = (subscriberId) => {
  return {
    data: {
      referenceNo: `${subscriberId}111111111111111111111`,
      statusDetail: "Request was successfully processed.",
      version: "1.0",
      statusCode: "S1000",
    },
  };
};

/**
 * Generates a mock success response for whitelisted subscribers
 *
 * @param {string} otp - The OTP to include in the response
 * @returns {Object} A mock success response object
 */
const getMockOtpVerifyResponse = (otp) => {
  if (otp === "123456") {
    return {
      data: {
        version: "1.0",
        statusCode: "S1000",
        subscriptionStatus: "REGISTERED",
        statusDetail: "Success",
        subscriberId:
          "tel:sdfasdfasdfwqerqwtgfgsafgasfgasdfasdfasdfasdfasdfasf",
      },
    };
  } else {
    return {
      data: {
        statusDetail: "Invalid OTP",
        version: "1.0",
        statusCode: "E1850",
      },
    };
  }
};

/**
 * Generates a mock success response for whitelisted subscribers
 *
 * @returns {Object} A mock success response object
 */
const getMockUnsubscribeResponse = () => {
  return {
    data: {
      version: "1.0.",
      statusCode: "S1000",
      statusDetail: "not registered",
      subscriptionStatus: "UNREGISTERED.",
    },
  };
};

/**
 * Generates a mock success response for whitelisted subscribers
 *
 * @returns {Object} A mock success response object
 */
const getMockGetStatusResponse = () => {
  return {
    data: {
      subscriptionStatus: "REGISTERED",
      statusDetail: "Request was successfully processed.",
      version: "1.0",
      statusCode: "S1000",
    },
  };
};

/**
 * Generates a mock success response for whitelisted subscribers
 *
 * @returns {Object} A mock success response object
 */
const getMockGetChargingInfoResponse = () => {
  return {
    data: {
      version: "1.0",
      destinationResponses: [
        {
          subscriberId: "tel:94712342345",
          subscriptionStatus: "REGISTERED",
          lastChargedDate: "2020-01-23 22:03:22",
          lastChargedAmount: "30.00 LKR",
          numberType: "postpaid",
          statusCode: "S1000",
          statusDetail: "Request was successfully processes",
        },
      ],
      statusCode: "S1000",
      statusDetail: "Success.",
    },
  };
};

export {
  isWhitelisted,
  getMockOtpRequestResponse,
  getMockOtpVerifyResponse,
  getMockUnsubscribeResponse,
  getMockGetStatusResponse,
  getMockGetChargingInfoResponse,
};
