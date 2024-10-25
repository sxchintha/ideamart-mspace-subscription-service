import asyncHandler from "express-async-handler";
import validateSubscriberId from "../utils/validateSubscriberId.js";
import handleApiResponse from "../utils/handleApiResponse.js";
import {
  otpRequestService,
  otpVerifyService,
  unsubscribeService,
  getStatusService,
  getChargingInfoService,
  anyBodyService,
} from "../services/mobitelServices.js";

const handleOtpRequest = asyncHandler(async (req, res) => {
  const { subscriberId, device, os } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  const response = await otpRequestService(formattedSubscriberId, device, os);
  handleApiResponse(response, res);
});

const handleOtpVerify = asyncHandler(async (req, res) => {
  const { referenceNo, otp } = req.body;

  if (!referenceNo) {
    res.status(400);
    throw new Error("referenceNo is required");
  } else if (!otp) {
    res.status(400);
    throw new Error("otp is required");
  }

  const response = await otpVerifyService(referenceNo, otp);
  handleApiResponse(response, res);
});

const handleUnsubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const response = await unsubscribeService(subscriberId);
  handleApiResponse(response, res);
});

const handleGetStatus = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const response = await getStatusService(subscriberId);
  handleApiResponse(response, res);
});

const handleGetChargingInfo = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const response = await getChargingInfoService(subscriberId);
  handleApiResponse(response, res);
});

const handleAnyBodyRequest = asyncHandler(async (req, res) => {
  const body = req.body;

  const response = await anyBodyService(body);
  res.send(response);
});

export {
  handleOtpRequest,
  handleOtpVerify,
  handleUnsubscribe,
  handleGetStatus,
  handleGetChargingInfo,
  handleAnyBodyRequest,
};
