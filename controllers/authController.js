import asyncHandler from "express-async-handler";
import { getSubscriberIdByUserId } from "../services/firebaseServices.js";

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

export { handleGetSubscriberId };
