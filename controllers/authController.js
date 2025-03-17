import asyncHandler from "express-async-handler";
import { getSubscriberIdByUserId } from "../services/firebaseServices.js";
import {
  registerDevice,
  getCurrentDeviceId,
} from "../services/sessionServices.js";
import { StatusCode } from "../constants/index.js";

const handleGetSubscriberId = asyncHandler(async (req, res) => {
  const { user } = req;

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const subscriberId = await getSubscriberIdByUserId(user.uid);

  res.status(200).send({
    apiStatus: "success",
    subscriberId,
  });
});

/**
 * Update the device ID for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
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
 * Check if the current device is valid for the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
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
    res.status(200).send({
      apiStatus: "success",
      message: "Device is not the current registered device",
      isCurrentDevice: false,
      updatedAt: currentDevice ? currentDevice.updatedAt : null,
      statusCode: StatusCode.DEVICE_MISMATCH,
    });
  }
});

export { handleGetSubscriberId, updateDevice, checkDevice };
