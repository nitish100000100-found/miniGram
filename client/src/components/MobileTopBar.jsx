import { Link } from "react-router-dom";
import styles from "./MobileTopBar.module.css";
import { FaRegHeart } from "react-icons/fa";
import { FiCompass } from "react-icons/fi";
import { BiMessageRounded } from "react-icons/bi";

function MobileTopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.brand}>
        <img src="/favicon-v2.svg" alt="miniGram logo" />
        <h2>miniGram</h2>
      </div>

      <div className={styles.right}>
        <Link to="/explorePost">
          <FiCompass />
        </Link>
        <FaRegHeart />
        <BiMessageRounded />
      </div>
    </div>
  );
}

export default MobileTopBar;