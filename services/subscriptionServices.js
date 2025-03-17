/**
 * Subscription Services Module
 *
 * This module provides services for interacting with the subscription API endpoints.
 * It handles OTP-based verification, subscription status checks, and unsubscribe functionality.
 * Each service function makes API requests to the appropriate service provider endpoint.
 */
import { AxiosError } from "axios";
import { API_ENDPOINT } from "../constants/apiConstants.js";
import {
  DEFAULT_META_DATA,
  SUBSCRIPTION_ACTION,
} from "../constants/requestData.js";
import apiRequest from "../utils/apiRequest.js";

/**
 * Request an OTP for subscription verification
 * Sends a request to the service provider to generate and send an OTP to the subscriber
 *
 * @param {string} serviceProvider - The service provider code (e.g., 'dialog', 'mobitel')
 * @param {string} subscriberId - The subscriber identifier (phone number)
 * @param {string} device - Device information for the request
 * @param {string} os - Operating system information for the request
 * @returns {Object} Response from the OTP request API
 * @throws {Error} If subscriberId is missing or API request fails
 */
const otpRequestService = async (serviceProvider, subscriberId, device, os) => {
  if (!subscriberId) {
    throw new Error("subscriberId is required");
  }

  try {
    // Prepare request data with subscriber information and device metadata
    const data = {
      subscriberId: `tel:${subscriberId}`,
      applicationHash: "abcdefgh",
      applicationMetaData: {
        ...DEFAULT_META_DATA,
        device: device || DEFAULT_META_DATA.device,
        os: os || DEFAULT_META_DATA.os,
      },
    };

    // Make API request to the OTP request endpoint
    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.OTP_REQUEST,
      data
    );
  } catch (error) {
    // Handle Axios errors separately to return the response
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

/**
 * Verify an OTP for subscription confirmation
 * Validates the OTP provided by the user against the reference number from the OTP request
 *
 * @param {string} serviceProvider - The service provider code
 * @param {string} referenceNo - Reference number from the OTP request
 * @param {string} otp - One-time password to verify
 * @returns {Object} Response from the OTP verification API
 * @throws {Error} If referenceNo or otp is missing or API request fails
 */
const otpVerifyService = async (serviceProvider, referenceNo, otp) => {
  if (!referenceNo) {
    throw new Error("referenceNo is required");
  } else if (!otp) {
    throw new Error("otp is required");
  }

  try {
    // Prepare request data with reference number and OTP
    const data = {
      referenceNo,
      otp,
    };

    // Make API request to the OTP verification endpoint
    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.OTP_VERIFY,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

/**
 * Process an unsubscribe request
 * Sends a request to unsubscribe a user from the service
 *
 * @param {string} serviceProvider - The service provider code
 * @param {string} subscriberId - The subscriber identifier (masked ID)
 * @returns {Object} Response from the unsubscribe API
 * @throws {Error} If subscriberId is missing or API request fails
 */
const unsubscribeService = async (serviceProvider, subscriberId) => {
  if (!subscriberId) {
    throw new Error("subscriberId is required");
  }

  try {
    // Prepare request data with subscriber ID and unsubscribe action
    const data = {
      subscriberId: `${subscriberId}`,
      action: SUBSCRIPTION_ACTION.UNSUBSCRIBE,
    };

    // Make API request to the unsubscribe endpoint
    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.UNSUBSCRIBE,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

/**
 * Get the current subscription status for a subscriber
 * Retrieves information about the subscriber's current subscription state
 *
 * @param {string} serviceProvider - The service provider code
 * @param {string} subscriberId - The subscriber identifier (masked ID)
 * @returns {Object} Response from the status API with subscription details
 * @throws {Error} If subscriberId is missing or API request fails
 */
const getStatusService = async (serviceProvider, subscriberId) => {
  if (!subscriberId) {
    throw new Error("subscriberId is required");
  }

  try {
    // Prepare request data with subscriber ID
    const data = {
      subscriberId: `${subscriberId}`,
    };

    // Make API request to the status endpoint
    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.GET_STATUS,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

/**
 * Get charging information for subscribers
 * Retrieves billing and charging details for one or more subscribers
 *
 * @param {string} serviceProvider - The service provider code
 * @param {Array<string>} subscriberIds - Array of subscriber identifiers (masked IDs)
 * @returns {Object} Response from the charging info API with billing details
 * @throws {Error} If subscriberIds is missing or empty or API request fails
 */
const getChargingInfoService = async (serviceProvider, subscriberIds) => {
  if (!subscriberIds || subscriberIds?.length === 0) {
    throw new Error("subscriberId is required");
  }

  try {
    // Prepare request data with array of subscriber IDs
    const data = { subscriberIds };

    // Make API request to the charging info endpoint
    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.GET_CHARGING_INFO,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

export {
  otpRequestService,
  otpVerifyService,
  unsubscribeService,
  getStatusService,
  getChargingInfoService,
};
