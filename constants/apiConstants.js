import { SERVICE_PROVIDER } from "./requestData.js";

export const API_ENDPOINT = {
  [`${SERVICE_PROVIDER.MOBITEL}`]: {
    OTP_REQUEST: "/otp/request",
    OTP_VERIFY: "/otp/verify",
    UNSUBSCRIBE: "/subscription/send",
    GET_STATUS: "/subscription/getStatus",
    GET_CHARGING_INFO: "/subscription/getSubscriberChargingInfo",
  },
  [`${SERVICE_PROVIDER.DIALOG}`]: {
    OTP_REQUEST: "/subscription/otp/request",
    OTP_VERIFY: "/subscription/otp/verify",
    UNSUBSCRIBE: "/subscription/send",
    GET_STATUS: "/subscription/getStatus",
    GET_CHARGING_INFO: "/subscription/getSubscriberChargingInfo",
  },
};
