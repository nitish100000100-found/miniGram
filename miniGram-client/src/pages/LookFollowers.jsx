import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./LookFollowers.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function LookFollowers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [followersList, setFollowersList] = useState([]);
  const [username, setUsername] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalTargetUser, setModalTargetUser] = useState(null);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/getFollowers/${id}`, {
          withCredentials: true,
        });
        setFollowersList(res.data.followers);
        setUsername(res.data.username);
        setCurrentUserId(res.data.currentUserId);
        setFollowing(res.data.following || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("This account is private.");
        } else {
          setError("Failed to load followers list.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFollowersData();
  }, [id]);

  const triggerRemoveModal = (targetUser) => {
    setModalTargetUser(targetUser);
    setShowConfirmModal(true);
  };

  const handleRemoveFollower = async () => {
    if (!modalTargetUser) return;
    try {
      await axios.post(`${API_URL}/api/interaction/removefollower/${modalTargetUser._id}`, {}, {
        withCredentials: true,
      });
      setFollowersList((prev) => prev.filter((user) => user._id !== modalTargetUser._id));
    } catch (err) {
      console.error(err);
    } finally {
      setShowConfirmModal(false);
      setModalTargetUser(null);
    }
  };

  const handleFollowToggle = async (targetId, isCurrentlyFollowing) => {
    try {
      const endpoint = isCurrentlyFollowing
        ? `${API_URL}/api/interaction/unfollowsomeone/${targetId}`
        : `${API_URL}/api/interaction/followsomeone/${targetId}`;
      await axios.post(endpoint, {}, { withCredentials: true });
      setFollowing((prev) =>
        isCurrentlyFollowing
          ? prev.filter((fId) => fId.toString() !== targetId.toString())
          : [...prev, targetId]
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading followers...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
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
          <h2>{username ? `@${username}'s followers` : "Followers"}</h2>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        ) : (() => {
          const validFollowers = followersList.filter((u) => u && u._id && u.username);
          return validFollowers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No followers yet.</p>
            </div>
          ) : (
            <div className={styles.userList}>
              {validFollowers.map((user) => {
                const isMe = user._id.toString() === currentUserId?.toString();
                const profileLink = isMe ? "/myInfo" : `/lookFor/${user._id}`;
                const isFollowing = following.some(
                  (fId) => fId.toString() === user._id.toString()
                );

                return (
                  <div key={user._id} className={styles.userRow}>
                    <Link to={profileLink} className={styles.userProfileLink} style={{ flex: "0 0 auto" }}>
                      <img
                        src={user.profilePicture || "/insta.webp"}
                        alt={user.username}
                        className={styles.avatar}
                      />
                    </Link>
                    <Link to={profileLink} className={styles.userProfileLink} style={{ flex: 1, marginLeft: "18px" }}>
                      <div className={styles.userMeta}>
                        <span className={styles.username}>{user.username}</span>
                        <span className={styles.name}>{user.name || "User"}</span>
                      </div>
                    </Link>

                    {isMe ? null : currentUserId && id === currentUserId.toString() ? (
                      <button onClick={() => triggerRemoveModal(user)} className={styles.removeBtn}>
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowToggle(user._id, isFollowing)}
                        className={isFollowing ? styles.unfollowBtn : styles.followBtn}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {showConfirmModal && modalTargetUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Remove follower?</h3>
            <p className={styles.modalText}>
              MiniGram won't tell @{modalTargetUser.username} they were removed from your followers.
            </p>
            <div className={styles.modalButtons}>
              <button onClick={handleRemoveFollower} className={styles.modalOkBtn}>Remove</button>
              <button onClick={() => setShowConfirmModal(false)} className={styles.modalCancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LookFollowers;
