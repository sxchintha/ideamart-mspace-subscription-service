import axios from "axios";

const BASE_URL = "https://api.mspace.lk";
const GET_SUBSCRIBER_STATUS = "/subscription/getStatus";
const SUBSCRIBE_TO_SERVICE = "/subscription/send";
const UNSUBSCRIBE_FROM_SERVICE = "/subscription/send";
const ACTION = {
  SUBSCRIBE: "1",
  UNSUBSCRIBE: "0",
};

const COMMON_REQUEST_BODY = {
  applicationId: process.env.MOBITEL_APP_ID,
  password: process.env.MOBITEL_APP_PASSWORD,
};

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

const getStatus = async (subscriberId) => {
  try {
    const response = await API.post(GET_SUBSCRIBER_STATUS, {
      ...COMMON_REQUEST_BODY,
      subscriberId: `tel:${subscriberId}`,
    });

    return response;
  } catch (error) {
    return error.response;
  }
};

const subscribeToService = async (subscriberId) => {
  try {
    const response = await API.post(SUBSCRIBE_TO_SERVICE, {
      subscriberId: `tel:${subscriberId}`,
      action: ACTION.SUBSCRIBE,
    });

    return response;
  } catch (error) {
    return error.response;
  }
};

const unsubscribeFromService = async (subscriberId) => {
  try {
    const response = await API.post(UNSUBSCRIBE_FROM_SERVICE, {
      subscriberId: `tel:${subscriberId}`,
      action: ACTION.UNSUBSCRIBE,
    });

    return response;
  } catch (error) {
    return error.response;
  }
};

export { getStatus, subscribeToService, unsubscribeFromService };
