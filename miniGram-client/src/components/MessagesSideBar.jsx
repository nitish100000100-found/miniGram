import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import ChatList from "./ChatList.jsx";
import { SocketContext } from "../context/SocketContext.jsx";
import styles from "./MessageSidebar.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function MessagesSideBar() {
  const { onlineUsers } = useContext(SocketContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeChats, setActiveChats] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unreadRes, chatsRes, currRes] = await Promise.all([
          axios.get(`${API_URL}/api/message/unreadCount`, { withCredentials: true }),
          axios.get(`${API_URL}/api/message/getUserChatList`, { withCredentials: true }),
          axios.get(`${API_URL}/api/user/current`, { withCredentials: true })
        ]);
        setUnreadCount(unreadRes.data.unreadCount || 0);
        setActiveChats(chatsRes.data.chatList || []);
        setFollowing(currRes.data.user?.following || []);
      } catch (err) {
        console.error("Error fetching messages sidebar data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const onlineFollowing = following.filter((u) =>
    onlineUsers.some((onlineId) => onlineId.toString() === u._id.toString())
  );

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

 
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${API_URL}/api/message/searchUsers`,
          { query: debouncedQuery },
          { withCredentials: true }
        );
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("User search failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const isSearching = query.trim().length > 0;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <FiArrowLeft />
        </Link>
        <h3>Messages {unreadCount > 0 && `(${unreadCount})`}</h3>
      </div>

      <input
        className={styles.search}
        placeholder="Search User"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Online Followers Carousel */}
      {!isSearching && onlineFollowing.length > 0 && (
        <div className={styles.onlineCarousel}>
          {onlineFollowing.map((user) => (
            <Link
              key={user._id}
              to={`/chatwith/${user._id}`}
              className={styles.onlineUserItem}
            >
              <div className={styles.onlineAvatarWrapper}>
                <img
                  src={user.profilePicture || "/insta.webp"}
                  alt={user.username}
                  className={styles.onlineAvatar}
                />
                <div className={styles.greenDot} />
              </div>
              <span className={styles.onlineUsername}>
                {user.name || user.username}
              </span>
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "rgba(255, 255, 255, 0.4)" }}>
          Loading...
        </div>
      ) : isSearching ? (
        <div className={styles.searchResults}>
          {searchResults.map((user) => (
            <Link
              key={user._id}
              to={`/chatwith/${user._id}`}
              className={styles.searchResultLink}
              onClick={() => setQuery("")}
            >
              <div className={styles.searchUserItem}>
                <img
                  src={user.profilePicture || "/insta.webp"}
                  alt={user.username}
                  className={styles.searchAvatar}
                />
                <div className={styles.searchUserInfo}>
                  <span className={styles.searchName}>{user.name || user.username}</span>
                  <span className={styles.searchUsername}>@{user.username}</span>
                </div>
              </div>
            </Link>
          ))}
          {searchResults.length === 0 && (
            <div className={styles.noResults}>No users found</div>
          )}
        </div>
      ) : (
        <ChatList chats={activeChats} />
      )}
    </div>
  );
}

export default MessagesSideBar;