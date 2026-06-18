import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  FaBookmark,
  FaRegBookmark,
  FaUserEdit,
  FaCog,
  FaPlus,
  FaTrash,
  FaRegComment,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

import styles from "./MyInfo.module.css";
import ShowReel from "../components/ShowReel.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function MyInfo() {
  const navigate = useNavigate();
  const [playId, setPlayId] = useState(null);
  const [muteId, setMuteId] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loops, setLoops] = useState([]);

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

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heartPopPostId, setHeartPopPostId] = useState(null);
  const [postToDeleteId, setPostToDeleteId] = useState(null);
  const [showDeletePop, setShowDeletePop] = useState(false);

  const handleConfirmDelete = async () => {
    if (!postToDeleteId) return;
    try {
      await axios.post(
        `${API_URL}/api/post/delete/${postToDeleteId}`,
        {},
        { withCredentials: true },
      );
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.filter((p) => p._id !== postToDeleteId),
        };
      });
    } catch (err) {
      console.error("Delete post failed:", err);
    } finally {
      setShowDeletePop(false);
      setPostToDeleteId(null);
    }
  };

  const clickTimer = useRef(null);

  const handlePlayVideoWithTimer = (postId) => {
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

  const handleDoubleClick = (postId, isLiked) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
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
        { withCredentials: true },
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

  const handleSave = async (postId, isSaved) => {
    if (!user) return;
    try {
      await axios.post(
        `${API_URL}/api/post/save/${postId}`,
        {},
        { withCredentials: true },
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
          error.response?.data?.message === "Unauthorized: No token provided !"
        ) {
          navigate("/signin");
        }
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchLoops = async () => {
      if (!user) return;
      try {
        const loopsRes = await axios.get(
          `${API_URL}/api/loop/user/${user._id}`,
          {
            withCredentials: true,
          },
        );
        setLoops(loopsRes.data.loops || []);
      } catch (err) {
        console.error("Failed to fetch user loops:", err);
      }
    };
    fetchLoops();
  }, [user]);

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
        </div>
      </div>
      <div className={styles.profileCard}>
        <div className={styles.left}>
          <div className={styles.avatarContainer}>
            {user.hasStory ? (
              <Link to={`/lookForStory/${user.targetStoryId}`}>
                <img
                  src={user.profilePicture || "/insta.webp"}
                  alt={user.name}
                  className={
                    user.allViewed ? styles.userRing : styles.avatarRing
                  }
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
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className={styles.settingsBtn}
            >
              <FaCog /> Settings
            </button>
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
        <h3 className={styles.highlightsHeader}>Highlights</h3>
        <div className={styles.highlightsList}>
          {!user.highlights || user.highlights.length === 0 ? (
            <div className={styles.noHighlights}>
              <span className={styles.noHighlightsMsg}>
                No highlights yet. Turn your active stories into highlights.
              </span>
            </div>
          ) : (
            user.highlights.map((highlight) => {
              if (!highlight.stories || highlight.stories.length === 0)
                return null;
              return (
                <Link
                  key={highlight._id}
                  to={`/lookForHighlight/${highlight._id}/${highlight.stories[0]._id}`}
                  className={styles.highlightItem}
                  style={{ textDecoration: "none" }}
                >
                  <div className={styles.highlightRing}>
                    <img
                      src={
                        highlight.coverImage ||
                        user?.profilePicture ||
                        "/insta.webp"
                      }
                      alt={highlight.title}
                      className={styles.highlightImage}
                    />
                  </div>
                  <span className={styles.highlightTitle}>
                    {highlight.title}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

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
        <h3>{activeTab === "posts" ? "Posts" : "Loops"}</h3>

        {activeTab === "posts" ? (
          user.posts?.length === 0 ? (
            <div className={styles.emptyPosts}>
              <h2>No Posts Yet</h2>
              <p>You haven't shared anything yet.</p>
            </div>
          ) : (
            <div className={styles.postsGrid}>
              {[...(user.posts || [])]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post) => {
                  const isLiked = user?.likedPosts?.some(
                    (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString(),
                  );

                  const isSaved = user?.savedPosts?.some(
                    (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString(),
                  );

                  return (
                    <div key={post._id} className={styles.feedPostCard}>
                      {/* Post Header */}
                      <div className={styles.postHeader}>
                        <div className={styles.postAuthorInfo}>
                          {user.hasStory ? (
                            <Link to={`/lookForStory/${user.targetStoryId}`}>
                              <img
                                src={user.profilePicture || "/insta.webp"}
                                alt="Author Avatar"
                                className={
                                  user.allViewed
                                    ? styles.postAuthorAvatarSeen
                                    : styles.postAuthorAvatarWithStory
                                }
                              />
                            </Link>
                          ) : (
                            <img
                              src={user.profilePicture || "/insta.webp"}
                              alt="Author Avatar"
                              className={styles.postAuthorAvatar}
                            />
                          )}
                          <div className={styles.postMeta}>
                            <span className={styles.postUsername}>
                              {user.username}
                            </span>
                            {post.location && (
                              <span className={styles.postLocation}>
                                {post.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className={styles.postDeleteBtn}
                          onClick={() => {
                            setPostToDeleteId(post._id);
                            setShowDeletePop(true);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div
                        className={`${styles.postMediaContainer} ${styles.reel}`}
                        onDoubleClick={() =>
                          handleDoubleClick(post._id, isLiked)
                        }
                      >
                        {post.mediaType === "image" ? (
                          <img
                            src={post.mediaUrl}
                            alt={post.caption || "Post"}
                            className={styles.postImage}
                          />
                        ) : (
                          <div className={styles.videoWrapper}>
                            <video
                              id={post._id}
                              src={post.mediaUrl}
                              className={styles.postImage}
                              muted={muteId !== post._id}
                              loop
                              playsInline
                              onClick={() => handlePlayVideoWithTimer(post._id)}
                            />
                            {playId !== post._id && (
                              <div
                                className={styles.videoPlayOverlay}
                                onClick={() =>
                                  handlePlayVideoWithTimer(post._id)
                                }
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
                        {heartPopPostId === post._id && (
                          <div className={styles.heartOverlay}>
                            <FaHeart
                              size={70}
                              className={styles.popHeartIcon}
                            />
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
                          <Link
                            to={`/commentpage/${post._id}`}
                            className={styles.postActionBtn}
                          >
                            <FaRegComment />
                            <span className={styles.commentCount}>
                              {post.comments?.length || 0}
                            </span>
                          </Link>
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
                        <Link
                          to={`/seeWhoLiked/${post._id}`}
                          className={styles.likesCountLink}
                        >
                          <div className={styles.postLikesCount}>
                            {(post.likes?.length || 0).toLocaleString()} likes
                          </div>
                        </Link>
                        <div className={styles.postCaption}>
                          <span className={styles.postCaptionUser}>
                            {user.username}
                          </span>
                          <span className={styles.postCaptionText}>
                            {post.caption}
                          </span>
                        </div>
                        <div className={styles.postTime}>
                          {post.createdAt
                            ? formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                              }).toUpperCase()
                            : "JUST NOW"}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        ) : (
          <ShowReel loops={loops} />
        )}
      </div>
      {showDeletePop && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowDeletePop(false);
                  setPostToDeleteId(null);
                }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInfo;
