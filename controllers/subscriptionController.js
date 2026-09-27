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
import {
  deleteOtherSubscriberLinks,
  getSubscriberLink,
  getSubscriberLinksByUserId,
  saveSubscriberId,
} from "../services/firebaseServices.js";
import getServiceProvider from "../utils/getServiceProvider.js";
import {
  isWhitelisted,
  getMockOtpRequestResponse,
  getMockOtpVerifyResponse,
  getMockUnsubscribeResponse,
  getMockGetStatusResponse,
  getMockGetChargingInfoResponse,
} from "../utils/handleWhitelist.js";
import { StatusCode } from "../constants/index.js";
import getSubscriptionState, {
  SUBSCRIPTION_STATE,
} from "../utils/getSubscriptionState.js";

/**
 * Get the masked ID for a subscriber ID linked to the calling user.
 * A number linked to another account is rejected, so nobody can check or cancel someone else's subscription.
 *
 * @param {string} subscriberId - Formatted subscriber identifier (phone number)
 * @param {Object} user - Authenticated user object
 * @param {Object} res - Express response object
 * @throws {Error} If the number isn't linked, or is linked to another user
 * @returns {string} The masked subscriber ID
 */
const getOwnedMaskedId = async (subscriberId, user, res) => {
  const link = await getSubscriberLink(subscriberId);

  if (!link) {
    throw new Error("Subscriber id not found in database", {
      cause: { statusCode: StatusCode.SUBSCRIBER_ID_NOT_FOUND },
    });
  }

  if (link.userId !== user.uid) {
    res.status(403);
    throw new Error("This number is linked to another account", {
      cause: { statusCode: StatusCode.SUBSCRIBER_ID_NOT_OWNED },
    });
  }

  return link.maskedId;
};

/**
 * Get the carrier's subscription status for a number, mocked for whitelisted test numbers
 *
 * @param {string} subscriberId - Formatted subscriber identifier (phone number)
 * @param {string} maskedId - The masked subscriber ID
 * @returns {Promise<Object>} Carrier API response
 */
const getStatus = async (subscriberId, maskedId) =>
  isWhitelisted(subscriberId)
    ? getMockGetStatusResponse()
    : getStatusService(getServiceProvider(subscriberId), maskedId);

/**
 * Check whether the carrier still reports a linked number as subscribed.
 * Anything short of a definite UNREGISTERED counts as subscribed.
 *
 * @param {Object} link - masked-ids entry ({ subscriberId, maskedId })
 * @returns {Promise<boolean>}
 */
const isStillSubscribed = async (link) => {
  const response = await getStatus(link.subscriberId, link.maskedId);
  return getSubscriptionState(response) !== SUBSCRIPTION_STATE.UNREGISTERED;
};

/**
 * Enforce one number per account and one account per number.
 * An existing link only blocks a new one while its number is still subscribed.
 * A link without a userId belongs to a deleted account, so it never blocks.
 *
 * @param {string} subscriberId - Formatted subscriber identifier (phone number)
 * @param {Object} user - Authenticated user object
 * @param {Object} res - Express response object
 * @throws {Error} If the number or the user is already linked elsewhere
 * @returns {Promise<void>}
 */
const assertCanLink = async (subscriberId, user, res) => {
  const numberLink = await getSubscriberLink(subscriberId);

  if (
    numberLink?.userId &&
    numberLink.userId !== user.uid &&
    (await isStillSubscribed(numberLink))
  ) {
    res.status(409);
    throw new Error("This number is linked to another account", {
      cause: { statusCode: StatusCode.SUBSCRIBER_ID_IN_USE },
    });
  }

  const userLinks = await getSubscriberLinksByUserId(user.uid);

  for (const link of userLinks) {
    if (link.subscriberId !== subscriberId && (await isStillSubscribed(link))) {
      res.status(409);
      throw new Error("This account is already subscribed with another number", {
        cause: { statusCode: StatusCode.USER_ALREADY_SUBSCRIBED },
      });
    }
  }
};

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

  await assertCanLink(formattedSubscriberId, user, res);

  const response = isWhitelisted(formattedSubscriberId)
    ? getMockOtpVerifyResponse(otp)
    : await otpVerifyService(
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

    if (success) {
      await deleteOtherSubscriberLinks(user.uid, formattedSubscriberId);
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

  const maskedId = await getOwnedMaskedId(formattedSubscriberId, req.user, res);

  const response = isWhitelisted(formattedSubscriberId)
    ? getMockUnsubscribeResponse()
    : await unsubscribeService(
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

  const maskedId = await getOwnedMaskedId(formattedSubscriberId, req.user, res);

  const response = await getStatus(formattedSubscriberId, maskedId);
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

  const maskedId = await getOwnedMaskedId(formattedSubscriberId, req.user, res);

  const response = isWhitelisted(formattedSubscriberId)
    ? getMockGetChargingInfoResponse()
    : await getChargingInfoService(
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
