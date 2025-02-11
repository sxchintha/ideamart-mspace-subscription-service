import express from "express";
import {
  handleOtpRequest,
  handleOtpVerify,
  handleUnsubscribe,
  handleGetStatus,
  handleGetChargingInfo,
} from "../controllers/subscriptionController.js";

const route = express.Router();

route.post("/otp/request", handleOtpRequest);
route.post("/otp/verify", handleOtpVerify);
route.post("/unsubscribe", handleUnsubscribe);
route.post("/get-status", handleGetStatus);
route.post("/get-charging-info", handleGetChargingInfo);

export default route;
