import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./SeeWhoLiked.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function SeeWhoLiked() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [likesRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/api/interaction/whoLiked/${postId}`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/user/current`, {
            withCredentials: true,
          }),
        ]);
        setUsersList(likesRes.data.users || []);
        setCurrentUser(userRes.data.user);
      } catch (err) {
        console.error("Failed to load likes list:", err);
        if (err.response?.status === 403) {
          setError("You do not have access to view this post.");
        } else {
          setError("Failed to load users who liked this post.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
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
          <button className={styles.backBtn} onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h2>Likes</h2>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No likes yet.</p>
          </div>
        ) : (
          <div className={styles.userList}>
            {usersList.map((user) => {
              const isMe = currentUser && user._id.toString() === currentUser._id.toString();
              const profileLink = isMe ? "/myInfo" : `/lookFor/${user._id}`;
              
              return (
                <div key={user._id} className={styles.userRow}>
                  <Link to={profileLink} className={styles.userProfileLink}>
                    <img
                      src={user.profilePicture || "/insta.webp"}
                      alt={user.username}
                      className={styles.avatar}
                    />
                    <div className={styles.userMeta}>
                      <span className={styles.username}>{user.username}</span>
                      <span className={styles.name}>{user.name || "User"}</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeeWhoLiked;
