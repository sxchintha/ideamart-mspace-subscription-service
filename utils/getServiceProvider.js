import { SERVICE_PROVIDER } from "../constants/requestData.js";

const getServiceProvider = (subscriberId) => {
  if (subscriberId.startsWith("9470") || subscriberId.startsWith("9471")) {
    return SERVICE_PROVIDER.MOBITEL;
  } else {
    return SERVICE_PROVIDER.DIALOG;
  }
};

export default getServiceProvider;
