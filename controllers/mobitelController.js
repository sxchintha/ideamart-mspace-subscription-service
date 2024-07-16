import asyncHandler from "express-async-handler";
import validateSubscriberId from "../utils/validateSubscriberId.js";
import handleApiResponse from "../utils/handleApiResponse.js";
import {
  getStatus,
  subscribeToService,
  unsubscribeFromService,
} from "../services/mobitelServices.js";

const handleSubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  const status = await getStatus(formattedSubscriberId);

  if (status?.data?.subscriptionStatus === "REGISTERED") {
    res
      .status(200)
      .send({ apiStatus: "success", message: "User already subscribed" });
  } else {
    const response = await subscribeToService(formattedSubscriberId);
    handleApiResponse(response, res);
  }
});

const handleUnsubscribe = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  const status = await getStatus(formattedSubscriberId);

  if (status?.data?.subscriptionStatus === "UNREGISTERED") {
    res
      .status(200)
      .send({ apiStatus: "success", message: "User already unsubscribed" });
  } else {
    const response = await unsubscribeFromService(formattedSubscriberId);
    handleApiResponse(response, res);
  }
});

const getSubscriberStatus = asyncHandler(async (req, res) => {
  const { subscriberId } = req.body;

  const formattedSubscriberId = validateSubscriberId(subscriberId, res);

  const response = await getStatus(formattedSubscriberId);
  handleApiResponse(response, res);
});

export { getSubscriberStatus, handleSubscribe, handleUnsubscribe };
