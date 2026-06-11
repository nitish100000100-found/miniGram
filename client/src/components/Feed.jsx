import Stories from "./Stories.jsx";
import PostCard from "./PostCard.jsx";

import styles from "./Feed.module.css";

function Feed() {
  return (
    <div className={styles.feed}>
      <Stories />

      <PostCard />
      <PostCard />
      <PostCard />

     
    </div>
  );
}

export default Feed;