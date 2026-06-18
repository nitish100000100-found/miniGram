import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IoClose } from "react-icons/io5";

import { FaEye, FaTrash, FaVolumeMute, FaVolumeUp, FaPlay } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

import styles from "./LookForStory.module.css";
const BaseUrl = import.meta.env.VITE_API_URL;

const LookForStory = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [userRes, storyRes] = await Promise.all([
        axios.get(`${BaseUrl}/api/user/current`, { withCredentials: true }),
        axios.get(`${BaseUrl}/api/story/oneStory/${storyId}`, { withCredentials: true }),
      ]);

      const user = userRes.data.user;
      const story = storyRes.data.story;

      setCurrentUser(user);
      setCurrentStory(story);

      const storiesRes = await axios.get(
        `${BaseUrl}/api/story/allStories/${story.author._id}`,
        { withCredentials: true }
      );

      const stories = storiesRes.data.stories;
      setAllStories(stories);

      const idx = stories.findIndex((s) => s._id === story._id);
      setCurrentIndex(idx);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [storyId]);

  const handleNext = async () => {
    if (currentIndex >= allStories.length - 1) {
      navigate(-1);
      return;
    }
    try {
      const nextIndex = currentIndex + 1;
      const nextStoryId = allStories[nextIndex]._id;
      const res = await axios.get(
        `${BaseUrl}/api/story/oneStory/${nextStoryId}`,
        { withCredentials: true }
      );
      setCurrentStory(res.data.story);
      setCurrentIndex(nextIndex);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrev = async () => {
    if (currentIndex <= 0) {
      navigate(-1);
      return;
    }
    try {
      const prevIndex = currentIndex - 1;
      const prevStoryId = allStories[prevIndex]._id;
      const res = await axios.get(
        `${BaseUrl}/api/story/oneStory/${prevStoryId}`,
        { withCredentials: true }
      );
      setCurrentStory(res.data.story);
      setCurrentIndex(prevIndex);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTap = (e) => {
    if (showViewers || showConfirmDelete) return;
    if (e.target.closest("button, a")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;
    if (x < half) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleDelete = async () => {
    setShowConfirmDelete(false);
    try {
      setIsDeleting(true);
      await axios.post(
        `${BaseUrl}/api/story/deleteStory/${currentStory._id}`,
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.log(error);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading story...</span>
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Deleting story...</span>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className={styles.loading}>
        <span>Story not found</span>
      </div>
    );
  }

  const isOwner = currentUser?._id === currentStory?.author?._id;

  return (
    <div className={styles.container} onClick={handleTap}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <Link
          to={isOwner ? "/myInfo" : `/lookFor/${currentStory.author._id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className={styles.userInfo}>
            <img
              src={currentStory.author?.profilePicture || "/insta.webp"}
              alt=""
              className={styles.avatar}
            />
            <span>{currentStory.author?.username}</span>
          </div>
        </Link>

        <div className={styles.actions}>
          {isOwner && (
            <>
              <button
                onClick={() => navigate(`/addhighlight/${currentStory._id}`)}
                className={styles.actionBtnWithLabel}
                title="Add to Highlight"
              >
                <FiStar />
                <span className={styles.btnLabel}>Highlight</span>
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className={styles.actionBtnWithLabel}
                title="Delete Story"
              >
                <FaTrash />
                <span className={styles.btnLabel}>Delete</span>
              </button>
            </>
          )}

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

      {/* OWNER CONTROLS */}
      {isOwner && (
        <button className={styles.viewsBtn} onClick={() => setShowViewers(true)}>
          <FaEye />
          <span>
            {(() => {
              const hasOwnerViewed = (currentStory.viewedBy || []).some(
                (u) => (u._id || u).toString() === currentUser?._id?.toString()
              );
              return Math.max(
                0,
                (currentStory.viewedBy?.length || 0) - (hasOwnerViewed ? 1 : 0)
              );
            })()}
          </span>
        </button>
      )}

      {/* STORY COUNTER */}
      <span className={styles.storyCounter}>
        {currentIndex + 1} / {allStories.length}
      </span>

      {/* VIEWERS SHEET */}
      {showViewers && (
        <div className={styles.viewersSheet}>
          <div className={styles.viewersHeader}>
            <h3>Story Views</h3>
            <button onClick={() => setShowViewers(false)}>
              <IoClose />
            </button>
          </div>
          <div className={styles.viewersList}>
            {!currentStory.viewedBy || currentStory.viewedBy.length === 0 ? (
              <p>No views yet</p>
            ) : (
              currentStory.viewedBy.map((user) => {
                if (user._id?.toString() === currentUser?._id?.toString()) return null;
                return (
                  <Link key={user._id} to={`/lookFor/${user._id}`} className={styles.viewerItem}>
                    <img src={user.profilePicture || "/insta.webp"} alt="" />
                    <span>{user.username}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showConfirmDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this story?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookForStory;