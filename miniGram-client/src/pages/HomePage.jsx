import DesktopLayout from "../components/DesktopLayout.jsx";
import MobileLayout from "../components/MobileLayout.jsx";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { SocketContext } from "../context/SocketContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function HomePage() {
  const { socket } = useContext(SocketContext);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 900
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/interaction/notifications`, {
          withCredentials: true,
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching notifications count:", err.message);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/message/unreadCount`, {
          withCredentials: true,
        });
        setUnreadMessagesCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching unread messages count:", err.message);
      }
    };

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 5000);

    return () => clearInterval(interval);
  }, []);

  return isMobile
    ? <MobileLayout unreadCount={unreadCount} unreadMessagesCount={unreadMessagesCount} />
    : <DesktopLayout unreadCount={unreadCount} unreadMessagesCount={unreadMessagesCount} />;
}

export default HomePage;