/** Stand-in for utils/apiRequest.js, the only module that calls the carrier APIs. */
let carrierQueue = [];

/** Queue the carrier's response to the next call to `endpoint` (Dialog and Mobitel share response shapes). */
export const carrier = (endpoint, data, status = 200) => {
  carrierQueue.push({ endpoint, response: { status, data } });
};

export const carrierRequest = async (serviceProvider, url) => {
  const index = carrierQueue.findIndex(({ endpoint }) => url.endsWith(endpoint));
  if (index === -1) throw new Error(`Unexpected carrier call: ${url}`);
  return carrierQueue.splice(index, 1)[0].response;
};

export const resetCarrier = () => {
  carrierQueue = [];
};
