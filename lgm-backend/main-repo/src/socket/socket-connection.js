import { Server } from "socket.io";
import logger from "../logger/logger.js";
import config from "../config/config.js";
import Chat from "../models/chat-model.js";
import Conversation from "../models/conversation-model.js";
import { get_conversation } from "../services/Chat/get-conversation.js";
import { get_matched_conversations } from "../services/Chat/get-matched-conversations.js";
import { update_last_message } from "../services/Chat/update-last-message.js";
import { seen_message } from "../services/Chat/seen-message.js";
// import { chat_seen_message } from "../services/Chat/chat-seen-msg.js";
import { check_socket_auth } from "../middlewares/check-socket-auth.js";
import { get_chat_history } from "../services/Chat/get-chat-history.js";

export const initiate_socket = (server, channel) => {
  try {
    const io = new Server(server, {
      cors: {
        origin: config.CLIENT_URL, //client app url
      },
    });
    io.use((socket, next) => {
      check_socket_auth(socket, next);
    }).on("connection", (socket) => {
      logger.debug(`A client has connected : ${socket.id}`);

      socket.on("get_chat_threads", async (data) => {
        //will be called on the conversation screen

        const { user } = data

        logger.debug("------------------data from get_chat_threads : ");
        logger.debug({ data });

        const thread_details = await get_matched_conversations(data);
        if (thread_details.threadDetails) {
          socket.leave(`${thread_details.threadDetails[0].conversation}1234`)
        }
        logger.debug("socketsockesocket====>")
      


        logger.debug("---------thread details with last message : ");
        logger.debug({ thread_details });

        socket.emit("thread_details", thread_details);

        data = thread_details
        const isRead_details = await seen_message(data);

        io.emit("find_room", { isRead_details, sender: user });
      });

      socket.on("get_history", async (data) => {
        logger.debug("------------------data from get_history : ");
        logger.debug({ data });

        const ended_convos = await get_chat_history(data);

        logger.debug(
          "---------Ended conversation history with last message : "
        );
        logger.debug({ ended_convos });
        socket.emit("get_history", ended_convos);
      });

      socket.on("join_room", async (data) => {
        const { conversationId } = data

        if (conversationId) {
          socket.join(conversationId)
        }
      });

      socket.on("get_convo", async (data) => {
        const { sender } = data
        logger.debug("------------------data from sender!!!!! : ");
        logger.debug({ sender });
        // will be called when the client opens the conversation
        logger.debug("------------------data from get_convo : ");
        logger.debug({ data });

        const convo_details = await get_conversation(data);

        logger.debug("-----------------convo details returned : ");
        logger.debug({ convo_details });

        if (convo_details.conversation) {
          socket.join(convo_details.conversation);
          socket.join(`${convo_details.conversation}1234`);

        }
        logger.debug("socketsockesocket")
        logger.debug(io.sockets.adapter.rooms.get(`${convo_details.conversation}1234`).size);
        let size = io.sockets.adapter.rooms.get(`${convo_details.conversation}1234`).size
        socket.emit("convo_details", convo_details);
        data = convo_details
        const isRead_details = await seen_message(data, size);

        io.emit("find_room", { isRead_details, sender: sender });
      });

      socket.on("get_conversation_details", async (data) => {

        logger.debug("------------------get_conversation_details : ");
        logger.debug({ data });
        const conversation_details = await get_conversation(data);


        io.emit("conversation_details", conversation_details);
      })

      socket.on("send_msg", async (data) => {
        channel.sendToQueue(
          config.RABBIT_QUEUE,
          Buffer.from(JSON.stringify(data))
        );

        logger.debug("----------------data from send_msg : ");
        logger.debug({ data });

        if (data) {
          io.to(data.conversation).emit("new_message", {
            message: data.message,
            sender: data.senderId,
            reciever: data.reciever,
            createdAt: data.createdAt,
            isRead: data.isRead,
            messagesCount: data.messagesCount
          });
          logger.debug("----------------data from new_message : ");
        }

        if (data) {
          socket.emit("last_message", {
            message: data.message,
            sender: data.senderId,
            reciever: data.reciever,
            createdAt: data.createdAt,
            isRead: data.isRead,
            messagesCount: data.messagesCount
          });
          logger.debug({ data });
          logger.debug("----------------data from last_message : ");
        }
      });

      io.on("update_last_msg", async (data) => {
        logger.debug("------------------data from update_last_msg : ");
        logger.debug({ data });

        const last_msg_details = await update_last_message(data);

        logger.debug("---------last message details : ");
        logger.debug({ last_msg_details });

      });

      socket.on("isRead", async (data) => {
        logger.debug("------------------data from isRead : ");
        logger.debug({ data });

        const isRead_details = await seen_message(data);

        logger.debug("---------isRead_details : ");
        logger.debug({ isRead_details });

        socket.emit("find_room", isRead_details);
      })

      socket.on("tier_updated", (conversation) => {
        logger.debug("Data from tier updated event");
        logger.debug({ conversation });
        io.to(conversation).emit("tier_updated", () => {
          logger.debug(`tier updated : ${socket.id}`);
        });
      });

      socket.on("chat_ended", (conversation) => {
        logger.debug("Data from chat ended event");
        logger.debug({ conversation });
        io.to(conversation).emit("chat_ended", () => {
          logger.debug(`chat ended : ${socket.id}`);
        });
      });

      socket.on("disconnect", () => {
        logger.debug(`A client has disconnected : ${socket.id}`);
      });
    });
  } catch (err) {
    logger.error(err.message);
  }
};
