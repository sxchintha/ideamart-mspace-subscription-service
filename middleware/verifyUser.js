import { verifyFirebaseUser } from "../services/firebaseServices.js";

const verifyUserMiddleware = async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    res
      .status(400)
      .send({ apiStatus: "error", message: "idToken is required" });
    return;
  }

  try {
    const decodedToken = await verifyFirebaseUser(idToken);
    if (!decodedToken) {
      res.status(401).send({ apiStatus: "error", message: "Unauthorized" });
    } else {
      req.user = decodedToken;
      next();
    }
  } catch (error) {
    res.status(401).send({ apiStatus: "error", message: error.message });
  }
};

export { verifyUserMiddleware };
