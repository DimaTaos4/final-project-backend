import "dotenv/config";
import http from "http";
import app from "./server";
import connectDatabase from "./db/connectDatabase";
import { setupSocket } from "./socket";

const bootstrap = async () => {
  await connectDatabase();

  const port = Number(process.env.PORT) || 3000;

  const server = http.createServer(app);
  setupSocket(server);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
};

bootstrap();
