import morgan from "morgan";
import logger from "../utils/logger.js";

const morganFormat = ":method :url :status :response-time ms";

const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: (message) => {
      const logObject = {
        method: message.split(" ")[0],
        url: message.split(" ")[1],
        status: message.split(" ")[2],
        responseTime: message.split(" ")[3],
      };
      // Log to file using winston
      logger.info(JSON.stringify(logObject));

      // Log to console (this will ensure it's printed in the terminal)
      console.log(message.trim());
    },
  },
});

export default morganMiddleware;

