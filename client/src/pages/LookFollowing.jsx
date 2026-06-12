import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./LookFollowing.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function LookFollowing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [followingList, setFollowingList] = useState([]);
  const [username, setUsername] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/getFollowing/${id}`, {
          withCredentials: true,
        });
        setFollowingList(res.data.following);
        setUsername(res.data.username);
        setCurrentUserId(res.data.currentUserId);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("This account is private.");
        } else {
          setError("Failed to load following list.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingData();
  }, [id]);

  const handleBack = () => {
    if (currentUserId && id === currentUserId.toString()) {
      navigate("/myInfo");
    } else {
      navigate(`/lookFor/${id}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading following...</p>
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
          <h2>{username ? `@${username}'s following` : "Following"}</h2>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        ) : followingList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Not following anyone yet.</p>
          </div>
        ) : (
          <div className={styles.userList}>
            {followingList.map((user) => {
              const isMe = currentUserId && user._id.toString() === currentUserId.toString();
              return (
                <div key={user._id} className={styles.userRow}>
                  <Link
                    to={isMe ? "/myInfo" : `/lookFor/${user._id}`}
                    className={styles.userProfileLink}
                  >
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
                  <Link
                    to={isMe ? "/myInfo" : `/lookFor/${user._id}`}
                    className={styles.viewBtn}
                  >
                    View
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

export default LookFollowing;
