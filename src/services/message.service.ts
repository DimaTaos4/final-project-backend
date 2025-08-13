import { Message } from "../models/Message/Message";
import { Chat } from "../models/Chat/Chat";
import mongoose from "mongoose";
import { User } from "../models/Users/Users";

export const getMessages = async (chatId: string) => {
  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 })
    .populate("sender", "fullName userName avatarUrl");

  const chat = await Chat.findById(chatId).lean();

  if (!chat) {
    throw new Error("Chat not found");
  }

  const participants = await User.find(
    { _id: { $in: chat.participants } },
    "fullName userName avatarUrl _id"
  ).lean();

  return { messages, participants };
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string
) => {
  let finalChatId = chatId;

  if (!finalChatId) {
    const existingChat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (existingChat && existingChat._id) {
      finalChatId = existingChat._id.toString();
    } else {
      const newChat = (await Chat.create({
        participants: [senderId, recipientId],
      })) as { _id: mongoose.Types.ObjectId };
      finalChatId = newChat._id.toString();
    }
  }

  const message = await Message.create({
    chatId: finalChatId,
    sender: senderId,
    text,
  });

  await Chat.findByIdAndUpdate(finalChatId, {
    lastMessage: message._id,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender"
  );

  return populatedMessage;
};
