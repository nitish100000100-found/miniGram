import styles from "./ChatList.module.css";

const MOCK_CHATS = [
  {
    id: 1,
    name: "Rahul Sharma",
    avatar: "/insta.webp",
    lastMessage: "Are you coming to the party tonight?",
    time: "2m ago",
    online: true,
  },
  {
    id: 2,
    name: "Aman Gupta",
    avatar: "/insta.webp",
    lastMessage: "Check out the design files I sent.",
    time: "1h ago",
    online: false,
  },
  {
    id: 3,
    name: "Sneha Reddy",
    avatar: "/insta.webp",
    lastMessage: "Haha indeed! Let's connect tomorrow.",
    time: "3h ago",
    online: true,
  },
];

function ChatList() {
  return (
    <div className={styles.chatList}>
      {MOCK_CHATS.map((chat) => (
        <div key={chat.id} className={styles.chatItem}>
          <div className={styles.avatarContainer}>
            <img
              src={chat.avatar}
              alt={chat.name}
              className={styles.avatar}
            />
            {chat.online && <span className={styles.statusDot} />}
          </div>

          <div className={styles.chatInfo}>
            <div className={styles.chatHeader}>
              <span className={styles.name}>{chat.name}</span>
              <span className={styles.time}>{chat.time}</span>
            </div>
            <span className={styles.message}>{chat.lastMessage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatList;