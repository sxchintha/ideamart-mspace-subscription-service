import express from "express";
import { handleGetSubscriberId } from "../controllers/authController.js";

const route = express.Router();

route.get("/subscriber-id", handleGetSubscriberId);

export default route;
