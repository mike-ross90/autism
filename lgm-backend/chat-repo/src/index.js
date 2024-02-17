import { connect_to_db } from "./utils/db-connection.js";
import { initiate_rabbit_queue } from "./utils/intialize-rabbit-queue.js";
import { create_chat } from "./services/Chat/create-chat.js";
import config from "./config/config.js";

(async () => {
  await connect_to_db();
  const queue = await initiate_rabbit_queue();

  queue.consume(
    config.RABBIT_QUEUE,
    async (message) => {
      //insert messages in the database
      await create_chat(JSON.parse(message.content));
    },
    { noAck: true }
  );
})();
