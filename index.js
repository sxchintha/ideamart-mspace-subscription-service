import "dotenv/config";
import express from "express";

import errorHandler from "./middleware/errorHandler.js";

const PORT = process.env.PORT || 8080;

const app = express();

// Custom middleware for log all requests
import { logger } from "./middleware/logEvents.js";
app.use(logger);

/****************** Routes ******************/
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// 404 Error
app.use((req, res) => {
  res.status(404).send("404 Error: Page not found");
});
/*********************************************/

// Custom middleware for error handling
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
