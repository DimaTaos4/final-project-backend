import "dotenv/config";
import startServer from "./server";

import connectDatabase from "./db/connectDatabase";
import { Request } from "express";
const bootstrap = async () => {
  await connectDatabase();
  startServer();
};
bootstrap();
