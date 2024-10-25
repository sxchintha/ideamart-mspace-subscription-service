import express from "express";
import {
  handleOtpRequest,
  handleOtpVerify,
  handleUnsubscribe,
  handleGetStatus,
  handleGetChargingInfo,
  handleAnyBodyRequest,
} from "../controllers/mobitelController.js";

const mobitelRoute = express.Router();

mobitelRoute.post("/otp/request", handleOtpRequest);
mobitelRoute.post("/otp/verify", handleOtpVerify);
mobitelRoute.post("/subscription/unsubscribe", handleUnsubscribe);
mobitelRoute.post("/subscription/get-status", handleGetStatus);
mobitelRoute.post("/subscription/get-charging-info", handleGetChargingInfo);
mobitelRoute.post("/anyBodyRequest", handleAnyBodyRequest);

export default mobitelRoute;
