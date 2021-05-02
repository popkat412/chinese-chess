import { io } from "socket.io-client";

// TODO: Change to use __SERVER_URL__
export default io("http://localhost:3000", { autoConnect: false });
