/**
 * Authentication Controller Module
 *
 * This module contains controller functions for handling authentication-related
 * operations such as retrieving subscriber IDs and managing device registration.
 */
import asyncHandler from "express-async-handler";
import { getSubscriberIdByUserId } from "../services/firebaseServices.js";
import {
  registerDevice,
  getCurrentDeviceId,
} from "../services/sessionServices.js";
import { StatusCode } from "../constants/index.js";

/**
 * Retrieve the subscriber ID associated with an authenticated user
 *
 * @param {Object} req - Express request object containing the authenticated user
 * @param {Object} res - Express response object
 * @throws {Error} If user is not authenticated
 * @returns {Object} Response with subscriber ID if successful
 */
const handleGetSubscriberId = asyncHandler(async (req, res) => {
  const { user } = req;

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  try {
    const subscriberId = await getSubscriberIdByUserId(user.uid);

    res.status(200).send({
      apiStatus: "success",
      subscriberId,
    });
  } catch (error) {
    res.status(401).send({
      apiStatus: "error",
      message: error.message,
      statusCode: StatusCode.SUBSCRIBER_ID_NOT_FOUND,
    });
  }
});

/**
 * Update or register a device ID for an authenticated user
 * This enables device-based session management for security
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Request body
 * @param {string} req.body.deviceId - Device identifier to register
 * @param {Object} res - Express response object
 * @throws {Error} If user is not authenticated or deviceId is missing
 * @returns {Object} Response with success message and update timestamp
 */
const updateDevice = asyncHandler(async (req, res) => {
  const { user } = req;
  const { deviceId } = req.body;

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  if (!deviceId) {
    res.status(400);
    throw new Error("Device ID is required");
  }

  // Register the device for this user
  const session = registerDevice(user.uid, deviceId);

  res.status(200).send({
    apiStatus: "success",
    message: "Device registered successfully",
    updatedAt: session.updatedAt,
  });
});

/**
 * Check if the current device is valid for the authenticated user
 * Used to verify if the user is accessing from their registered device
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers["x-device-id"] - Device ID from request header
 * @param {Object} res - Express response object
 * @throws {Error} If user is not authenticated or deviceId is missing
 * @returns {Object} Response with device validation status
 */
const checkDevice = asyncHandler(async (req, res) => {
  const { user } = req;
  const deviceId = req.headers["x-device-id"];

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  if (!deviceId) {
    res.status(400);
    throw new Error("Device ID is required");
  }

  const currentDevice = getCurrentDeviceId(user.uid);

  if (currentDevice && currentDevice.deviceId === deviceId) {
    res.status(200).send({
      apiStatus: "success",
      message: "Device is valid",
      isCurrentDevice: true,
      updatedAt: currentDevice.updatedAt,
    });
  } else {
    res.status(401).send({
      apiStatus: "error",
      message: "Device is not the current registered device",
      isCurrentDevice: false,
      updatedAt: currentDevice ? currentDevice.updatedAt : null,
      statusCode: StatusCode.DEVICE_MISMATCH,
    });
  }
});

export { handleGetSubscriberId, updateDevice, checkDevice };
