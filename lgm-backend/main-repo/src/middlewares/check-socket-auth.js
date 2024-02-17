import jwt from "jsonwebtoken";
import config from "../config/config.js";
import logger from "../logger/logger.js";

export const check_socket_auth = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      config.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          logger.error("Socket unauthorised");
          return next(new Error("Authentication error"));
        }
        socket.decoded = decoded;
        next();
      }
    );
  } else {
    logger.error("Socket unauthorised");
    next(new Error("Authentication error"));
  }
};
