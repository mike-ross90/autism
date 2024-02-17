import { connectDB } from "./db/db.js";
import { InitiateRabbitMQ } from "./rabbitMQ.js";
import config from "./config/db.config.js";
import { createMessage } from "./createMessage.js";

(async () => {
  await connectDB();
  const queue = await InitiateRabbitMQ();
  queue.consume(
    config.queue,
    async (message) => {
      console.log(`Received message: ${message.content}`);
      await createMessage(JSON.parse(message.content));
    },
    { noAck: true }
  );
})();
