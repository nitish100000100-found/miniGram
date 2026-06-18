import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Stories.module.css";
const LONG_PRESS_DURATION = 600;

const API_URL = import.meta.env.VITE_API_URL;

function Stories() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [myStoryData, setMyStoryData] = useState(null);
  const [followingUsers, setFollowingUsers] = useState([]);
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
        setMyStoryData(storyUsersRes.data.myStory || null);
        setFollowingUsers(storyUsersRes.data.following || []);
      } catch (error) {
        console.error("Error loading stories feed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePressStart = (e) => {
    if (!currentUser) return;
    pressStartTime.current = Date.now();
  };

  const handleTouchMove = () => {
    pressStartTime.current = null;
  };

  const handlePressEnd = (e, hasStory, myStoryId) => {
    if (!currentUser || pressStartTime.current === null) return;

    const pressDuration = Date.now() - pressStartTime.current;
    pressStartTime.current = null;

    if (pressDuration >= LONG_PRESS_DURATION) {
      if (e) {
        if (e.cancelable) e.preventDefault();
      }
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

  const hasMyStory = myStoryData && myStoryData.hasStory;
  const myStoryId = myStoryData ? myStoryData.targetStoryId : null;
  const myAllViewed = myStoryData ? myStoryData.allViewed : true;

  return (
    <div className={styles.storiesContainer}>
      {/* Current User story circle */}
      {currentUser && (
        <div
          className={styles.storyItem}
          onMouseDown={handlePressStart}
          onMouseUp={(e) => handlePressEnd(e, hasMyStory, myStoryId)}
          onTouchStart={handlePressStart}
          onTouchEnd={(e) => handlePressEnd(e, hasMyStory, myStoryId)}
          onTouchMove={handleTouchMove}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className={`${styles.avatarRing} ${hasMyStory && !myAllViewed ? "" : styles.userRing}`}
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
          key={user.userId}
          to={`/lookForStory/${user.targetStoryId}`}
          className={styles.storyItem}
          style={{ textDecoration: "none" }}
        >
          <div className={`${styles.avatarRing} ${user.status === 1 ? "" : styles.userRing}`}>
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
