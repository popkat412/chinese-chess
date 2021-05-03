import { io } from "socket.io-client";

// TODO: Change to use __SERVER_URL__
export default io(
  process.env.NODE_ENV == "production"
    ? "xiangqi.yunze.wang"
    : "http://localhost:3000",
  { autoConnect: false }
);
