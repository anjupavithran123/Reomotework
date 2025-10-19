import { io } from "socket.io-client";


export const socket = io("https://signup-server-1.onrender.com", {
  transports: ["websocket"],
  autoConnect: false, // connect manually
});