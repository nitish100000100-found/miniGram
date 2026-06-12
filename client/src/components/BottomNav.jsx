import { Link } from "react-router-dom";
import styles from "./BottomNav.module.css";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiFilm,
  FiUser,
} from "react-icons/fi";

function BottomNav() {
  return (
    <div className={styles.bottomNav}>
      <Link to="/" title="Home">
        <FiHome />
      </Link>
      <Link to="/" title="Serach">
        <FiSearch />
      </Link>
      <Link to="/addPost" title="Add Post">
        <FiPlusSquare />
      </Link>
      <FiFilm />
      <Link to="/myInfo" title="Profile">
        <FiUser />
      </Link>
    </div>
  );
}

export default BottomNav;