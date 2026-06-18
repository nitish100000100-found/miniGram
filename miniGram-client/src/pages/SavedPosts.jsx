import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
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
import ShowReel from "../components/ShowReel";
import styles from "./SavedPosts.module.css";

const API_URL = import.meta.env.VITE_API_URL;

const SavedPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loops, setLoops] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playId, setPlayId] = useState(null);
  const [muteId, setMuteId] = useState(null);
  const [error, setError] = useState("");

  const [heartPops, setHeartPops] = useState(null);
  const clickTimer = useRef(null);

  const handlePlayVideo = (postId) => {
    if (playId === null && muteId === null) {
      setPlayId(postId);
      setMuteId(postId);
    } else if (playId === postId || muteId === postId) {
      setPlayId((prev) => (prev === postId ? null : postId));
    } else {
      setPlayId(postId);
      setMuteId(postId);
    }
  };

  const handleMuteVideo = (postId) => {
    if (playId === null && muteId === null) {
      setPlayId(postId);
      setMuteId(postId);
    } else if (playId === postId || muteId === postId) {
      setMuteId((prev) => (prev === postId ? null : postId));
    } else {
      setPlayId(postId);
      setMuteId(postId);
    }
  };

  useEffect(() => {
    document.querySelectorAll("video").forEach((video) => {
      if (video.id === playId) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [playId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!playId) return;

      const video = document.getElementById(playId);
      if (!video) return;

      const rect = video.getBoundingClientRect();

      // Pause if video is far outside the viewport
      if (
        rect.bottom < -200 || // 200px above screen
        rect.top > window.innerHeight + 200 // 200px below screen
      ) {
        video.pause();
        setPlayId(null);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [playId]);

  useEffect(() => {
    document.querySelectorAll("video").forEach((video) => {
      video.muted = video.id !== muteId;
    });
  }, [muteId]);

  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        const [postsRes, loopsRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/api/post/saved`, { withCredentials: true }),
          axios.get(`${API_URL}/api/loop/saved/all`, { withCredentials: true }),
          axios.get(`${API_URL}/api/user/current`, { withCredentials: true }),
        ]);

        setPosts(postsRes.data.savedPosts || []);
        setLoops(loopsRes.data.savedLoops || []);
        setCurrentUser(userRes.data.user);
      } catch (err) {
        console.error("Failed to load saved items:", err);
        setError("Failed to load saved items.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedData();
  }, []);

  const handleSingleClick = (postId) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    } else {
      clickTimer.current = setTimeout(() => {
        handlePlayVideo(postId);
        clickTimer.current = null;
      }, 250);
    }
  };
  const handleDoubleClick = (post) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    const isLiked = currentUser?.likedPosts?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
    );

    if (!isLiked) {
      handleLike(post);
    }

    setHeartPops(post._id);

    setTimeout(() => {
      setHeartPops(null);
    }, 800);
  };
  const handleLike = async (post) => {
    if (!currentUser) return;
    const isLiked = currentUser?.likedPosts?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
    );
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

  const handleSave = async (post) => {
    if (!currentUser) return;
    const isSaved = currentUser?.savedPosts?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
    );
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

      if (isSaved) {
        setPosts((prev) =>
          prev.filter((p) => p._id.toString() !== post._id.toString()),
        );
      }
    } catch (err) {
      console.error("Save interaction failed:", err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <ClipLoader size={45} color="#8b5cf6" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/settings")}
          >
            <IoArrowBack size={24} />
          </button>
          <h2 className={styles.heading}>Saved Posts</h2>
          <div style={{ width: "24px" }} />
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Tab Selection */}
        <div className={styles.profileTabs}>
          <button
            type="button"
            className={`${styles.profileTabBtn} ${activeTab === "posts" ? styles.activeProfileTab : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            ▦ Posts
          </button>
          <button
            type="button"
            className={`${styles.profileTabBtn} ${activeTab === "loops" ? styles.activeProfileTab : ""}`}
            onClick={() => setActiveTab("loops")}
          >
            🎬 Loops
          </button>
        </div>

        <div className={styles.postsSection}>
          {activeTab === "posts" ? (
            <div className={styles.feed}>
              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaBookmark className={styles.emptyIcon} />
                  <h3>No Saved Posts</h3>
                  <p>When you save photos and videos, they'll appear here.</p>
                </div>
              ) : (
                posts.map((post) => {
                  const author = post.author;
                  if (!author) return null;

                  const isLiked = currentUser?.likedPosts?.some(
                    (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
                  );
                  const isSaved = currentUser?.savedPosts?.some(
                    (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
                  );
                  const likesCount = post.likes?.length || 0;
                  const isMe =
                    author._id?.toString() === currentUser?._id?.toString();
                  const authorProfileLink = isMe
                    ? "/myInfo"
                    : `/lookFor/${author._id}`;

                  return (
                    <div key={post._id} className={styles.postCard}>
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
                            <Link
                              to={authorProfileLink}
                              className={styles.username}
                            >
                              {author.username || "unknown"}
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Post Media */}
                      <div
                        className={`${styles.mediaContainer} ${styles.reel}`}
                        onDoubleClick={() => handleDoubleClick(post)}
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
                              onClick={() => handleSingleClick(post._id)}
                            />

                            {playId !== post._id && (
                              <div
                                className={styles.videoPlayOverlay}
                                onClick={() => handleSingleClick(post._id)}
                              >
                                <FaPlay size={18} />
                              </div>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMuteVideo(post._id);
                              }}
                              className={styles.videoMuteBtn}
                            >
                              {muteId === post._id ? (
                                <FaVolumeUp />
                              ) : (
                                <FaVolumeMute />
                              )}
                            </button>
                          </div>
                        )}

                        {heartPops === post._id && (
                          <div className={styles.heartOverlay}>
                            <FaHeart size={70} className={styles.popHeartIcon} />
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className={styles.actions}>
                        <div className={styles.leftActions}>
                          <button
                            className={`${styles.actionBtn} ${
                              isLiked ? styles.liked : ""
                            }`}
                            onClick={() => handleLike(post)}
                          >
                            {isLiked ? <FaHeart /> : <FaRegHeart />}
                          </button>
                          <Link
                            to={`/commentpage/${post._id}`}
                            className={styles.actionBtn}
                          >
                            <FaRegComment />
                            <span className={styles.commentCount}>
                              {post.comments?.length || 0}
                            </span>
                          </Link>
                        </div>
                        <button
                          className={`${styles.actionBtn} ${
                            isSaved ? styles.saved : ""
                          }`}
                          onClick={() => handleSave(post)}
                        >
                          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className={styles.content}>
                        <Link
                          to={`/seeWhoLiked/${post._id}`}
                          className={styles.likesCountLink}
                        >
                          <div className={styles.likesCount}>
                            {likesCount.toLocaleString()} likes
                          </div>
                        </Link>
                        <div className={styles.caption}>
                          <Link
                            to={authorProfileLink}
                            className={styles.captionUser}
                          >
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
                })
              )}
            </div>
          ) : (
            <ShowReel loops={loops} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPosts;
