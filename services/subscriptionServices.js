import { AxiosError } from "axios";
import { API_ENDPOINT } from "../constants/apiConstants.js";
import {
  DEFAULT_META_DATA,
  SUBSCRIPTION_ACTION,
} from "../constants/requestData.js";
import apiRequest from "../utils/apiRequest.js";

const otpRequestService = async (serviceProvider, subscriberId, device, os) => {
  if (!subscriberId) {
    throw new Error("subscriberId is required");
  }

  try {
    const data = {
      subscriberId: `tel:${subscriberId}`,
      applicationHash: "abcdefgh",
      applicationMetaData: {
        ...DEFAULT_META_DATA,
        device: device || DEFAULT_META_DATA.device,
        os: os || DEFAULT_META_DATA.os,
      },
    };

    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.OTP_REQUEST,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

const otpVerifyService = async (serviceProvider, referenceNo, otp) => {
  if (!referenceNo) {
    throw new Error("referenceNo is required");
  } else if (!otp) {
    throw new Error("otp is required");
  }

  try {
    const data = {
      referenceNo,
      otp,
    };

    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.OTP_VERIFY,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

const unsubscribeService = async (serviceProvider, subscriberId) => {
  if (!subscriberId) {
    throw new Error("subscriberId is required");
  }

  try {
    const data = {
      subscriberId: `${subscriberId}`,
      action: SUBSCRIPTION_ACTION.UNSUBSCRIBE,
    };

    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.UNSUBSCRIBE,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

const getStatusService = async (serviceProvider, subscriberId) => {
  if (!subscriberId) {
    throw new Error("subscriberId is required");
  }

  try {
    const data = {
      subscriberId: `${subscriberId}`,
    };

    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.GET_STATUS,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

const getChargingInfoService = async (serviceProvider, subscriberIds) => {
  if (!subscriberIds || subscriberIds?.length === 0) {
    throw new Error("subscriberId is required");
  }

  try {
    const data = { subscriberIds };

    return await apiRequest(
      serviceProvider,
      API_ENDPOINT[serviceProvider]?.GET_CHARGING_INFO,
      data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
};

export {
  otpRequestService,
  otpVerifyService,
  unsubscribeService,
  getStatusService,
  getChargingInfoService,
};
