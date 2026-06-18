import { useContext } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext.jsx";
import styles from "./ChatList.module.css";

function ChatList({ chats }) {
  const { onlineUsers } = useContext(SocketContext);

  if (!chats || chats.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No active chats yet</p>
      </div>
    );
  }

  return (
    <div className={styles.chatList}>
      {chats.map((item) => {
        const userId = item.otherParticipant?._id;
        const name = item.otherParticipant?.name;
        const username = item.otherParticipant?.username;
        const avatar = item.otherParticipant?.profilePicture || "/insta.webp";

        let lastMessageText = "";
        let timeText = "";

        const lm = item.lastMessage;
        if (lm) {
          const isSenderOther =
            lm.senderId?.toString() === item.otherParticipant?._id?.toString();
          const prefix = isSenderOther
            ? `${item.otherParticipant?.name || item.otherParticipant?.username}: `
            : "You: ";

          if (lm.message) {
            lastMessageText = `${prefix}${lm.message}`;
          } else if (lm.image) {
            lastMessageText = `${prefix}📷 Photo`;
          } else if (lm.video) {
            lastMessageText = `${prefix}🎥 Video`;
          }
          if (lm.createdAt) {
            const date = new Date(lm.createdAt);
            timeText = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }

        const isOnline = onlineUsers.some(
          (onlineId) => onlineId.toString() === userId?.toString()
        );

        return (
          <Link
            key={userId}
            to={`/chatwith/${userId}`}
            className={styles.chatLink}
          >
            <div className={styles.chatItem}>
              <div className={styles.avatarContainer}>
                <img
                  src={avatar}
                  alt={name || username}
                  className={styles.avatar}
                />
                {isOnline && <div className={styles.statusDot} />}
              </div>

              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <span className={styles.name}>{name || `@${username}`}</span>
                  {timeText && <span className={styles.time}>{timeText}</span>}
                </div>
                <span className={styles.message}>
                  {lastMessageText || "Start chatting..."}
                </span>
              </div>

              {item.glow && <div className={styles.glowDot} />}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default ChatList;
