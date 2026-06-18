import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import styles from "./PostCard.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function PostCard({
  post,
  currentUser,
  setCurrentUser,
  setPosts,
  playId,
  muteId,
  onPlayToggle,
  onMuteToggle,
}) {
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Derive liked and saved status directly from currentUser and post props
  const isLiked = currentUser?.likedPosts?.some(
    (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString(),
  );
  const isSaved = currentUser?.savedPosts?.some(
    (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString(),
  );
  const likesCount = post.likes?.length || 0;

  const clickTimer = useRef(null);

  const handleSingleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    } else {
      clickTimer.current = setTimeout(() => {
        onPlayToggle();
        clickTimer.current = null;
      }, 250);
    }
  };

  const handleDoubleClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    if (!isLiked) {
      handleLike();
    }
    setShowHeartPop(true);
    setTimeout(() => {
      setShowHeartPop(false);
    }, 800);
  };

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      await axios.post(
        `${API_URL}/api/interaction/like/${post._id}`,
        {},
        { withCredentials: true },
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
                ? likes.filter(
                    (id) => id.toString() !== currentUser._id.toString(),
                  )
                : [...likes, currentUser._id],
            };
          }
          return p;
        }),
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
        { withCredentials: true },
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

  const author = post.author;
  if (!author) return null;
  const isMe = author._id?.toString() === currentUser?._id?.toString();
  const activeStory = author.stories?.find((s) => s && s._id);
  const hasAuthorStory = !!activeStory;
  const authorProfileLink = isMe ? "/myInfo" : `/lookFor/${author._id}`;
  const authorStoryLink = hasAuthorStory
    ? `/lookForStory/${activeStory._id}`
    : authorProfileLink;

  return (
    <div className={styles.postCard}>
      {/* Post Header */}
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <Link to={authorStoryLink}>
            <img
              src={author.profilePicture || "/insta.webp"}
              alt={author.username || "user"}
              className={`${styles.authorAvatar} ${hasAuthorStory ? styles.avatarWithStory : ""}`}
            />
          </Link>
          <div className={styles.meta}>
            <Link to={authorProfileLink} className={styles.username}>
              {author.username || "unknown"}
            </Link>
          </div>
        </div>
      </div>

      {/* Post Media */}
      <div
        className={`${styles.mediaContainer} ${styles.reel}`}
        onDoubleClick={handleDoubleClick}
      >
        {post.mediaType === "image" ? (
          <img
            src={post.mediaUrl}
            alt={post.caption || "Post Content"}
            className={styles.media}
          />
        ) : (
          <div className={styles.videoWrapper}>
            <video
              id={post._id}
              src={post.mediaUrl}
              className={styles.media}
              muted={muteId !== post._id}
              loop
              playsInline
              onClick={handleSingleClick}
            />
            {playId !== post._id && (
              <div
                className={styles.videoPlayOverlay}
                onClick={handleSingleClick}
              >
                <FaPlay size={18} />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMuteToggle();
              }}
              className={styles.videoMuteBtn}
            >
              {muteId === post._id ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
          </div>
        )}
        {showHeartPop && (
          <div className={styles.heartOverlay}>
            <FaHeart size={70} className={styles.popHeartIcon} />
          </div>
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
          <Link to={`/commentpage/${post._id}`} className={styles.actionBtn}>
            <FaRegComment />
            <span className={styles.commentCount}>
              {post.comments?.length || 0}
            </span>
          </Link>
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
