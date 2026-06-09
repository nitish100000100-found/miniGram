import ProfileCard from "./ProfileCard.jsx";
import SuggestedUsers from "./SuggestedUsers.jsx";
import styles from "./LeftSidebar.module.css";
import { FaRegHeart } from "react-icons/fa";

function LeftSidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <img src="/favicon-v2.svg" alt="miniGram logo" />
          <h2>miniGram</h2>
        </div>

        <button className={styles.heartBtn}>
          <FaRegHeart />
        </button>
      </div>

      <ProfileCard />

      <SuggestedUsers />
    </div>
  );
}

export default LeftSidebar;
