export const DEFAULT_META_DATA = {
  client: "MOBILEAPP",
  device: "NOT_PROVIDED",
  os: "NOT_PROVIDED",
  appCode: process.env.APP_CODE || "",
};

export const APPLICATION_HASH = process.env.APPLICATION_HASH || "";

export const SUBSCRIPTION_ACTION = {
  SUBSCRIBE: "1",
  UNSUBSCRIBE: "0",
};

export const MOBITEL_BASE_URL = "https://api.mspace.lk";
export const DIALOG_BASE_URL = "https://api.dialog.lk";

export const SERVICE_PROVIDER = {
  MOBITEL: "MOBITEL",
  DIALOG: "DIALOG",
};
