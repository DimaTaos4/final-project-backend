import { Schema, model, Types, Document } from "mongoose";

interface IChatDoc extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChatDoc>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { versionKey: false, timestamps: true }
);

const Chat = model<IChatDoc>("Chat", chatSchema);

export { Chat, IChatDoc };
