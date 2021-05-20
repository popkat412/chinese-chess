import { io } from "socket.io-client";
// import { ERROR_EVENT } from "../shared/events";

// TODO: Change to use __SERVER_URL__
const socket = io(
  process.env.NODE_ENV == "production"
    ? "xiangqi.yunze.wang"
    : "http://localhost:3000",
  { autoConnect: false }
);

export default socket;
