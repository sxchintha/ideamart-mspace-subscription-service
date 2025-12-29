/**
 * Subscription Controller Module
 *
 * This module contains controller functions for handling subscription-related
 * operations such as OTP verification, subscription status checks, and unsubscribe functionality.
 */
import asyncHandler from "express-async-handler";
import validateSubscriberId from "../utils/validateSubscriberId.js";
import handleApiResponse from "../utils/handleApiResponse.js";
import {
  otpRequestService,
  otpVerifyService,
  unsubscribeService,
  getStatusService,
  getChargingInfoService,
} from "../services/subscriptionServices.js";
import checkStatusCode from "../utils/checkStatusCode.js";
import { getMaskedId, saveSubscriberId } from "../services/firebaseServices.js";
import getServiceProvider from "../utils/getServiceProvider.js";
import {
  isWhitelisted,
  getMockOtpRequestResponse,
  getMockOtpVerifyResponse,
  getMockUnsubscribeResponse,
  getMockGetStatusResponse,
  getMockGetChargingInfoResponse,
} from "../utils/handleWhitelist.js";

/**
 * Handle OTP request for subscription verification
 * Initiates the OTP verification process by sending a code to the subscriber
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.subscriberId - Subscriber identifier (phone number)
 * @param {string} req.body.device - Device information
 * @param {string} req.body.os - Operating system information
 * @param {Object} res - Express response object
 * @throws {Error} If subscriberId is missing or invalid
 * @returns {Object} Response with OTP request status
 */
const handleOtpRequest = asyncHandler(async (req, res) => {
  const { subscriberId, device, os } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  if (isWhitelisted(formattedSubscriberId)) {
    return handleApiResponse(
      getMockOtpRequestResponse(formattedSubscriberId),
      res
    );
  }

  const response = await otpRequestService(
    getServiceProvider(formattedSubscriberId),
    formattedSubscriberId,
    device,
    os
  );
  handleApiResponse(response, res);
});

/**
 * Handle OTP verification for subscription confirmation
 * Verifies the OTP code and associates the subscriber ID with the user account
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.subscriberId - Subscriber identifier (phone number)
 * @param {string} req.body.referenceNo - Reference number from OTP request
 * @param {string} req.body.otp - One-time password to verify
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @throws {Error} If required parameters are missing or user is not authenticated
 * @returns {Object} Response with verification status
 */
const handleOtpVerify = asyncHandler(async (req, res) => {
  const { subscriberId, referenceNo, otp } = req.body;
  const { user } = req;

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  } else if (!referenceNo) {
    res.status(400);
    throw new Error("referenceNo is required");
  } else if (!otp) {
    res.status(400);
    throw new Error("otp is required");
  }

  if (isWhitelisted(formattedSubscriberId)) {
    return handleApiResponse(getMockOtpVerifyResponse(otp), res);
  }

  const response = await otpVerifyService(
    getServiceProvider(formattedSubscriberId),
    referenceNo,
    otp
  );

  // If verification is successful, save the subscriber ID to the user's account
  if (checkStatusCode(response?.data?.statusCode)) {
    let attempt = 0;
    let success = false;
    // Retry up to 5 times in case of database write failures
    while (attempt < 5 && !success) {
      success = await saveSubscriberId(
        user,
        formattedSubscriberId,
        response?.data?.subscriberId
      );
      attempt++;
    }
  }

  handleApiResponse(response, res);
});

/**
 * Handle unsubscribe request
 * Processes a request to unsubscribe a user from the service
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.subscriberId - Subscriber identifier (phone number)
 * @param {Object} res - Express response object
 * @throws {Error} If subscriberId is missing or invalid
 * @returns {Object} Response with unsubscribe status
 */
const handleUnsubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  if (isWhitelisted(formattedSubscriberId)) {
    return handleApiResponse(getMockUnsubscribeResponse(), res);
  }

  const maskedId = await getMaskedId(formattedSubscriberId);

  const response = await unsubscribeService(
    getServiceProvider(formattedSubscriberId),
    maskedId
  );
  handleApiResponse(response, res);
});

/**
 * Handle subscription status check
 * Retrieves the current subscription status for a subscriber
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.subscriberId - Subscriber identifier (phone number)
 * @param {Object} res - Express response object
 * @throws {Error} If subscriberId is missing or invalid
 * @returns {Object} Response with subscription status
 */
const handleGetStatus = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  if (isWhitelisted(formattedSubscriberId)) {
    return handleApiResponse(getMockGetStatusResponse(), res);
  }

  const maskedId = await getMaskedId(formattedSubscriberId);

  const response = await getStatusService(
    getServiceProvider(formattedSubscriberId),
    maskedId
  );
  handleApiResponse(response, res);
});

/**
 * Handle charging information request
 * Retrieves charging information for a subscriber
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.subscriberId - Subscriber identifier (phone number)
 * @param {Object} res - Express response object
 * @throws {Error} If subscriberId is missing or invalid
 * @returns {Object} Response with charging information
 */
const handleGetChargingInfo = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);
  if (isWhitelisted(formattedSubscriberId)) {
    return handleApiResponse(getMockGetChargingInfoResponse(), res);
  }

  const maskedId = await getMaskedId(formattedSubscriberId);

  const response = await getChargingInfoService(
    getServiceProvider(formattedSubscriberId),
    [maskedId]
  );
  handleApiResponse(response, res);
});

export {
  handleOtpRequest,
  handleOtpVerify,
  handleUnsubscribe,
  handleGetStatus,
  handleGetChargingInfo,
};
