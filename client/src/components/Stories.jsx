import styles from "./Stories.module.css";

const MOCK_STORIES = [
  { id: 1, username: "Your Story", avatar: "/insta.webp", isUser: true },
  { id: 2, username: "rahul_s", avatar: "/insta.webp" },
  { id: 3, username: "sneha_r", avatar: "/insta.webp" },
  { id: 4, username: "aman_g", avatar: "/insta.webp" },
  { id: 5, username: "priya_v", avatar: "/insta.webp" },
  { id: 6, username: "vikram_k", avatar: "/insta.webp" },
  { id: 7, username: "neha_sh", avatar: "/insta.webp" },
];

function Stories() {
  return (
    <div className={styles.storiesContainer}>
      {MOCK_STORIES.map((story) => (
        <div key={story.id} className={styles.storyItem}>
          <div className={`${styles.avatarRing} ${story.isUser ? styles.userRing : ""}`}>
            <img
              src={story.avatar}
              alt={story.username}
              className={styles.avatar}
            />
            {story.isUser && <span className={styles.plusIcon}>+</span>}
          </div>
          <span className={styles.username}>{story.username}</span>
        </div>
      ))}
    </div>
  );
}

export default Stories;