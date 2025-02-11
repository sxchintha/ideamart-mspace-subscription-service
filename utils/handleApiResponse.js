import checkStatusCode from "./checkStatusCode.js";

// Utility function to handle API response
const handleApiResponse = (response, res) => {
  if (checkStatusCode(response?.data?.statusCode)) {
    res.status(200).send({
      apiStatus: "success",
      ...response.data,
    });
  } else {
    res.status(response.status === 200 ? 400 : response.status).send({
      apiStatus: "error",
      ...response.data,
    });
  }
};

export default handleApiResponse;
