import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "")
  : "http://localhost:5050";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  transports: ["websocket", "polling"],
});
