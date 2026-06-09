import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./ProfileCard.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ProfileCard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/user/current`,
          {
            withCredentials: true,
          }
        );
      


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
        }
      );

      window.location.reload();
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
  <div className={styles.profileCard}>
    <img
      src={user.profilePicture || "/insta.webp"}
      alt={user.name}
      className={styles.profileImage}
    />

    <div className={styles.userInfo}>
      <h3>{user.name}</h3>
      <p>@{user.username}</p>
    </div>

    <button
      onClick={handleLogout}
      className={styles.logoutBtn}
    >
      Logout
    </button>
  </div>
);
}

export default ProfileCard;