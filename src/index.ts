import "dotenv/config";
import startServer from "./server";

import connectDatabase from "./db/connectDatabase";
const bootstrap = async () => {
  await connectDatabase();
  startServer();
};
bootstrap();
