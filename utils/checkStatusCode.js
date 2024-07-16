const checkStatusCode = (statusCode) => {
  // if start with S then it is success
  return !!statusCode?.startsWith("S");
};

export { checkStatusCode };
