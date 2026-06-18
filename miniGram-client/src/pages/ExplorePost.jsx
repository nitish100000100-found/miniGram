import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaBookmark,
  FaRegBookmark,
  FaEllipsisH,
  FaArrowLeft,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import styles from "./ExplorePost.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ExplorePost() {
  const navigate = useNavigate();
  const [playId, setPlayId] = useState(null);
  const [muteId, setMuteId] = useState(null);

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



  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heartPopPostId, setHeartPopPostId] = useState(null);
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

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/post/explore`,
          { withCredentials: true }
        );
        setPosts(res.data.posts || []);
        setCurrentUser(res.data.currentUser);
      } catch (err) {
        console.error(err);
        setError("Failed to load explore feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  const handleLike = async (postId, isLiked) => {
    if (!currentUser) return;
    try {
      await axios.post(
        `${API_URL}/api/interaction/like/${postId}`,
        {},
        { withCredentials: true }
      );
     
      setCurrentUser((prev) => {
        const liked = prev.likedPosts || [];
        return {
          ...prev,
          likedPosts: isLiked
            ? liked.filter((id) => id.toString() !== postId.toString())
            : [...liked, postId],
        };
      });
     
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id.toString() === postId.toString()) {
            const likes = post.likes || [];
            return {
              ...post,
              likes: isLiked
                ? likes.filter((id) => id.toString() !== currentUser._id.toString())
                : [...likes, currentUser._id],
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Like interaction failed:", err);
    }
  };

  const handleSave = async (postId, isSaved) => {
    try {
      await axios.post(
        `${API_URL}/api/post/save/${postId}`,
        {},
        { withCredentials: true }
      );
      setCurrentUser((prev) => {
        const saved = prev.savedPosts || [];
        return {
          ...prev,
          savedPosts: isSaved
            ? saved.filter((id) => id.toString() !== postId.toString())
            : [...saved, postId],
        };
      });
    } catch (err) {
      console.error("Save interaction failed:", err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading explore feed...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* TOP HEADER */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/favicon-v2.svg" alt="miniGram" />
          <h1>MiniGram</h1>
        </Link>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            <FaArrowLeft />
          </button>
          <h2>Explore Feed</h2>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyPosts}>
            <h2>No Posts Available</h2>
            <p>Check back later for new content from other users!</p>
          </div>
        ) : (
          <div className={styles.postsList}>
            {posts.map((post) => {
              if (!post.author) return null;

              const isLiked = currentUser?.likedPosts?.some(
                (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
              );
              const isSaved = currentUser?.savedPosts?.some(
                (id) => (id?._id ? id._id.toString() : id?.toString()) === post._id.toString()
              );

              const isMe = post.author._id?.toString() === currentUser?._id?.toString();
              const activeStory = post.author.stories?.find((s) => s && s._id);
              const hasAuthorStory = !!activeStory;
              const authorProfileLink = isMe ? "/myInfo" : `/lookFor/${post.author._id}`;
              const authorStoryLink = hasAuthorStory ? `/lookForStory/${activeStory._id}` : authorProfileLink;

              return (
                <div key={post._id} className={styles.feedPostCard}>
                  {/* Post Header */}
                  <div className={styles.postHeader}>
                    <div className={styles.postAuthorInfo}>
                      <Link to={authorStoryLink}>
                        <img
                          src={post.author.profilePicture || "/insta.webp"}
                          alt={post.author.username}
                          className={`${styles.postAuthorAvatar} ${hasAuthorStory ? styles.avatarWithStory : ""}`}
                        />
                      </Link>
                      <Link to={authorProfileLink} style={{ textDecoration: "none", color: "inherit" }}>
                        <div className={styles.postMeta}>
                          <span className={styles.postUsername}>
                            {post.author.username}
                          </span>
                          {post.location && (
                            <span className={styles.postLocation}>
                              {post.location}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div
                    className={`${styles.postMediaContainer} ${styles.reel}`}
                    onDoubleClick={() => handleDoubleClick(post._id, isLiked)}
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
                          <div className={styles.videoPlayOverlay} onClick={() => handlePlayVideoWithTimer(post._id)}>
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
                          {muteId === post._id ? <FaVolumeUp /> : <FaVolumeMute />}
                        </button>
                      </div>
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
                        className={`${styles.postActionBtn} ${
                          isLiked ? styles.postLiked : ""
                        }`}
                        onClick={() => handleLike(post._id, isLiked)}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <Link to={`/commentpage/${post._id}`} className={styles.postActionBtn}>
                        <FaRegComment />
                        <span className={styles.commentCount}>{post.comments?.length || 0}</span>
                      </Link>
                    </div>

                    <button
                      className={`${styles.postActionBtn} ${
                        isSaved ? styles.postSaved : ""
                      }`}
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
                      <Link
                        to={authorProfileLink}
                        className={styles.postCaptionUser}
                      >
                        {post.author.username}
                      </Link>
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
        )}
      </div>
    </div>
  );
}

export default ExplorePost;
