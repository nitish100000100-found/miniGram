import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";
import { FaUserSlash } from "react-icons/fa";
import styles from "./BlockedUsers.module.css";

const API_URL = import.meta.env.VITE_API_URL;

const BlockedUsers = () => {
  const navigate = useNavigate();
  const [blockedList, setBlockedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });
        setBlockedList(res.data.user?.blockedUsers || []);
      } catch (err) {
        console.error("Failed to load blocked users:", err);
        setError("Failed to load blocked users.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const triggerConfirmModal = (user) => {
    setTargetUser(user);
    setShowConfirmModal(true);
  };

  const handleUnblock = async () => {
    if (!targetUser) return;
    try {
      await axios.post(
        `${API_URL}/api/interaction/unblock/${targetUser._id}`,
        {},
        { withCredentials: true }
      );
      setBlockedList((prev) => prev.filter((u) => u._id !== targetUser._id));
      setSuccessMessage(`Unblocked @${targetUser.username} successfully!`);
    } catch (err) {
      console.error("Unblock failed:", err);
      setError("Failed to unblock user.");
    } finally {
      setShowConfirmModal(false);
      setTargetUser(null);
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
      <div className={styles.card}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/settings")}
          >
            <IoArrowBack size={24} />
          </button>
          <h2 className={styles.heading}>Blocked Users</h2>
          <div style={{ width: "24px" }} />
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        {successMessage && <div className={styles.successBox}>{successMessage}</div>}

        <div className={styles.content}>
          {blockedList.length === 0 ? (
            <div className={styles.emptyState}>
              <FaUserSlash className={styles.emptyIcon} />
              <p>You haven't blocked anyone.</p>
            </div>
          ) : (
            <div className={styles.userList}>
              {blockedList.map((user) => (
                <div key={user._id} className={styles.userRow}>
                  <div className={styles.userInfo}>
                    <img
                      src={user.profilePicture || "/insta.webp"}
                      alt={user.username}
                      className={styles.avatar}
                    />
                    <span className={styles.username}>{user.username}</span>
                  </div>
                  <button
                    onClick={() => triggerConfirmModal(user)}
                    className={styles.unblockBtn}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && targetUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Unblock User?</h3>
            <p className={styles.modalText}>
              Are you sure you want to unblock @{targetUser.username}?
            </p>
            <div className={styles.modalButtons}>
              <button onClick={handleUnblock} className={styles.modalOkBtn}>
                Unblock
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setTargetUser(null);
                }}
                className={styles.modalCancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
