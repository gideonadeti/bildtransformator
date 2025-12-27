import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000",
  {
    transports: ["websocket"],
    autoConnect: false, // Don't connect until we have the access token
  }
);
