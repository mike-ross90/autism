import { app } from "./src/app/app.js";
import mongoose from "mongoose";
import config from "./src/config/config.js";
import logger from "./src/logger/logger.js";
import http from "http";
import { initiate_socket } from "./src/socket/socket-connection.js";
import { initialize_rabbit_mq } from "./src/rabbitmq/initialize-queue.js";

try {
  mongoose.connect(config.DB_URI);
  logger.info("Connected to DB..");
} catch (e) {
  logger.error(e.message);
}

const httpServer = http.createServer(app);

initiate_socket(httpServer, await initialize_rabbit_mq());

httpServer.listen(config.PORT, () => {
  logger.info(`Server listening at Port ${config.PORT}`);
});
