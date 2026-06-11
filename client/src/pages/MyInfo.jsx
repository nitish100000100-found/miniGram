import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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
} from "react-icons/fa";

import styles from "./MyInfo.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyInfo() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLike = (id,isLiked) => console.log("Like:", id,isLiked);
  const handleComment = (post) => console.log("Comment:", post);
  const handleShare = (post) => console.log("Share:", post);
  const handleSave = (id,isSaved) => console.log("Save:", id,isSaved);

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
            <img
              src={user.profilePicture || "/insta.webp"}
              alt={user.name}
              className={styles.avatar}
            />
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
          <h2>@{user.username}</h2>

          <div className={styles.stats}>
            <div>
              <strong>{user.posts?.length || 0}</strong>
              <span>Posts</span>
            </div>

            <Link to="/followers">
              <strong>{user.followers?.length || 0}</strong>
              <span>Followers</span>
            </Link>

            <Link to="/following">
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
            {user.posts.map((post) => {
              const isLiked = user?.likedPosts?.some(
                (id) => id.toString() === post._id.toString(),
              );

              const isSaved = user?.savedPosts?.some(
                (id) => id.toString() === post._id.toString(),
              );

              return (
                <div key={post._id} className={styles.postCard}>
                  {post.mediaType === "image" ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.caption}
                      className={styles.postImage}
                    />
                  ) : (
                    <video
                      src={post.mediaUrl}
                      className={styles.postImage}
                      muted
                    />
                  )}

                  <div className={styles.overlay}>
                    <button onClick={() => handleLike(post._id,isLiked)}>
                      {isLiked ? <FaHeart /> : <FaRegHeart />}
                      <span>{post.likes?.length || 0}</span>
                    </button>

                    <button onClick={() => handleComment(post)}>
                      <FaComment />
                      <span>{post.comments?.length || 0}</span>
                    </button>

                    <button onClick={() => handleShare(post)}>
                      <FaShare />
                    </button>

                    <button onClick={() => handleSave(post._id,isSaved)}>
                      {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
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