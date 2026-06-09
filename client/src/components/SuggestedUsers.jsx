import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import styles from "./SuggestedUsers.module.css";
import { FaSyncAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function SuggestedUsers() {
  const [users, setUsers] = useState([]);

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
      await axios.post(
        `${API_URL}/api/user/send-request/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );

      console.log("Request sent");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  return (
    <div className={styles.suggestedUsers}>
      <div className={styles.header}>
        <h3>Suggested Users</h3>

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

            <Link to={`/lookfor/${user._id}`} className={styles.userLink}>
              <img
                src={user.profilePicture || "/insta.webp"}
                alt={user.name}
                className={styles.avatar}
              />

              <div className={styles.userInfo}>
                <h4>{user.name}</h4>
                <p>@{user.username || "user"}</p>
              </div>
            </Link>

            <button
              className={styles.requestBtn}
              onClick={() => sendRequest(user._id)}
            >
             Follow Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestedUsers;
