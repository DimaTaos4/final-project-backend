import { Server, Socket } from "socket.io";
import http from "http";
import * as messageService from "./services/message.service";

interface SendMessageData {
  chatId: string;
  senderId: string;
  recipientId: string;
  text: string;
}

export const setupSocket = (server: http.Server): Server => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    socket.on("send-message", async (data: SendMessageData) => {
      try {
        const message = await messageService.sendMessage(
          data.chatId,
          data.senderId,
          data.recipientId,
          data.text
        );
        io.to(data.chatId).emit("receive-message", message);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
