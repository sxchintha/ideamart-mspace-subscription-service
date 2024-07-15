import asyncHandler from "express-async-handler";
import { formatSubscriberId } from "../utils/formatSubscriberId.js";
import { checkMobitelStatusCode } from "../utils/checkStatusCode.js";
import {
  getStatus,
  subscribeToService,
  unsubscribeFromService,
} from "../services/mobitelServices.js";

// Utility function to validate subscriberId
const validateSubscriberId = (subscriberId, res) => {
  if (!subscriberId) {
    res.status(400).send({ error: "subscriberId is required" });
    throw new Error("subscriberId is required");
  }
};

// Utility function to handle API response
const handleApiResponse = (response, res) => {
  if (checkMobitelStatusCode(response?.data?.statusCode)) {
    res.status(200).send({
      apiStatus: "success",
      ...response.data,
    });
  } else {
    res.status(response.status === 200 ? 400 : response.status).send({
      apiStatus: "error",
      ...response.data,
    });
  }
};

const handleSubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;
  validateSubscriberId(subscriberId, res);
  const formattedSubscriberId = formatSubscriberId(subscriberId);

  const status = await getStatus(formattedSubscriberId);

  if (status?.data?.subscriptionStatus === "REGISTERED") {
    res.status(200).send({ apiStatus: "success", message: "User already subscribed" });
  } else {
    const response = await subscribeToService(formattedSubscriberId);
    handleApiResponse(response, res);
  }
});

const handleUnsubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;
  validateSubscriberId(subscriberId, res);
  const formattedSubscriberId = formatSubscriberId(subscriberId);

  const status = await getStatus(formattedSubscriberId);

  if (status?.data?.subscriptionStatus === "UNREGISTERED") {
    res.status(200).send({ apiStatus: "success", message: "User already unsubscribed" });
  } else {
    const response = await unsubscribeFromService(formattedSubscriberId);
    handleApiResponse(response, res);
  }
});

const getSubscriberStatus = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;
  validateSubscriberId(subscriberId, res);
  const formattedSubscriberId = formatSubscriberId(subscriberId);

  const response = await getStatus(formattedSubscriberId);
  handleApiResponse(response, res);
});

export { getSubscriberStatus, handleSubscribe, handleUnsubscribe };
