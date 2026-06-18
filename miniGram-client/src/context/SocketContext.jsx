import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    const handleOffline = () => {
      newSocket.disconnect();
    };

    const handleOnline = () => {
      newSocket.connect();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleOffline();
      } else {
        handleOnline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleOffline);
    window.addEventListener("pageshow", handleOnline);
    window.addEventListener("beforeunload", handleOffline);

    return () => {
      newSocket.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleOffline);
      window.removeEventListener("pageshow", handleOnline);
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
