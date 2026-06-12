import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Stories.module.css";
const LONG_PRESS_DURATION = 600;

const API_URL = import.meta.env.VITE_API_URL;

function Stories() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [storyUsers, setStoryUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const pressStartTime = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, storyUsersRes] = await Promise.all([
          axios.get(`${API_URL}/api/user/current`, { withCredentials: true }),
          axios.get(`${API_URL}/api/user/otherUsersWithStory`, {
            withCredentials: true,
          }),
        ]);
        setCurrentUser(userRes.data.user);
        setStoryUsers(storyUsersRes.data || []);
      } catch (error) {
        console.error("Error loading stories feed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePressStart = () => {
    if (!currentUser) return;
    pressStartTime.current = Date.now();
  };

  const handlePressEnd = (hasStory, myStoryId) => {
    if (!currentUser || pressStartTime.current === null) return;

    const pressDuration = Date.now() - pressStartTime.current;
    pressStartTime.current = null;

    if (pressDuration >= LONG_PRESS_DURATION) {
      navigate(`/addStory/${currentUser._id}`);
    } else {
      if (hasStory) {
        navigate(`/lookForStory/${myStoryId}`);
      } else {
        navigate(`/addStory/${currentUser._id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.storiesContainer}>
        <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px" }}>
          Loading stories...
        </span>
      </div>
    );
  }

  const myStoryData = storyUsers[0];
  const hasMyStory =
    myStoryData &&
    typeof myStoryData === "object" &&
    myStoryData.hasStory === 1;
  const myStoryId = hasMyStory ? myStoryData.storyId : null;
  const followingUsers = storyUsers.slice(1);

  return (
    <div className={styles.storiesContainer}>
      {/* Current User story circle */}
      {currentUser && (
        <div
          className={styles.storyItem}
          onMouseDown={handlePressStart}
          onMouseUp={() => handlePressEnd(hasMyStory, myStoryId)}
          onTouchStart={handlePressStart}
          onTouchEnd={() => handlePressEnd(hasMyStory, myStoryId)}
        >
          <div
            className={`${styles.avatarRing} ${hasMyStory ? styles.unviewedRing : styles.userRing}`}
          >
            <img
              src={currentUser.profilePicture || "/insta.webp"}
              alt="Your Story"
              className={styles.avatar}
            />
            {!hasMyStory && <span className={styles.plusIcon}>+</span>}
          </div>
          <span className={styles.username}>Your Story</span>
        </div>
      )}

      {/* Following users story circles */}
      {followingUsers.map((user) => (
        <Link
          key={user._id}
          to={`/lookForStory/${user.storyId}`}
          className={styles.storyItem}
          style={{ textDecoration: "none" }}
        >
          <div className={`${styles.avatarRing} ${styles.unviewedRing}`}>
            <img
              src={user.profilePicture || "/insta.webp"}
              alt={user.username}
              className={styles.avatar}
            />
          </div>
          <span className={styles.username}>{user.username}</span>
        </Link>
      ))}
    </div>
  );
}

export default Stories;
