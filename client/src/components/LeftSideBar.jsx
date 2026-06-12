import ProfileCard from "./ProfileCard.jsx";
import SuggestedUsers from "./SuggestedUsers.jsx";
import styles from "./LeftSidebar.module.css";
import { FaRegHeart, FaCompass, FaHome, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

function LeftSidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brand}>
            <img src="/favicon-v2.svg" alt="miniGram logo" />
            <h2>MiniGram</h2>
          </div>
        </Link>

        <button className={styles.heartBtn}>
          <FaRegHeart />
        </button>
      </div>

      {/* Navigation Links */}
      <div className={styles.navLinks}>
         <ProfileCard />
      
        <Link to="/explorePost" className={styles.navItem}>
          <FaCompass className={styles.navIcon} />
          <span>Explore Posts</span>
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
