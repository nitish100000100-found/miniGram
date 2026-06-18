import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./BottomNav.module.css";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiFilm,
  FiUser,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

function BottomNav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching user in BottomNav:", error.message);
      }
    };
    fetchCurrentUser();
  }, []);

  const hasStories = user?.hasStory;
  const hasUnviewedStories = hasStories && !user?.allViewed;

  return (
    <div className={styles.bottomNav}>
      <Link to="/" title="Home">
        <FiHome />
      </Link>
      <Link to="/searchUser" title="Search">
        <FiSearch />
      </Link>
      <Link to="/addPost" title="Add Post">
        <FiPlusSquare />
      </Link>
      <Link to="/exploreLoop" title="Explore Reels">
        <FiFilm />
      </Link>
      
      {user ? (
        <Link to="/myInfo" title="Profile">
          {hasStories ? (
            <div className={`${styles.avatarRing} ${hasUnviewedStories ? "" : styles.userRing}`}>
              <img
                src={user.profilePicture || "/insta.webp"}
                alt={user.name}
                className={styles.avatar}
              />
            </div>
          ) : (
            <img
              src={user.profilePicture || "/insta.webp"}
              alt={user.name}
              className={styles.profileImage}
            />
          )}
        </Link>
      ) : (
        <Link to="/myInfo" title="Profile">
          <FiUser />
        </Link>
      )}
    </div>
  );
}

export default BottomNav;