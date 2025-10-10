import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  autoConnect: false, // connect manually
});