import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
  FaBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import styles from "./PostCard.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function PostCard({ post, currentUser, setCurrentUser, setPosts }) {
  // Derive liked and saved status directly from currentUser and post props
  const isLiked = currentUser?.likedPosts?.some(
    (id) => id.toString() === post._id.toString()
  );
  const isSaved = currentUser?.savedPosts?.some(
    (id) => id.toString() === post._id.toString()
  );
  const likesCount = post.likes?.length || 0;

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      await axios.post(
        `${API_URL}/api/interaction/like/${post._id}`,
        {},
        { withCredentials: true }
      );
      
     
      setCurrentUser((prev) => {
        const liked = prev.likedPosts || [];
        return {
          ...prev,
          likedPosts: isLiked
            ? liked.filter((id) => id.toString() !== post._id.toString())
            : [...liked, post._id],
        };
      });

     
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id.toString() === post._id.toString()) {
            const likes = p.likes || [];
            return {
              ...p,
              likes: isLiked
                ? likes.filter((id) => id.toString() !== currentUser._id.toString())
                : [...likes, currentUser._id],
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Like interaction failed:", err);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      await axios.post(
        `${API_URL}/api/post/save/${post._id}`,
        {},
        { withCredentials: true }
      );
      
     
      setCurrentUser((prev) => {
        const saved = prev.savedPosts || [];
        return {
          ...prev,
          savedPosts: isSaved
            ? saved.filter((id) => id.toString() !== post._id.toString())
            : [...saved, post._id],
        };
      });
    } catch (err) {
      console.error("Save interaction failed:", err);
    }
  };

  const author = post.author
  const isMe = author._id === currentUser?._id;
  const authorProfileLink = isMe ? "/myInfo" : `/lookFor/${author._id}`;

  return (
    <div className={styles.postCard}>
      {/* Post Header */}
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <Link to={authorProfileLink}>
            <img
              src={author.profilePicture || "/insta.webp"}
              alt={author.username || "user"}
              className={styles.authorAvatar}
            />
          </Link>
          <div className={styles.meta}>
            <Link to={authorProfileLink} className={styles.username}>
              {author.username || "unknown"}
            </Link>
          
          </div>
        </div>
        <button className={styles.moreBtn}>
          <FaEllipsisH />
        </button>
      </div>

      {/* Post Media */}
      <div className={styles.mediaContainer}>
        {post.mediaType === "image" ? (
          <img
            src={post.mediaUrl}
            alt={post.caption || "Post Content"}
            className={styles.media}
          />
        ) : (
          <video
            src={post.mediaUrl}
            className={styles.media}
            muted
            controls
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <div className={styles.leftActions}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button className={styles.actionBtn}>
            <FaRegComment />
          </button>
          <button className={styles.actionBtn}>
            <FaRegPaperPlane />
          </button>
        </div>
        <button
          className={`${styles.actionBtn} ${isSaved ? styles.saved : ""}`}
          onClick={handleSave}
        >
          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        <Link to={`/seeWhoLiked/${post._id}`} className={styles.likesCountLink}>
          <div className={styles.likesCount}>
            {likesCount.toLocaleString()} likes
          </div>
        </Link>
        <div className={styles.caption}>
          <Link to={authorProfileLink} className={styles.captionUser}>
            {author.username || "unknown"}
          </Link>
          <span>{post.caption}</span>
        </div>
        <div className={styles.time}>
          {post.createdAt
            ? formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              }).toUpperCase()
            : "JUST NOW"}
        </div>
      </div>
    </div>
  );
}

export default PostCard;