import ProfileCard from "./ProfileCard.jsx";
import SuggestedUsers from "./SuggestedUsers.jsx";
import styles from "./LeftSidebar.module.css";
import { FaRegHeart, FaCompass, FaPlus, FaSearch, FaFilm } from "react-icons/fa";
import { Link } from "react-router-dom";

function LeftSidebar({ unreadCount }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brand}>
            <img src="/favicon-v2.svg" alt="miniGram logo" />
            <h2>MiniGram</h2>
          </div>
        </Link>

        <Link to="/notifications" className={styles.heartLink}>
          <button className={`${styles.heartBtn} ${unreadCount > 0 ? styles.heartGlow : ""}`}>
            <FaRegHeart />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className={styles.navLinks}>
         <ProfileCard />
      
        <Link to="/searchUser" className={styles.navItem}>
          <FaSearch className={styles.navIcon} />
          <span>Search Users</span>
        </Link>
        <Link to="/explorePost" className={styles.navItem}>
          <FaCompass className={styles.navIcon} />
          <span>Explore Posts</span>
        </Link>
        <Link to="/exploreLoop" className={styles.navItem}>
          <FaFilm className={styles.navIcon} />
          <span>Explore Reels</span>
        </Link>
        <Link to="/addPost" className={styles.navItem}>
          <FaPlus className={styles.navIcon} />
          <span>Create Post</span>
        </Link>
      </div>

     

      <SuggestedUsers />
    </div>
  );
}

export default LeftSidebar;
