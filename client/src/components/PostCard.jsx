import { useState } from "react";
import { FaRegHeart, FaHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark, FaBookmark, FaEllipsisH } from "react-icons/fa";
import styles from "./PostCard.module.css";

function PostCard() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(382);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const toggleSave = () => {
    setSaved(!saved);
  };

  return (
    <div className={styles.postCard}>
      {/* Post Header */}
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <img src="/insta.webp" alt="Author Avatar" className={styles.authorAvatar} />
          <div className={styles.meta}>
            <span className={styles.username}>sneha_r</span>
            <span className={styles.location}>Seattle, Washington</span>
          </div>
        </div>
        <button className={styles.moreBtn}>
          <FaEllipsisH />
        </button>
      </div>

      {/* Post Media */}
      <div className={styles.mediaContainer}>
        <img src="/insta.webp" alt="Post Content" className={styles.media} />
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <div className={styles.leftActions}>
          <button className={`${styles.actionBtn} ${liked ? styles.liked : ""}`} onClick={toggleLike}>
            {liked ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button className={styles.actionBtn}>
            <FaRegComment />
          </button>
          <button className={styles.actionBtn}>
            <FaRegPaperPlane />
          </button>
        </div>
        <button className={`${styles.actionBtn} ${saved ? styles.saved : ""}`} onClick={toggleSave}>
          {saved ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        <div className={styles.likesCount}>
          {likesCount.toLocaleString()} likes
        </div>
        <div className={styles.caption}>
          <span className={styles.captionUser}>sneha_r</span>
          Coding a brand new React application today! Let's make it look absolutely stunning. 💻⚡ #developer #reactjs #webdesign
        </div>
        <div className={styles.time}>
          45 minutes ago
        </div>
      </div>
    </div>
  );
}

export default PostCard;