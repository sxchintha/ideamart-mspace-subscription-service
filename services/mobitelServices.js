import axios from "axios";
import {
  COMMON_REQUEST_BODY,
  DEFAULT_META_DATA,
  MOBITEL_API_ENDPOINT,
  MOBITEL_BASE_URL,
  SUBSCRIPTION_ACTION,
} from "../constants";

const API = axios.create({
  baseURL: MOBITEL_BASE_URL,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

const otpRequestService = async (subscriberId, device, os) => {
  try {
    const data = {
      ...COMMON_REQUEST_BODY,
      subscriberId: `tel:${subscriberId}`,
      applicationMetaData: {
        ...DEFAULT_META_DATA,
        device: device || DEFAULT_META_DATA.device,
        os: os || DEFAULT_META_DATA.os,
      },
    };

    return await API.post(MOBITEL_API_ENDPOINT.OTP_REQUEST, data);
  } catch (error) {
    return error.response;
  }
};

const otpVerifyService = async (referenceNo, otp) => {
  try {
    const data = {
      ...COMMON_REQUEST_BODY,
      referenceNo,
      otp,
    };

    return await API.post(MOBITEL_API_ENDPOINT.OTP_VERIFY, data);
  } catch (error) {
    return error.response;
  }
};

const unsubscribeService = async (subscriberId) => {
  try {
    const data = {
      ...COMMON_REQUEST_BODY,
      subscriberId: `tel:${subscriberId}`,
      action: SUBSCRIPTION_ACTION.UNSUBSCRIBE,
    };

    return await API.post(MOBITEL_API_ENDPOINT.UNSUBSCRIBE, data);
  } catch (error) {
    return error.response;
  }
};

const getStatusService = async (subscriberId) => {
  try {
    const data = {
      ...COMMON_REQUEST_BODY,
      subscriberId: `tel:${subscriberId}`,
    };

    return await API.post(MOBITEL_API_ENDPOINT.GET_STATUS, data);
  } catch (error) {
    return error.response;
  }
};

const getChargingInfoService = async (subscriberId) => {
  try {
    const data = {
      ...COMMON_REQUEST_BODY,
      subscriberIds: [`tel:${subscriberId}`],
    };

    return await API.post(MOBITEL_API_ENDPOINT.GET_CHARGING_INFO, data);
  } catch (error) {
    return error.response;
  }
};

const anyBodyService = async (body) => {
  try {
    const { url, ...rest } = body;
    console.log("");
    console.log("=================================");
    console.log("request", url, rest);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(rest),
    });
    const res = await response.json();
    console.log("response", res);
    return res;
  } catch (error) {
    return error.response;
  }
};

export {
  otpRequestService,
  otpVerifyService,
  unsubscribeService,
  getStatusService,
  getChargingInfoService,
  anyBodyService,
};
