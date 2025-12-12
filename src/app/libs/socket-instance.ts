import { io, type Socket } from "socket.io-client";

import useAccessToken from "../hooks/use-access-token";

let socketInstance: Socket | null = null;

const getSocketInstance = () => {
  const { accessToken } = useAccessToken.getState();

  // Return existing instance if it's connected and token matches
  if (socketInstance?.connected) {
    const currentToken = (socketInstance.auth as { token?: string })?.token;

    if (accessToken === currentToken) {
      return socketInstance;
    }
  }

  // Disconnect and cleanup old instance if it exists
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance.removeAllListeners();

    socketInstance = null;
  }

  // Create new instance with current token in auth field
  socketInstance = io(
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000",
    {
      transports: ["websocket"],
      auth: accessToken
        ? {
            token: accessToken,
          }
        : {},
      autoConnect: !!accessToken,
    }
  );

  return socketInstance;
};

export default getSocketInstance;
