// check if subscriberId is not valid (valid format is 94711234567, 94701234567)
const formatSubscriberId = (subscriberId) => {
  subscriberId = subscriberId.toString();
  let formattedSubscriberId = "";

  // check if all are numbers
  if (!/^\d+$/.test(subscriberId)) {
    throw new Error("Invalid subscriberId");
  }

  // if string starts with 94
  if (subscriberId.startsWith("94")) {
    formattedSubscriberId = `${subscriberId}`;
  }

  // if string starts with 0, replace with 94
  if (subscriberId.startsWith("0")) {
    formattedSubscriberId = `94${subscriberId.slice(1)}`;
  }

  // if string starts with 7, replace with 94
  if (subscriberId.startsWith("7")) {
    formattedSubscriberId = `94${subscriberId}`;
  }

  // if length is not 11
  if (formattedSubscriberId.length !== 11) {
    throw new Error("Invalid subscriberId");
  }

  return `${formattedSubscriberId}`;
};

export { formatSubscriberId };
