import { useState, useEffect } from "react";
import axios from "axios";
import Stories from "./Stories.jsx";
import PostCard from "./PostCard.jsx";
import styles from "./Feed.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        const postsRes = await axios.get(`${API_URL}/api/post/feed`, {
          withCredentials: true,
        });
        const userRes = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });
        
        setPosts(postsRes.data.posts || []);
        setCurrentUser(userRes.data.user);
      } catch (err) {
        console.error("Failed to load feed data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <Stories />

      {posts.length === 0 ? (
        <div className={styles.emptyFeed}>
          <h2>No Posts in Feed</h2>
          <p>Follow some accounts or explore posts to see updates here!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setPosts={setPosts}
          />
        ))
      )}
    </div>
  );
}

export default Feed;