import { io } from "socket.io-client";

export const socket = io("/", {
  path: "/socket.io",
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("WebSocket接続が確立されました");
});

socket.on("connect_error", (error) => {
  console.error("WebSocket接続エラー:", error);
});
