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
import checkStatusCode from "../utils/checkStatusCode.js";
import { getMaskedId, saveSubscriberId } from "../services/firebaseServices.js";

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
  const { subscriberId, referenceNo, otp } = req.body;

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  if (!referenceNo) {
    res.status(400);
    throw new Error("referenceNo is required");
  } else if (!otp) {
    res.status(400);
    throw new Error("otp is required");
  }

  const response = await otpVerifyService(referenceNo, otp);

  if (checkStatusCode(response?.data?.statusCode)) {
    let attempt = 0;
    let success = false;
    while (attempt < 5 && !success) {
      success = await saveSubscriberId(
        formattedSubscriberId,
        response?.data?.subscriberId
      );
      attempt++;
    }
  }

  handleApiResponse(response, res);
});

const handleUnsubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const maskedId = await getMaskedId(subscriberId);

  const response = await unsubscribeService(maskedId);
  handleApiResponse(response, res);
});

const handleGetStatus = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const maskedId = await getMaskedId(subscriberId);

  const response = await getStatusService(maskedId);
  handleApiResponse(response, res);
});

const handleGetChargingInfo = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  if (!subscriberId) {
    res.status(400);
    throw new Error("subscriberId is required");
  }

  const maskedId = await getMaskedId(subscriberId);

  const response = await getChargingInfoService(maskedId);
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
