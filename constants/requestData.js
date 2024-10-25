export const COMMON_REQUEST_BODY = {
  applicationId: process.env.MOBITEL_APP_ID,
  password: process.env.MOBITEL_APP_PASSWORD,
};

export const DEFAULT_META_DATA = {
  client: "MOBILEAPP",
  device: "NOT_PROVIDED",
  os: "NOT_PROVIDED",
  appCode: "https://play.google.com/store/apps/details?id=lk",
};

export const SUBSCRIPTION_ACTION = {
  SUBSCRIBE: "1",
  UNSUBSCRIBE: "0",
};

export const MOBITEL_BASE_URL = "https://api.mspace.lk";
