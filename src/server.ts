import express, { Express } from "express";
import cors from "cors";

import postsRouter from "./routers/posts.router";
import notFoundHadler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHadler";
import usersRouter from "./routers/user.routers";

const startServer = (): void => {
  const app: Express = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/users", usersRouter);
  app.use("/api/posts", postsRouter);

  app.use(notFoundHadler);
  app.use(errorHandler);

  const port = process.env.PORT || 3000;
  app.listen(port, (): void => {
    console.log(`Server running on port ${port}`);
  });
};

export default startServer;
