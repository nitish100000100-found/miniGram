import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import styles from "./ShowOneLoop.module.css";

const API_URL = import.meta.env.VITE_API_URL;

const ShowOneLoop = () => {
  const { loopId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [allLoops, setAllLoops] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const clickTimer = useRef(null);

  const touchStartY = useRef(0);
  const SWIPE_THRESHOLD = 50;

  // Derived state properties
  const currentLoop = allLoops?.[currentIndex] || null;
  const liked =
    currentLoop?.likes?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === currentUser?._id?.toString(),
    ) || false;
  const likesCount = currentLoop?.likes?.length || 0;
  const saved =
    currentUser?.savedLoops?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === currentLoop?._id?.toString(),
    ) || false;
  const authorId = currentLoop?.author?._id?.toString();
  const isFollowing =
    currentUser?.following?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === authorId,
    ) || false;
  const isRequested =
    currentUser?.sendRequest?.some(
      (id) => (id?._id ? id._id.toString() : id?.toString()) === authorId,
    ) || false;

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    // Swipe Up -> Next loop
    if (deltaY > SWIPE_THRESHOLD) {
      handleNext();
    }

    // Swipe Down -> Previous loop
    if (deltaY < -SWIPE_THRESHOLD) {
      handlePrev();
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [userRes, loopRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/current`, { withCredentials: true }),
        axios.get(`${API_URL}/api/loop/${loopId}`, { withCredentials: true }),
      ]);

      const user = userRes.data.user;
      const initialLoop = loopRes.data.loop;

      setCurrentUser(user);

      if (!initialLoop) {
        setAllLoops([]);
        return;
      }

      if (!initialLoop.author?._id) {
        setAllLoops([initialLoop]);
        setCurrentIndex(0);
        return;
      }

      // Fetch all loops of the loop author
      const loopsRes = await axios.get(
        `${API_URL}/api/loop/user/${initialLoop.author._id}`,
        { withCredentials: true },
      );
      const loops = loopsRes.data.loops || [];

      const idx = loops.findIndex(
        (l) => l._id.toString() === initialLoop._id.toString(),
      );
      if (idx !== -1) {
        loops[idx] = initialLoop;
        setCurrentIndex(idx);
      } else {
        loops.unshift(initialLoop);
        setCurrentIndex(0);
      }
      setAllLoops(loops);
    } catch (error) {
      console.error("Failed to load initial loop data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const foundIndex = allLoops.findIndex((l) => l._id.toString() === loopId);
    if (foundIndex === -1) {
      fetchInitialData();
    }
  }, [loopId]);

  useEffect(() => {
    if (videoRef.current && currentLoop) {
      videoRef.current.load();
    }
  }, [currentIndex, currentLoop]);

  useEffect(() => {
    const fetchCurrentLoopDetails = async () => {
      if (!currentLoop || currentLoop.mediaUrl) return;
      try {
        const res = await axios.get(`${API_URL}/api/loop/${currentLoop._id}`, {
          withCredentials: true,
        });
        const fullLoop = res.data.loop;
        if (fullLoop) {
          setAllLoops((prev) => {
            const updated = [...prev];
            if (updated[currentIndex]?._id === fullLoop._id) {
              updated[currentIndex] = fullLoop;
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to load details for loop:", err);
      }
    };
    fetchCurrentLoopDetails();
  }, [currentIndex, currentLoop]);

  const handleNext = () => {
    if (currentIndex >= allLoops.length - 1) return;
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex(currentIndex - 1);
  };

  const wheelCooldown = useRef(false);
  const handleWheel = (e) => {
    if (wheelCooldown.current) return;
    if (Math.abs(e.deltaY) < 30) return;

    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }

    wheelCooldown.current = true;
    setTimeout(() => {
      wheelCooldown.current = false;
    }, 800);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, allLoops.length]);

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!currentLoop || !currentUser) return;

    // Optimistically toggle liked status in allLoops list
    const alreadyLiked = currentLoop.likes?.some(
      (id) => id.toString() === currentUser._id.toString(),
    );
    const updatedLikes = alreadyLiked
      ? currentLoop.likes.filter(
          (id) => id.toString() !== currentUser._id.toString(),
        )
      : [...(currentLoop.likes || []), currentUser._id];

    setAllLoops((prev) =>
      prev.map((l, idx) =>
        idx === currentIndex ? { ...l, likes: updatedLikes } : l,
      ),
    );

    try {
      await axios.post(
        `${API_URL}/api/loop/like/${currentLoop._id}`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to like loop:", err);
      // Revert on failure
      setAllLoops((prev) =>
        prev.map((l, idx) =>
          idx === currentIndex ? { ...l, likes: currentLoop.likes } : l,
        ),
      );
    }
  };

  const handleSave = async (e) => {
    if (e) e.stopPropagation();
    if (!currentLoop || !currentUser) return;

    // Optimistically toggle saved status in currentUser
    const alreadySaved = currentUser.savedLoops?.some(
      (id) => id.toString() === currentLoop._id.toString(),
    );
    const updatedSavedLoops = alreadySaved
      ? currentUser.savedLoops.filter(
          (id) => id.toString() !== currentLoop._id.toString(),
        )
      : [...(currentUser.savedLoops || []), currentLoop._id];

    setCurrentUser((prev) => ({
      ...prev,
      savedLoops: updatedSavedLoops,
    }));

    try {
      await axios.post(
        `${API_URL}/api/loop/save/${currentLoop._id}`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to save loop:", err);
      // Revert on failure
      setCurrentUser((prev) => ({
        ...prev,
        savedLoops: currentUser.savedLoops,
      }));
    }
  };

  const handleDelete = async () => {
    setShowConfirmDelete(false);
    try {
      setIsDeleting(true);
      await axios.post(
        `${API_URL}/api/loop/delete/${currentLoop._id}`,
        {},
        { withCredentials: true },
      );
      navigate("/myInfo");
    } catch (error) {
      console.error("Failed to delete loop:", error);
      setIsDeleting(false);
    }
  };

  const handleFollowToggle = async (e) => {
    if (e) e.stopPropagation();
    if (!currentLoop?.author?._id || !currentUser?._id) return;
    const authorId = currentLoop.author._id.toString();

    try {
      if (isFollowing) {
        await axios.post(
          `${API_URL}/api/interaction/unfollowsomeone/${authorId}`,
          { fromUserId: currentUser._id },
          { withCredentials: true }
        );
        setCurrentUser((prev) => ({
          ...prev,
          following: (prev.following || []).filter(
            (id) => (id?._id ? id._id.toString() : id?.toString()) !== authorId
          ),
        }));
      } else if (isRequested) {
        await axios.post(
          `${API_URL}/api/interaction/cancelsendrequest/${authorId}`,
          { fromUserId: currentUser._id },
          { withCredentials: true }
        );
        setCurrentUser((prev) => ({
          ...prev,
          sendRequest: (prev.sendRequest || []).filter(
            (id) => (id?._id ? id._id.toString() : id?.toString()) !== authorId
          ),
        }));
      } else {
        const res = await axios.post(
          `${API_URL}/api/interaction/followsomeone/${authorId}`,
          { fromUserId: currentUser._id },
          { withCredentials: true }
        );
        if (res.data.followed) {
          setCurrentUser((prev) => ({
            ...prev,
            following: [...(prev.following || []), authorId],
          }));
        } else {
          setCurrentUser((prev) => ({
            ...prev,
            sendRequest: [...(prev.sendRequest || []), authorId],
          }));
        }
      }
    } catch (err) {
      console.error("Failed to toggle follow status:", err);
    }
  };

  const handleDoubleClickLike = () => {
    setShowHeartPop(true);
    setTimeout(() => {
      setShowHeartPop(false);
    }, 800);

    const alreadyLiked = currentLoop?.likes?.some(
      (id) => id.toString() === currentUser?._id?.toString(),
    );
    if (!alreadyLiked) {
      handleLike();
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      handleDoubleClickLike();
    } else {
      clickTimer.current = setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          if (video.paused) {
            video.play().catch(() => {});
            setIsPaused(false);
          } else {
            video.pause();
            setIsPaused(true);
          }
        }
        clickTimer.current = null;
      }, 250);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading loop...</span>
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Deleting loop...</span>
      </div>
    );
  }

  if (!currentLoop) {
    return (
      <div className={styles.loading}>
        <span>Loop not found</span>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          Go Back
        </button>
      </div>
    );
  }

  const isOwner = currentUser?._id?.toString() === currentLoop?.author?._id?.toString();

  return (
    <div
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Background Close Click Zone */}
      <div className={styles.closeZone} onClick={() => navigate(-1)} />

      {/* Desktop Navigation Controls */}
      <div className={styles.navControls}>
        <button
          onClick={handlePrev}
          className={styles.navBtn}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
          title="Previous Loop"
        >
          <FaChevronUp />
        </button>
        <button
          onClick={handleNext}
          className={styles.navBtn}
          disabled={currentIndex === allLoops.length - 1}
          style={{ opacity: currentIndex === allLoops.length - 1 ? 0.3 : 1 }}
          title="Next Loop"
        >
          <FaChevronDown />
        </button>
      </div>

      {/* PLAYER COMPONENT */}
      <div className={styles.playerWrapper}>
        <div className={styles.videoContainer}>
          {/* CLOSE BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className={styles.closeBtn}
            title="Close"
          >
            <IoClose />
          </button>
          <video
            ref={videoRef}
            src={currentLoop.mediaUrl}
            className={styles.videoMedia}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            onClick={handleVideoClick}
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
          />

          {isPaused && (
            <div className={styles.videoPlayOverlay} onClick={handleVideoClick}>
              <FaPlay size={20} />
            </div>
          )}

          {showHeartPop && (
            <div className={styles.heartOverlay}>
              <FaHeart className={styles.popHeartIcon} size={80} />
            </div>
          )}

          {/* Bottom Overlay Details inside the player */}
          <div className={styles.bottomMeta}>
            <div className={styles.authorSection}>
              <Link
                to={isOwner ? "/myInfo" : `/lookFor/${currentLoop?.author?._id}`}
                className={styles.authorLink}
              >
                <img
                  src={currentLoop.author?.profilePicture || "/insta.webp"}
                  alt={currentLoop.author?.username}
                  className={styles.avatar}
                />
                <span className={styles.username}>
                  {currentLoop.author?.username}
                </span>
              </Link>
              {!isOwner && (
                <>
                  <span className={styles.dotSeparator}>•</span>
                  <button
                    onClick={handleFollowToggle}
                    className={isFollowing ? styles.followingBtn : styles.followBtn}
                  >
                    {isFollowing ? "Following" : isRequested ? "Requested" : "Follow"}
                  </button>
                </>
              )}
            </div>
            {(currentLoop.caption || currentLoop.description) && (
              <p className={styles.caption}>{currentLoop.caption || currentLoop.description}</p>
            )}
          </div>

          {/* Side Actions list inside the video container */}
          <div className={styles.actionsColumn}>
            {/* Like Action */}
            <div className={styles.actionItem}>
              <button
                onClick={handleLike}
                className={`${styles.actionButton} ${liked ? styles.liked : ""}`}
              >
                {liked ? <FaHeart /> : <FaRegHeart />}
              </button>
              <Link to={`/seeWhoLiked/${currentLoop._id}`} className={styles.actionText}>
                {likesCount}
              </Link>
            </div>

            {/* Comment Action */}
            <div className={styles.actionItem}>
              <Link
                to={`/commentpage/${currentLoop._id}`}
                className={styles.actionButton}
              >
                <FaRegComment />
              </Link>
              <span className={styles.actionText}>
                {currentLoop.comments?.length || 0}
              </span>
            </div>

            {/* Save Action */}
            <div className={styles.actionItem}>
              <button
                onClick={handleSave}
                className={`${styles.actionButton} ${saved ? styles.saved : ""}`}
              >
                {saved ? <FaBookmark /> : <FaRegBookmark />}
              </button>
              <span className={styles.actionText}>
                {saved ? "Saved" : "Save"}
              </span>
            </div>

            {/* Mute Action */}
            <div className={styles.actionItem}>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={styles.actionButton}
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <span className={styles.actionText}>
                {isMuted ? "Muted" : "Audio"}
              </span>
            </div>

            {/* Owner Delete Action */}
            {isOwner && (
              <div className={styles.actionItem}>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className={`${styles.actionButton} ${styles.deleteBtn}`}
                  title="Delete Loop"
                >
                  <FaTrash />
                </button>
                <span className={styles.actionText}>Delete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {showConfirmDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Loop?</h3>
            <p>Are you sure you want to delete this loop forever?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowOneLoop;
