import mongoose, { Schema, model, Document, Types } from "mongoose";

interface Comment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

interface PostDoc extends Document {
  author: Types.ObjectId;
  imageUrls: string[];
  caption: string;
  createdAt: Date;
  updatedAt: Date;
  likes: Types.ObjectId[];
  comments: Comment[];
}

const commentSchema = new Schema<Comment>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new Schema<PostDoc>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrls: [{ type: String, required: true }],
    caption: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { versionKey: false, timestamps: true }
);

const Post = model<PostDoc>("Post", postSchema);

export { Post, PostDoc };
