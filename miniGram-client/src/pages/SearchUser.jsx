import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import styles from "./SearchUser.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function SearchUser() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Debouncing Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search API Call Effect
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${API_URL}/api/interaction/search`,
          { query: debouncedQuery },
          { withCredentials: true }
        );
        setResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleBack = () => navigate(-1);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/favicon-v2.svg" alt="miniGram" />
          <h1>MiniGram</h1>
        </Link>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h2>Search Users</h2>
        </div>

        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Searching...</p>
          </div>
        )}

        {!loading && debouncedQuery.trim() && results.length === 0 && (
          <div className={styles.emptyState}>
            <p>No users found matching "@{debouncedQuery}"</p>
          </div>
        )}

        {!loading && !debouncedQuery.trim() && (
          <div className={styles.emptyState}>
            <p>Start typing to search users...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className={styles.userList}>
            {results.map((user) => {
              const isMe = user._id.toString() === currentUser?._id?.toString();
              const profileLink = isMe ? "/myInfo" : `/lookFor/${user._id}`;

              return (
                <div key={user._id} className={styles.userRow}>
                  <div className={styles.userInfoWrapper}>
                    <Link to={profileLink} className={styles.avatarLink}>
                      <img
                        src={user.profilePicture || "/insta.webp"}
                        alt={user.username}
                        className={styles.avatar}
                      />
                    </Link>
                    <Link to={profileLink} className={styles.userMetaLink}>
                      <div className={styles.userMeta}>
                        <span className={styles.username}>@{user.username}</span>
                        <span className={styles.name}>{user.name || "User"}</span>
                      </div>
                    </Link>
                  </div>
                  <Link to={profileLink} className={styles.viewBtn}>
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchUser;
