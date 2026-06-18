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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalTargetUser, setModalTargetUser] = useState(null);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/getFollowing/${id}`, {
          withCredentials: true,
        });
        setFollowingList(res.data.following);
        setUsername(res.data.username);
        setCurrentUserId(res.data.currentUserId);
        setFollowing(res.data.currentUserFollowing || []);
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

  const triggerUnfollowModal = (targetUser) => {
    setModalTargetUser(targetUser);
    setShowConfirmModal(true);
  };

  const handleUnfollowUser = async () => {
    if (!modalTargetUser) return;
    try {
      await axios.post(`${API_URL}/api/interaction/unfollowsomeone/${modalTargetUser._id}`, {}, {
        withCredentials: true,
      });
      setFollowingList((prev) => prev.filter((user) => user._id !== modalTargetUser._id));
      setFollowing((prev) => prev.filter((fId) => fId.toString() !== modalTargetUser._id.toString()));
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
        <p>Loading following...</p>
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
          <h2>{username ? `@${username}'s following` : "Following"}</h2>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        ) : (() => {
          const validFollowing = followingList.filter((u) => u && u._id && u.username);
          return validFollowing.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Not following anyone yet.</p>
            </div>
          ) : (
            <div className={styles.userList}>
              {validFollowing.map((user) => {
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
                      <button onClick={() => triggerUnfollowModal(user)} className={styles.unfollowBtn}>
                        Unfollow
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
            <h3 className={styles.modalTitle}>
              Unfollow @{modalTargetUser.username}?
            </h3>
            {modalTargetUser.isPrivate && (
              <p className={styles.modalText}>
                If you change your mind, you'll have to request to follow @{modalTargetUser.username} again.
              </p>
            )}
            <div className={styles.modalButtons}>
              <button onClick={handleUnfollowUser} className={styles.modalOkBtn}>Unfollow</button>
              <button onClick={() => setShowConfirmModal(false)} className={styles.modalCancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LookFollowing;
