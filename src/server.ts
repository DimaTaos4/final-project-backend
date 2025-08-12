import express, { Express } from "express";
import cors from "cors";

import postsRouter from "./routers/posts.router";
import notFoundHadler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHadler";
import usersRouter from "./routers/user.routers";
import chatRouter from "./routers/chats.router";
import notificationsRouter from "./routers/notifications.router";
import messageRouter from "./routers/message.router";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);

app.use(notFoundHadler);
app.use(errorHandler);

export default app;
