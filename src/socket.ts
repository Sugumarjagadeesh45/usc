import { io } from "socket.io-client";


 const SOCKET_URL = "https://goodbackend.onrender.com";


const socket = io(SOCKET_URL, {
 transports: ["polling", "websocket"], 
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  path: "/socket.io/", 
});

socket.on("connect", () => {
  console.log("🟢 User socket connected:", socket.id);
});
socket.on("connect_error", (err) => {
  console.log("🔴 User socket error:", err.message);
});
socket.on("disconnect", (reason) => {
  console.log("🔴 User socket disconnected:", reason);
});
export default socket;