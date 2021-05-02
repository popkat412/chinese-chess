/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express from "express";
import http from "http";
import morgan from "morgan";
import "reflect-metadata";
import { Server } from "socket.io";
import registerEndpoints from "./api";
import registerSocketListeners from "./sockets";

const app = express();
app.use(morgan("dev"));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(
  server,
  process.env.NODE_ENV == "production"
    ? {}
    : {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      }
);

registerEndpoints(app);
registerSocketListeners(io);

server.listen(3000, () => console.log("Listening on port 3000..."));
