import { Schema, model, Types, Document } from "mongoose";

interface IMessageDoc extends Document {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDoc>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const Message = model<IMessageDoc>("Message", messageSchema);

export { Message, IMessageDoc };
