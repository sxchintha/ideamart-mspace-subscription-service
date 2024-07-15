import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.writeFile(path.join(__dirname, "..", "logs"), "");
    }

    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (error) {
    console.error(error);
  }
};

const logger = async (req, res, next) => {
  const fileName = `reqLog_${format(new Date(), "yyyy-MM-dd")}.log`;
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, fileName);
  next();
};

export { logger, logEvents };
