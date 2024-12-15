import { io } from "socket.io-client";

export const socket = io("/", {
  path: "/socket.io",
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("WebSocket接続が確立されました");
});

socket.on("connect_error", (error) => {
  console.error("WebSocket接続エラー:", error);
});

socket.on("disconnect", (reason) => {
  console.log("WebSocket切断:", reason);
});
