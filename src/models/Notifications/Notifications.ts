import { Schema, model, Document, Types } from "mongoose";

export interface NotificationDoc extends Document {
  type: "like" | "comment" | "follow";
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

const Notification = model<NotificationDoc>("Notification", notificationSchema);

export { Notification };
