import LeftSideBar from "./LeftSideBar.jsx";
import Feed from "./Feed.jsx";
import MessagesSideBar from "./MessagesSideBar.jsx";
import styles from "./DesktopLayout.module.css";
import BottomNav from "./BottomNav.jsx";

function DesktopLayout({ unreadCount, unreadMessagesCount }) {
  return (
    <div className={styles.desktopLayout}>
      <LeftSideBar unreadCount={unreadCount} />
      <div className={styles.feedSection}>
        <Feed />
      </div>

      <MessagesSideBar />
      <BottomNav />
    </div>
  );
}

export default DesktopLayout;
