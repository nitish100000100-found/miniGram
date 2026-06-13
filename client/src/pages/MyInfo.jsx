import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  FaUser,
  FaBriefcase,
  FaVenusMars,
  FaInfoCircle,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaUserEdit,
  FaCog,
  FaPlus,
  FaEllipsisH,
  FaRegComment,
  FaRegPaperPlane,
} from "react-icons/fa";

import styles from "./MyInfo.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyInfo() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heartPopPostId, setHeartPopPostId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleDoubleClick = (postId, isLiked) => {
    if (!isLiked) {
      handleLike(postId, isLiked);
    }
    setHeartPopPostId(postId);
    setTimeout(() => {
      setHeartPopPostId(null);
    }, 800);
  };

  const handleLike = async (postId, isLiked) => {
    if (!user) return;
    try {
      await axios.post(
        `${API_URL}/api/interaction/like/${postId}`,
        {},
        { withCredentials: true }
      );
      
      setUser((prev) => {
        if (!prev) return prev;
        const liked = prev.likedPosts || [];
        const updatedLiked = isLiked
          ? liked.filter((id) => id.toString() !== postId.toString())
          : [...liked, postId];
        
        const updatedPosts = (prev.posts || []).map((p) => {
          if (p._id.toString() === postId.toString()) {
            const likes = p.likes || [];
            return {
              ...p,
              likes: isLiked
                ? likes.filter((id) => id.toString() !== prev._id.toString())
                : [...likes, prev._id],
            };
          }
          return p;
        });

        return {
          ...prev,
          likedPosts: updatedLiked,
          posts: updatedPosts,
        };
      });
    } catch (err) {
      console.error("Like interaction failed:", err);
    }
  };

  const handleComment = (post) => console.log("Comment:", post);
  const handleShare = (post) => console.log("Share:", post);

  const handleSave = async (postId, isSaved) => {
    if (!user) return;
    try {
      await axios.post(
        `${API_URL}/api/post/save/${postId}`,
        {},
        { withCredentials: true }
      );
      
      setUser((prev) => {
        if (!prev) return prev;
        const saved = prev.savedPosts || [];
        const updatedSaved = isSaved
          ? saved.filter((id) => id.toString() !== postId.toString())
          : [...saved, postId];

        return {
          ...prev,
          savedPosts: updatedSaved,
        };
      });
    } catch (err) {
      console.error("Save interaction failed:", err);
    }
  };

  const togglePrivacy = async () => {
    try {
      const endpoint = user.isPrivate ? "switch-to-public" : "switch-to-private";
      const res = await axios.post(`${API_URL}/api/user/${endpoint}`, {}, {
        withCredentials: true,
      });
      
      if (res.data?.user) {
        setUser((prev) => ({
          ...prev,
          isPrivate: res.data.user.isPrivate,
        }));
      }
      window.location.reload();
    } catch (error) {
      console.error("Failed to toggle privacy status:", error);
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });

       setUser(res.data.user);
      } catch (error) {
        console.error(error);

        if (
          error.response?.data?.message ===
          "Unauthorized: No token provided !"
        ) {
          navigate("/signin");
        }
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return <div className={styles.loading}>Something went wrong.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/favicon-v2.svg" alt="MiniGram" />
          <h1>MiniGram</h1>
        </Link>

        <div className={styles.topBarRight}>
          <Link to="/" className={styles.backBtn}>
            ← Back
          </Link>
          <button
            type="button"
            className={styles.settingsLinkBtn}
            onClick={() => navigate("/settings")}
          >
            <FaCog /> Settings
          </button>
        </div>
      </div>
      <div className={styles.profileCard}>
        <div className={styles.left}>
          <div className={styles.avatarContainer}>
            {user.stories && user.stories.length > 0 ? (
              <Link to={`/lookForStory/${user.stories[0]._id || user.stories[0]}`}>
                <img
                  src={user.profilePicture || "/insta.webp"}
                  alt={user.name}
                  className={`${styles.avatar} ${styles.avatarWithStory}`}
                />
              </Link>
            ) : (
              <img
                src={user.profilePicture || "/insta.webp"}
                alt={user.name}
                className={styles.avatar}
              />
            )}
            <div className={styles.actionLinks}>
              <button
                type="button"
                className={styles.profileLinkBtn}
                onClick={() => navigate("/editProfile")}
              >
                <FaUserEdit /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.profileHeader}>
            <h2>@{user.username}</h2>
            <div className={styles.profileHeaderBtns}>
              <button
                type="button"
                onClick={togglePrivacy}
                className={styles.privacyToggleBtn}
              >
                {user.isPrivate ? "Switch to Public" : "Switch to Private"}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={styles.themeToggleBtn}
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          </div>

          <div className={styles.stats}>
            <div>
              <strong>{user.posts?.length || 0}</strong>
              <span>Posts</span>
            </div>

            <Link to={`/lookfollowers/${user._id}`}>
              <strong>{user.followers?.length || 0}</strong>
              <span>Followers</span>
            </Link>

            <Link to={`/lookfollowing/${user._id}`}>
              <strong>{user.following?.length || 0}</strong>
              <span>Following</span>
            </Link>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <FaUser />
              <span>{user.name || "Unknown User"}</span>
            </div>

            <div className={styles.infoCard}>
              <FaBriefcase />
              <span>{user.profession || "Profession not shared"}</span>
            </div>

            <div className={styles.infoCard}>
              <FaVenusMars />
              <span>{user.gender || "Gender not shared"}</span>
            </div>

            <div className={styles.infoCard}>
              <FaInfoCircle />
              <span>{user.bio || "No bio shared yet"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <div className={styles.highlightsSection}>
        <div className={styles.highlightsList}>
          {/* Add New Highlight Button */}
          <div className={styles.addHighlightItem}>
            <div className={styles.addHighlightRing}>
              <FaPlus size={20} />
            </div>
            <span className={styles.highlightTitle}>New</span>
          </div>

          {/* Render existing highlights */}
          {user.highlights && user.highlights.map((highlight) => (
            <div key={highlight._id} className={styles.highlightItem}>
              <div className={styles.highlightRing}>
                <img
                  src={highlight.coverImage || "/insta.webp"}
                  alt={highlight.title}
                  className={styles.highlightImage}
                />
              </div>
              <span className={styles.highlightTitle}>{highlight.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.postsSection}>
        <h3>Posts</h3>

        {user.posts?.length === 0 ? (
          <div className={styles.emptyPosts}>
            <h2>No Posts Yet</h2>
            <p>You haven't shared anything yet.</p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {[...(user.posts || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((post) => {
              const isLiked = user?.likedPosts?.some(
                (id) => id.toString() === post._id.toString(),
              );

              const isSaved = user?.savedPosts?.some(
                (id) => id.toString() === post._id.toString(),
              );

              return (
                <div key={post._id} className={styles.feedPostCard}>
                  {/* Post Header */}
                  <div className={styles.postHeader}>
                    <div className={styles.postAuthorInfo}>
                      <img
                        src={user.profilePicture || "/insta.webp"}
                        alt="Author Avatar"
                        className={`${styles.postAuthorAvatar} ${user.stories && user.stories.length > 0 ? styles.postAuthorAvatarWithStory : ""}`}
                      />
                      <div className={styles.postMeta}>
                        <span className={styles.postUsername}>{user.username}</span>
                        {post.location && (
                          <span className={styles.postLocation}>{post.location}</span>
                        )}
                      </div>
                    </div>
                    <button className={styles.postMoreBtn}>
                      <FaEllipsisH />
                    </button>
                  </div>

                  {/* Post Media */}
                  <div
                    className={styles.postMediaContainer}
                    onDoubleClick={() => handleDoubleClick(post._id, isLiked)}
                  >
                    {post.mediaType === "image" ? (
                      <img
                        src={post.mediaUrl}
                        alt={post.caption || "Post"}
                        className={styles.postImage}
                      />
                    ) : (
                      <video
                        src={post.mediaUrl}
                        className={styles.postImage}
                        muted
                        controls
                      />
                    )}
                    {heartPopPostId === post._id && (
                      <div className={styles.heartOverlay}>
                        <FaHeart size={70} className={styles.popHeartIcon} />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.postActions}>
                    <div className={styles.postLeftActions}>
                      <button 
                        className={`${styles.postActionBtn} ${isLiked ? styles.postLiked : ""}`}
                        onClick={() => handleLike(post._id, isLiked)}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <Link to={`/commentpage/${post._id}`} className={styles.postActionBtn}>
                        <FaRegComment />
                        <span className={styles.commentCount}>{post.comments?.length || 0}</span>
                      </Link>
                      <button 
                        className={styles.postActionBtn}
                        onClick={() => handleShare(post)}
                      >
                        <FaRegPaperPlane />
                      </button>
                    </div>

                    <button 
                      className={`${styles.postActionBtn} ${isSaved ? styles.postSaved : ""}`}
                      onClick={() => handleSave(post._id, isSaved)}
                    >
                      {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className={styles.postContent}>
                    <Link to={`/seeWhoLiked/${post._id}`} className={styles.likesCountLink}>
                      <div className={styles.postLikesCount}>
                        {(post.likes?.length || 0).toLocaleString()} likes
                      </div>
                    </Link>
                    <div className={styles.postCaption}>
                      <span className={styles.postCaptionUser}>{user.username}</span>
                      <span className={styles.postCaptionText}>{post.caption}</span>
                    </div>
                    <div className={styles.postTime}>
                      {post.createdAt 
                        ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).toUpperCase()
                        : "JUST NOW"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInfo;