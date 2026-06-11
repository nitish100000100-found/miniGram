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
      <FiHome />
      <FiSearch />
      <FiPlusSquare />
      <FiFilm />
      <FiUser />
    </div>
  );
}

export default BottomNav;