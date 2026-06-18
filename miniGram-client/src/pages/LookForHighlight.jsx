import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IoClose } from "react-icons/io5";
import { FaTrash, FaEdit, FaImage, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

import styles from "./LookForHighlight.module.css";
const BaseUrl = import.meta.env.VITE_API_URL;

const LookForHighlight = () => {
  const { highlightId, storyId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [userRes, highlightRes] = await Promise.all([
        axios.get(`${BaseUrl}/api/user/current`, { withCredentials: true }),
        axios.get(`${BaseUrl}/api/highlight/oneHighlight/${highlightId}`, { withCredentials: true }),
      ]);

      setCurrentUser(userRes.data.user);
      const fetchedHighlight = highlightRes.data.highlight;
      setHighlight(fetchedHighlight);
      setNewTitle(fetchedHighlight.title);

      if (fetchedHighlight?.stories) {
        const idx = fetchedHighlight.stories.findIndex((s) => s._id === storyId);
        setCurrentIndex(idx !== -1 ? idx : 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [highlightId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleNext = () => {
    if (!highlight) return;
    if (currentIndex >= highlight.stories.length - 1) {
      navigate(-1);
      return;
    }
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (!highlight) return;
    if (currentIndex <= 0) {
      navigate(-1);
      return;
    }
    setCurrentIndex(currentIndex - 1);
  };

  const handleTap = (e) => {
    if (activeModal) return;
    if (e.target.closest("button, a, input, form")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleDeleteStory = async () => {
    setActiveModal(null);
    if (!highlight || !highlight.stories[currentIndex]) return;
    const storyIdInHighlight = highlight.stories[currentIndex]._id;
    try {
      setIsProcessing(true);
      await axios.post(
        `${BaseUrl}/api/highlight/${highlightId}/story/${storyIdInHighlight}`,
        {},
        { withCredentials: true }
      );
      navigate("/myInfo");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteHighlight = async () => {
    setActiveModal(null);
    try {
      setIsProcessing(true);
      await axios.post(
        `${BaseUrl}/api/highlight/${highlightId}`,
        {},
        { withCredentials: true }
      );
      navigate("/myInfo");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenameHighlight = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setActiveModal(null);
    try {
      setIsProcessing(true);
      await axios.post(
        `${BaseUrl}/api/highlight/${highlightId}/rename`,
        { title: newTitle.trim() },
        { withCredentials: true }
      );
      setHighlight((prev) => ({ ...prev, title: newTitle.trim() }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const coverInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedCoverFile(file);
    setActiveModal("cover");
  };

  const handleCoverSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCoverFile) return;
    setActiveModal(null);
    const formData = new FormData();
    formData.append("coverImage", selectedCoverFile);
    try {
      setIsProcessing(true);
      await axios.post(
        `${BaseUrl}/api/highlight/${highlightId}/update-cover`,
        formData,
        { withCredentials: true }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveCover = async () => {
    setActiveModal(null);
    try {
      setIsProcessing(true);
      await axios.post(
        `${BaseUrl}/api/highlight/${highlightId}/remove-cover`,
        {},
        { withCredentials: true }
      );
      setHighlight((prev) => ({ ...prev, coverImage: null }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading highlight...</span>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Processing request...</span>
      </div>
    );
  }

  if (!highlight || !highlight.stories || highlight.stories.length === 0) {
    return (
      <div className={styles.loading}>
        <span>Highlight not found or has no stories</span>
      </div>
    );
  }

  const currentStory = highlight.stories[currentIndex];
  const isOwner = currentUser?._id === highlight.author?._id;

  return (
    <div className={styles.container} onClick={handleTap}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <Link
          to={isOwner ? "/myInfo" : `/lookFor/${highlight.author._id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className={styles.userInfo}>
            <img
              src={highlight.author?.profilePicture || "/insta.webp"}
              alt=""
              className={styles.avatar}
            />
            <div className={styles.usernameWrapper}>
              <span className={styles.username}>{highlight.author?.username}</span>
              <span className={styles.highlightTitle}>{highlight.title}</span>
            </div>
          </div>
        </Link>
        <div className={styles.actions}>
          {currentStory?.mediaType === "video" && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={styles.muteBtn}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          )}
          <button onClick={() => navigate(-1)} className={styles.actionBtnWithLabel}>
            <IoClose />
            <span className={styles.btnLabel}>Close</span>
          </button>
        </div>
      </div>

      {/* STORY COUNTER */}
      <span className={styles.storyCounter}>
        {currentIndex + 1} / {highlight.stories.length}
      </span>

      {/* BOTTOM ACTIONS (OWNER) */}
      {isOwner && (
        <div className={styles.bottomActions}>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <button
            onClick={() => coverInputRef.current.click()}
            className={styles.actionBtnWithLabel}
            title="Change Cover Image"
          >
            <FaImage />
            <span className={styles.btnLabel}>Change Cover</span>
          </button>
          <button
            onClick={() => setActiveModal("removeCover")}
            className={styles.actionBtnWithLabel}
          >
            <FaTrash />
            <span className={styles.btnLabel}>Remove Cover</span>
          </button>
          <button
            onClick={() => setActiveModal("rename")}
            className={styles.actionBtnWithLabel}
          >
            <FaEdit />
            <span className={styles.btnLabel}>Rename</span>
          </button>
          <button
            onClick={() => setActiveModal("deleteStory")}
            className={styles.actionBtnWithLabel}
          >
            <FaTrash style={{ color: "#ef4444" }} />
            <span className={styles.btnLabel}>Remove Story</span>
          </button>
          <button
            onClick={() => setActiveModal("deleteHighlight")}
            className={styles.actionBtnWithLabel}
          >
            <FaTrash style={{ color: "#ef4444" }} />
            <span className={styles.btnLabel}>Delete This Whole Highlight</span>
          </button>
        </div>
      )}

      {/* MEDIA */}
      <div className={styles.storyWrapper}>
        {currentStory.mediaType === "image" ? (
          <img src={currentStory.mediaUrl} alt="" className={styles.storyMedia} />
        ) : (
          <div className={styles.videoWrapper}>
            <video
              src={currentStory.mediaUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className={styles.storyMedia}
            />
          </div>
        )}
      </div>

      {/* CONFIRM DELETE STORY MODAL */}
      {activeModal === "deleteStory" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Remove Story</h3>
            <p>Are you sure you want to remove this story from the highlight?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDeleteStory}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE HIGHLIGHT MODAL */}
      {activeModal === "deleteHighlight" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Highlight</h3>
            <p>Are you sure you want to delete this highlight and all of its story references?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDeleteHighlight}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME HIGHLIGHT MODAL */}
      {activeModal === "rename" && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleRenameHighlight} className={styles.modal}>
            <h3>Rename Highlight</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={styles.renameInput}
              placeholder="Enter highlight name"
              required
              autoFocus
            />
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className={styles.renameConfirmBtn}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* CHANGE COVER MODAL */}
      {activeModal === "cover" && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleCoverSubmit} className={styles.modal}>
            <h3>Change Cover</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "16px" }}>
              Are you sure you want to change the highlight cover?
            </p>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Cover Preview"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  margin: "0 auto 20px",
                  display: "block",
                  border: "2px solid #a855f7",
                }}
              />
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setActiveModal(null);
                  setSelectedCoverFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.renameConfirmBtn}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* REMOVE COVER MODAL */}
      {activeModal === "removeCover" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Remove Cover</h3>
            <p>Are you sure you want to remove the cover photo from this highlight?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={handleRemoveCover}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookForHighlight;