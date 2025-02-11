import axios from "axios";
import {
  DIALOG_BASE_URL,
  MOBITEL_BASE_URL,
  SERVICE_PROVIDER,
} from "../constants/requestData.js";

const apiRequest = async (serviceProvider, url, body) => {
  let baseUrl;
  let applicationId;
  let password;

  if (serviceProvider === SERVICE_PROVIDER.MOBITEL) {
    baseUrl = MOBITEL_BASE_URL;

    if (!process.env.MOBITEL_APP_ID || !process.env.MOBITEL_APP_PASSWORD) {
      console.error(
        "MOBITEL_APP_ID or MOBITEL_APP_PASSWORD not found in .env file"
      );

      throw new Error("Service provider not configured");
    }

    applicationId = process.env.MOBITEL_APP_ID;
    password = process.env.MOBITEL_APP_PASSWORD;
  } else if (serviceProvider === SERVICE_PROVIDER.DIALOG) {
    baseUrl = DIALOG_BASE_URL;

    if (!process.env.DIALOG_APP_ID || !process.env.DIALOG_APP_PASSWORD) {
      console.error(
        "DIALOG_APP_ID or DIALOG_APP_PASSWORD not found in .env file"
      );

      throw new Error("Service provider not configured");
    }

    applicationId = process.env.DIALOG_APP_ID;
    password = process.env.DIALOG_APP_PASSWORD;
  } else {
    throw new Error("invalid service provider");
  }

  return await axios.post(
    `${baseUrl}/${url}`,
    { applicationId, password, ...body },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;",
      },
    }
  );
};

export default apiRequest;
