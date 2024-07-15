const checkMobitelStatusCode = (statusCode) => {
    // if start with S then it is success
    if (statusCode?.startsWith("S")) {
        return true;
    } else {
        return false;
    }
}

export { checkMobitelStatusCode };