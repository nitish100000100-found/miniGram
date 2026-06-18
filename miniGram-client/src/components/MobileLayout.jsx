import MobileTopBar from "./MobileTopBar.jsx";
import Feed from "./Feed.jsx";
import BottomNav from "./BottomNav.jsx";
import styles from "./MobileLayout.module.css";

function MobileLayout({ unreadCount, unreadMessagesCount }) {
  return (
    <div className={styles.mobileLayout}>
      <MobileTopBar unreadCount={unreadCount} unreadMessagesCount={unreadMessagesCount} />

      <Feed />

      <BottomNav />
    </div>
  );
}

export default MobileLayout;