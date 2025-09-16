// // D:\newapp\userapp-main 2\userapp-main\src\socket.ts
// import { io } from "socket.io-client";
// import { getBackendUrl } from "./util/backendConfig";

// const socket = io(getBackendUrl(), {
//   transports: ["websocket"],
//   autoConnect: true,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   timeout: 10000,
// });

// socket.on("connect", () => {
//   console.log("🟢 User socket connected to:", getBackendUrl());
// });

// socket.on("connect_error", (err) => {
//   console.log("🔴 User socket error:", err.message);
// });

// socket.on("disconnect", () => {
//   console.log("🔴 User socket disconnected. Attempting to reconnect...");
// });

// socket.on("reconnect_failed", () => {
//   console.log("🔴 User socket reconnection failed");
// });

// export default socket;





























// // D:\newapp\userapp-main 2\userapp-main\src\socket.ts
// import { io } from "socket.io-client";
// import { Alert } from "react-native";
// import { getBackendUrl } from "./util/backendConfig";

// // Get backend dynamically
// const BASE_URL = getBackendUrl().replace(/\/$/, ""); // remove trailing slash if any

// console.log("🔌 Connecting User Socket to:", BASE_URL);

// // D:\newapp\userapp-main 2\userapp-main\src\socket.ts
// const socket = io(BASE_URL, {
//   transports: ["websocket"],
//   autoConnect: true,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   timeout: 10000,
// });
// // Debugging logs
// socket.on("connect", () => {
//   console.log("🟢 User socket connected:", socket.id);
//   // After connecting, request nearby drivers
//   if (global.currentLocation) {
// socket.on("nearbyDriversResponse", (data) => {
//   console.log("🚗 Nearby drivers received:", data.drivers);
// });

//   }
// });

// socket.on("connect_error", (err) => {
//   console.log("🔴 User socket error:", err.message);
//   Alert.alert("Socket Error", "Could not connect to server. Check network.");
// });

// socket.on("disconnect", (reason) => {
//   console.log("🔴 User socket disconnected:", reason);
// });

// export default socket;







































































































































// // D:\newapp\userapp-main 2\userapp-main\src\socket.ts
// import { io } from "socket.io-client";

// // Replace 'YOUR_LOCAL_IP' with the actual IP address of your computer.
// const socket = io("http://192.168.1.100:5001", {
//     transports: ["websocket"],
//     autoConnect: true,
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
// });

// // Debugging logs
// socket.on("connect", () => {
//     console.log("🟢 User socket connected:", socket.id);
// });

// socket.on("connect_error", (err) => {
//     console.log("🔴 User socket error:", err.message);
// });

// socket.on("disconnect", (reason) => {
//     console.log("🔴 User socket disconnected:", reason);
// });

// export default socket;



import { io } from "socket.io-client";
const socket = io("http://10.0.2.2:5001", {
  transports: ["websocket"],   // Force WebSocket transport
  autoConnect: true,           // Connect immediately when imported
  reconnection: true,          // Auto reconnect if connection drops
  reconnectionAttempts: 5,     // Retry max 5 times
  reconnectionDelay: 1000,     // Wait 1s between retries
});

// Debugging logs
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
