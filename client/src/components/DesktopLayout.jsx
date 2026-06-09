import LeftSideBar from "./LeftSideBar.jsx";
import Feed from "./Feed.jsx";
import MessagesSideBar from "./MessagesSideBar.jsx";
import styles from "./DesktopLayout.module.css";
import BottomNav from "./BottomNav.jsx";

function DesktopLayout() {
  return (
    <div className={styles.desktopLayout}>
      <LeftSideBar />
      <div className={styles.feedSection}>
        <Feed />
        <BottomNav />
      </div>
     
      <MessagesSideBar />
    </div>
  );
}

export default DesktopLayout;