import axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "./ProfileCard.module.css";
import { SocketContext } from "../context/SocketContext.jsx";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
import { Link } from "react-router-dom";

function ProfileCard() {
  const [user, setUser] = useState(null);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });

        setUser(res.data.user);
      } catch (error) {
        console.log(error.response?.data?.message || error.message);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
      socket?.disconnect();
      navigate("/signin");
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const hasStories = user.hasStory;
  const targetStoryId = user.targetStoryId;
  const hasUnviewedStories = hasStories && !user.allViewed;
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileLeft}>
        {hasStories ? (
          <Link to={`/lookForStory/${targetStoryId}`}>
            <div
              className={`${styles.avatarRing} ${hasUnviewedStories ? "" : styles.userRing}`}
            >
              <img
                src={user.profilePicture || "/insta.webp"}
                alt={user.name}
                className={styles.avatar}
              />
            </div>
          </Link>
        ) : (
          <Link to="/myInfo">
            <img
              src={user.profilePicture || "/insta.webp"}
              alt={user.name}
              className={styles.profileImage}
            />
          </Link>
        )}

        <Link to="/myInfo" className={styles.profileLink}>
          <div className={styles.userInfo}>
            <h3>{user.name}</h3>
          </div>
        </Link>
      </div>

      <button onClick={handleLogout} className={styles.logoutBtn}>
        Logout
      </button>
    </div>
  );
}

export default ProfileCard;
