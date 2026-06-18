import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./FollowRequests.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function FollowRequests() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/interaction/pendingrequests`, {
          withCredentials: true,
        });
        setPendingRequests(res.data.requests || []);
      } catch (err) {
        console.error("Failed to load follow requests:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleAcceptRequest = async (requesterId) => {
    try {
      await axios.post(`${API_URL}/api/interaction/acceptrequest/${requesterId}`, {}, {
        withCredentials: true,
      });
      setPendingRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      console.error("Failed to accept follow request:", err.message);
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await axios.post(`${API_URL}/api/interaction/rejectrequest/${requesterId}`, {}, {
        withCredentials: true,
      });
      setPendingRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      console.error("Failed to reject follow request:", err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} title="Go back">
            <FaArrowLeft />
          </button>
          <h2>Follow Requests</h2>
        </header>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <span>Loading requests...</span>
          </div>
        ) : (
          <div className={styles.content}>
            {pendingRequests.length === 0 ? (
              <div className={styles.emptyContainer}>
                <p>No follow requests received yet.</p>
              </div>
            ) : (
              <div className={styles.requestsList}>
                {pendingRequests.map((req) => (
                  <div key={req._id} className={styles.rowItem}>
                    <Link to={`/lookFor/${req._id}`} className={styles.userInfoLink}>
                      <img
                        src={req.profilePicture || "/insta.webp"}
                        alt={req.username}
                        className={styles.avatar}
                      />
                      <div className={styles.userInfoText}>
                        <span className={styles.username}>{req.username}</span>
                        <span className={styles.name}>{req.name}</span>
                      </div>
                    </Link>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.acceptBtn}
                        onClick={() => handleAcceptRequest(req._id)}
                      >
                        Accept
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleRejectRequest(req._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowRequests;
