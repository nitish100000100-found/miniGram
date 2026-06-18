import { Link } from "react-router-dom";
import styles from "./MobileTopBar.module.css";
import { FaRegHeart } from "react-icons/fa";
import { FiCompass, FiUserPlus } from "react-icons/fi";
import { BiMessageRounded } from "react-icons/bi";

function MobileTopBar({ unreadCount, unreadMessagesCount }) {
  return (
    <div className={styles.topBar}>
      <div className={styles.brand}>
        <img src="/favicon-v2.svg" alt="miniGram logo" />
        <h2>miniGram</h2>
      </div>

      <div className={styles.right}>
        <Link to="/suggested-users" title="Suggested Users">
          <FiUserPlus />
        </Link>
        <Link to="/explorePost" title="Explore">
          <FiCompass />
        </Link>
        <Link to="/notifications" className={styles.heartLink} title="Notifications">
          <FaRegHeart className={unreadCount > 0 ? styles.heartGlow : ""} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </Link>
        <Link to="/messages" className={styles.heartLink} title="Messages">
          <BiMessageRounded />
          {unreadMessagesCount > 0 && <span className={styles.badge}>{unreadMessagesCount}</span>}
        </Link>
      </div>
    </div>
  );
}

export default MobileTopBar;