import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import styles from "./Notifications.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize and mark all notifications as read on mount
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Mark as read
        await axios.post(`${API_URL}/api/interaction/notifications/read`, {}, {
          withCredentials: true,
        });

        // Fetch notifications
        const notifRes = await axios.get(`${API_URL}/api/interaction/notifications`, {
          withCredentials: true,
        });
        setNotifications(notifRes.data.notifications || []);

        // Fetch pending follow requests
        const reqsRes = await axios.get(`${API_URL}/api/interaction/pendingrequests`, {
          withCredentials: true,
        });
        setPendingRequests(reqsRes.data.requests || []);
      } catch (err) {
        console.error("Failed to load notifications or pending requests:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();
  }, []);

  const handleAcceptRequest = async (requesterId) => {
    try {
      await axios.post(`${API_URL}/api/interaction/acceptrequest/${requesterId}`, {}, {
        withCredentials: true,
      });
      // Remove from pending requests list
      setPendingRequests((prev) => prev.filter((r) => r._id !== requesterId));
      // Remove or update the follow request notification if present
      setNotifications((prev) =>
        prev.filter((n) => !(n.sender?._id === requesterId && n.type === "follow_request"))
      );
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
      setNotifications((prev) =>
        prev.filter((n) => !(n.sender?._id === requesterId && n.type === "follow_request"))
      );
    } catch (err) {
      console.error("Failed to reject follow request:", err.message);
    }
  };

  const renderNotificationMessage = (notif) => {
    const senderName = notif.sender?.username || "Someone";
    switch (notif.type) {
      case "like":
        return (
          <span>
            <strong>{senderName}</strong> liked your {notif.targetType?.toLowerCase() || "post"}.
          </span>
        );
      case "comment":
        return (
          <span>
            <strong>{senderName}</strong> commented on your {notif.targetType?.toLowerCase() || "post"}.
          </span>
        );
      case "follow":
        return (
          <span>
            <strong>{senderName}</strong> started following you.
          </span>
        );
      case "follow_request":
        return (
          <span>
            <strong>{senderName}</strong> sent you a follow request.
          </span>
        );
      case "request_accepted":
        return (
          <span>
            <strong>{senderName}</strong> accepted your follow request.
          </span>
        );
      default:
        return (
          <span>
            New notification from <strong>{senderName}</strong>.
          </span>
        );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} title="Go back">
            <FaArrowLeft />
          </button>
          <h2>Notifications</h2>
        </header>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <span>Loading notifications...</span>
          </div>
        ) : (
          <div className={styles.content}>
            {/* Wrap follow requests at the top */}
            {pendingRequests.length > 0 ? (
              <Link to="/followRequests" className={styles.followRequestsLink}>
                <div className={styles.followRequestsWrapper}>
                  <div className={styles.followRequestsHeader}>
                    <div className={styles.followRequestsLeft}>
                      <span className={styles.followRequestsTitle}>Follow Requests</span>
                      <span className={styles.requestsBadge}>{pendingRequests.length}</span>
                    </div>
                    <span className={styles.viewAllText}>View All &rsaquo;</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className={styles.followRequestsWrapper} style={{ cursor: "default" }}>
                <div className={styles.followRequestsHeader}>
                  <div className={styles.followRequestsLeft}>
                    <span className={styles.followRequestsTitle}>Follow Requests</span>
                  </div>
                  <span className={styles.noRequestsText}>No pending requests</span>
                </div>
              </div>
            )}

            {/* Recent notifications section */}
            <div className={styles.notificationsWrapper}>
              <div className={styles.sectionTitle}>Recent Notifications</div>
              {notifications.length === 0 ? (
                <div className={styles.emptyText}>No new notifications</div>
              ) : (
                <div className={styles.notificationsList}>
                  {notifications.map((notif) => (
                    <div key={notif._id} className={styles.rowItem}>
                      <div className={styles.notifMainInfo}>
                        <Link to={`/lookFor/${notif.sender?._id}`} className={styles.userInfoLink}>
                          <img
                            src={notif.sender?.profilePicture || "/insta.webp"}
                            alt={notif.sender?.username}
                            className={styles.avatar}
                          />
                          <div className={styles.userInfoText}>
                            <div className={styles.notifMessage}>
                              {renderNotificationMessage(notif)}
                            </div>
                            <span className={styles.timeText}>
                              {notif.createdAt
                                ? formatDistanceToNow(new Date(notif.createdAt), {
                                    addSuffix: true,
                                  })
                                : "just now"}
                            </span>
                          </div>
                        </Link>
                      </div>

                      {notif.type === "follow_request" && (
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => handleAcceptRequest(notif.sender?._id)}
                          >
                            Accept
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleRejectRequest(notif.sender?._id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Right side preview for Post notifications */}
                      {notif.targetType === "Post" && notif.targetId && (
                        <div className={styles.rightPreview}>
                          <Link to={`/commentpage/${notif.targetId._id}`}>
                            {notif.targetId.mediaType === "video" ? (
                              <img
                                src="/videoIcon.png"
                                alt="Video"
                                className={styles.previewImage}
                              />
                            ) : (
                              <img
                                src={notif.targetId.mediaUrl}
                                alt="Post preview"
                                className={styles.previewImage}
                              />
                            )}
                          </Link>
                        </div>
                      )}

                      {/* Right side preview for Loop notifications */}
                      {notif.targetType === "Loop" && notif.targetId && (
                        <div className={styles.rightPreview}>
                          <Link to={`/commentpage/${notif.targetId._id}`}>
                            <img
                              src={notif.targetId.thumbnail || "/reelIcon.png"}
                              alt="Loop preview"
                              className={styles.previewImage}
                            />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
