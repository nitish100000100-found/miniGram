import ChatList from "./ChatList.jsx";
import styles from "./MessageSidebar.module.css";

function MessagesSideBar() {
  return (
    <div className={styles.sidebar}>
      <h3>Messages</h3>

      <input
        className={styles.search}
        placeholder="Search User"
      />

      <ChatList />
    </div>
  );
}

export default MessagesSideBar;