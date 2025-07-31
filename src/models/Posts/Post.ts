import { Schema, model, Document } from "mongoose";

interface PostDoc extends Document {
  author: Schema.Types.ObjectId;
  imageUrls: string[];
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDoc>(
  {
    author: { type: Schema.Types.ObjectId, ref: "user", required: true },
    imageUrls: [{ type: String, required: true }],
    caption: { type: String, default: "" },
  },

  { versionKey: false, timestamps: true }
);

const Post = model<PostDoc>("Post", postSchema);

export { Post, PostDoc };
