import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaArrowLeft, FaSyncAlt } from "react-icons/fa";
import styles from "./SuggestedUsers.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function SuggestedUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  
  const isPage = window.location.pathname === "/suggested-users";

  const fetchSuggestedUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/suggested`, {
        withCredentials: true,
      });

      setUsers(res.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const removeSuggestion = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
  };

  const sendRequest = async (userId) => {
    try {
      const targetUser = users.find((u) => u._id === userId);
      const targetUsername = targetUser?.username || "user";
      const isPrivate = targetUser?.isPrivate;

      await axios.post(
        `${API_URL}/api/interaction/followsomeone/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );

      const msg = isPrivate
        ? `Follow request sent to @${targetUsername}`
        : `Started following @${targetUsername}`;

      if (!isPrivate) {
        window.location.reload();
         
        return;
      }
      setNotification(msg);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      setTimeout(() => {
        setNotification(null);
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  return (
    <div className={`${styles.suggestedUsers} ${isPage ? styles.suggestedUsersPage : ""}`}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isPage && (
            <button onClick={() => navigate(-1)} className={styles.backBtn} title="Go back">
              <FaArrowLeft />
            </button>
          )}
          <h3>Suggested Users</h3>
        </div>

        <button className={styles.shuffleBtn} onClick={fetchSuggestedUsers}>
          <FaSyncAlt />
        </button>
      </div>

      <div className={styles.usersList}>
        {users.map((user) => (
          <div key={user._id} className={styles.userCard}>
            <button
              className={styles.closeBtn}
              onClick={() => removeSuggestion(user._id)}
            >
              <FaTimes />
            </button>

            {(() => {
              const activeStory = user.stories?.find((s) => s && s._id);
              const hasAuthorStory = !!activeStory;
              const authorProfileLink = `/lookFor/${user._id}`;
              const authorStoryLink = hasAuthorStory ? `/lookForStory/${activeStory._id}` : authorProfileLink;

              return (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <Link to={authorStoryLink} style={{ display: "flex", flexShrink: 0 }}>
                    <img
                      src={user.profilePicture || "/insta.webp"}
                      alt={user.name}
                      className={`${styles.avatar} ${hasAuthorStory ? styles.avatarWithStory : ""}`}
                    />
                  </Link>
                  <Link to={authorProfileLink} style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
                    <div className={styles.userInfo}>
                      <h4>{user.name}</h4>
                      <p>@{user.username || "user"}</p>
                    </div>
                  </Link>
                </div>
              );
            })()}

            <button
              className={styles.requestBtn}
              onClick={() => sendRequest(user._id)}
            >
              {user?.isPrivate ? "Follow Request" : "Follow"}
            </button>
          </div>
        ))}
      </div>
      {notification && <div className={styles.toast}>{notification}</div>}
    </div>
  );
}

export default SuggestedUsers;
