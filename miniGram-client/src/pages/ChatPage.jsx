import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { SocketContext } from "../context/SocketContext.jsx";
import { IoArrowBack } from "react-icons/io5";
import { FaRegImage, FaPaperPlane, FaInfoCircle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import styles from "./ChatPage.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { socket, onlineUsers } = useContext(SocketContext);


  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageToDeleteId, setMessageToDeleteId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);


  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const longPressTimeout = useRef(null);

  const isOnline = onlineUsers?.includes(userId);

  
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        const [meRes, otherRes, messagesRes] = await Promise.all([
          axios.get(`${API_URL}/api/user/current`, { withCredentials: true }),
          axios.get(`${API_URL}/api/user/lookFor/${userId}`, { withCredentials: true }),
          axios.get(`${API_URL}/api/message/getMessages/${userId}`, { withCredentials: true }),
        ]);

        setCurrentUser(meRes.data.user);
        setOtherUser(otherRes.data);
        setMessages(messagesRes.data.messages || []);
      } catch (err) {
        console.error("Failed to load chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchChatData();
    }
  }, [userId]);

  
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.senderId === userId || message.receiverId === userId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, userId]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedMedia(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
    setInputText(""); 
  };

  const clearSelectedMedia = () => {
    setSelectedMedia(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedMedia) return;

    try {
      const formData = new FormData();
      if (selectedMedia) {
        formData.append("media", selectedMedia);
      } else if (inputText.trim()) {
        formData.append("message", inputText.trim());
      }

      const res = await axios.post(
        `${API_URL}/api/message/sendMessage/${userId}`,
        formData,
        {
          withCredentials: true,
        }
      );

      setMessages((prev) => [...prev, res.data.newMessage]);
      setInputText("");
      clearSelectedMedia();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };


  const handleDeleteMessage = (messageId) => {
    setMessageToDeleteId(messageId);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDeleteId) return;
    try {
      await axios.delete(`${API_URL}/api/message/unsendMessage/${messageToDeleteId}`, {
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((m) => m._id !== messageToDeleteId));
    } catch (err) {
      console.error("Failed to delete message:", err);
      
    } finally {
      setMessageToDeleteId(null);
    }
  };

  
  const startLongPress = (messageId, senderId) => {
  
    if (currentUser && senderId !== currentUser._id) return;

    longPressTimeout.current = setTimeout(() => {
      handleDeleteMessage(messageId);
    }, 600); 
  };

  const cancelLongPress = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };

  
  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = async () => {
    try {
      await axios.delete(`${API_URL}/api/message/clearChat/${userId}`, {
        withCredentials: true,
      });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    
    } finally {
      setShowClearConfirm(false);
    }
  };

  
  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className={styles.page} style={{ justifyContent: "center", alignItems: "center" }}>
        <ClipLoader size={45} color="#a855f7" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate("/messages")}>
            <IoArrowBack />
          </button>
          {otherUser && (
            <Link to={`/lookFor/${otherUser._id}`} className={styles.userInfo}>
              <div className={styles.avatarWrapper}>
                <img
                  src={otherUser.profilePicture || "/insta.webp"}
                  alt={otherUser.username}
                  className={styles.avatar}
                />
                <div className={isOnline ? styles.onlineBadge : styles.offlineBadge} />
              </div>
              <div className={styles.userDetails}>
                <span className={styles.name}>
                  {otherUser.name || "miniGram User"}{" "}
                  <span className={styles.username}>@{otherUser.username}</span>
                </span>
                <span className={`${styles.status} ${isOnline ? styles.online : ""}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </Link>
          )}
        </div>
        <button className={styles.clearBtn} onClick={handleClearChat}>
          Clear Chat
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className={styles.chatArea}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <FaInfoCircle size={20} />
            <span className={styles.noMessagesText}>No messages yet.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = currentUser && msg.senderId === currentUser._id;
            return (
              <div
                key={msg._id}
                className={`${styles.messageRow} ${isMe ? styles.me : styles.other}`}
              >
                <div
                  className={styles.messageBubble}
                  onTouchStart={() => startLongPress(msg._id, msg.senderId)}
                  onTouchEnd={cancelLongPress}
                  onMouseDown={() => startLongPress(msg._id, msg.senderId)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                >
                  {/* Media Content */}
                  {msg.image && (
                    <div className={styles.mediaMessage}>
                      <img src={msg.image} alt="Media" className={styles.messageImage} />
                      {msg.message && <div className={styles.mediaCaption}>{msg.message}</div>}
                    </div>
                  )}

                  {msg.video && (
                    <div className={styles.mediaMessage}>
                      <video src={msg.video} controls className={styles.messageVideo} />
                      {msg.message && <div className={styles.mediaCaption}>{msg.message}</div>}
                    </div>
                  )}

                  {/* Text Content */}
                  {!msg.image && !msg.video && msg.message}

                  <span className={styles.messageTime}>{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Upload Preview */}
      {selectedMedia && (
        <div className={styles.previewContainer}>
          <div className={styles.mediaPreviewWrapper}>
            {selectedMedia.type.startsWith("video") ? (
              <video src={mediaPreviewUrl} className={styles.mediaPreview} muted />
            ) : (
              <img src={mediaPreviewUrl} alt="Preview" className={styles.mediaPreview} />
            )}
            <button className={styles.closePreviewBtn} onClick={clearSelectedMedia}>
              ✕
            </button>
          </div>
          <div className={styles.previewInfo}>
            <span className={styles.previewName}>{selectedMedia.name}</span>
            <span className={styles.previewSize}>
              {(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </div>
      )}

      {/* Message Input Footer */}
      <form className={styles.inputBar} onSubmit={handleSendMessage}>
        <label className={styles.mediaInputLabel} htmlFor="media-upload">
          <FaRegImage />
        </label>
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleMediaChange}
          ref={fileInputRef}
        />

        <input
          type="text"
          placeholder={selectedMedia ? "Media selected. Click send or close preview..." : "Message..."}
          className={styles.textInput}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!!selectedMedia}
        />

        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!inputText.trim() && !selectedMedia}
        >
          <FaPaperPlane />
        </button>
      </form>

      {/* Delete Message Confirmation Modal */}
      {messageToDeleteId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalTitle}>Delete Message?</div>
            <div className={styles.modalDesc}>
              This will permanently delete this message for you. Are you sure?
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.modalBtn} ${styles.confirmDeleteBtn}`}
                onClick={confirmDeleteMessage}
              >
                Delete
              </button>
              <button
                className={`${styles.modalBtn} ${styles.cancelBtn}`}
                onClick={() => setMessageToDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalTitle}>Clear Chat?</div>
            <div className={styles.modalDesc}>
              This will permanently clear all messages in this conversation. Are you sure?
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.modalBtn} ${styles.confirmDeleteBtn}`}
                onClick={confirmClearChat}
              >
                Clear
              </button>
              <button
                className={`${styles.modalBtn} ${styles.cancelBtn}`}
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
