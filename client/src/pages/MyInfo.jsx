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
} from "react-icons/fa";

import styles from "./MyInfo.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyInfo() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLike = (id) => console.log("Like:", id);
  const handleComment = (post) => console.log("Comment:", post);
  const handleShare = (post) => console.log("Share:", post);
  const handleSave = (id) => console.log("Save:", id);

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

        <Link to="/" className={styles.backBtn}>
          ← Back
        </Link>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.left}>
          <img
            src={user.profilePicture || "/insta.webp"}
            alt={user.name}
            className={styles.avatar}
          />
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
                    <button onClick={() => handleLike(post._id)}>
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

                    <button onClick={() => handleSave(post._id)}>
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