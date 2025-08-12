import { Chat } from "../models/Chat/Chat";

export const getChatsForUser = async (userId: string) => {
  const chats = await Chat.find({ participants: userId })
    .populate("participants", "userName fullName avatarUrl")
    .populate("lastMessage");
  return chats;
};

export const getOrCreateChat = async (
  senderId: string,
  recipientId: string
) => {
  let chat = await Chat.findOne({
    participants: { $all: [senderId, recipientId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [senderId, recipientId],
    });
  }

  return chat;
};
