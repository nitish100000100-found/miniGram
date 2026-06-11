import MobileTopBar from "./MobileTopBar.jsx";
import Feed from "./Feed.jsx";
import BottomNav from "./BottomNav.jsx";
import styles from "./MobileLayout.module.css";





function MobileLayout() {
  return (
    <div className={styles.mobileLayout}>
      <MobileTopBar />

      <Feed />

      <BottomNav />
    </div>
  );
}

export default MobileLayout;