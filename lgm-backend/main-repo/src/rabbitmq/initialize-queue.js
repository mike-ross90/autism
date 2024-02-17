import amqp from "amqplib";
import logger from "../logger/logger.js";
import config from "../config/config.js";

export async function initialize_rabbit_mq() {
  try {
    const channel = (
      await amqp.connect(config.RABBIT_MQ_CONNECTION_URL)
    ).createChannel();
    (await channel).assertQueue(config.RABBIT_QUEUE, { durable: true });

    logger.info("RabbitMQ queue initialized");
    return channel;
  } catch (err) {
    logger.error(err.message);
  }
}
