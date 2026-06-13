import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";

import { FaEye, FaTrash } from "react-icons/fa";

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

  useEffect(() => {
    fetchInitialData();
  }, [storyId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [userRes, storyRes] = await Promise.all([
        axios.get(`${BaseUrl}/api/user/current`, {
          withCredentials: true,
        }),
        axios.get(`${BaseUrl}/api/story/oneStory/${storyId}`, {
          withCredentials: true,
        }),
      ]);

      const user = userRes.data.user;
      const story = storyRes.data.story;

      setCurrentUser(user);
      setCurrentStory(story);

      const storiesRes = await axios.get(
        `${BaseUrl}/api/story/allStories/${story.author._id}`,
        {
          withCredentials: true,
        },
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

  const handleNext = async () => {
    if (currentIndex >= allStories.length - 1) return;

    try {
      const nextIndex = currentIndex + 1;

      const nextStoryId = allStories[nextIndex]._id;

      const res = await axios.get(
        `${BaseUrl}/api/story/oneStory/${nextStoryId}`,
        {
          withCredentials: true,
        },
      );

      setCurrentStory(res.data.story);
      setCurrentIndex(nextIndex);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrev = async () => {
    if (currentIndex <= 0) return;

    try {
      const prevIndex = currentIndex - 1;

      const prevStoryId = allStories[prevIndex]._id;

      const res = await axios.get(
        `${BaseUrl}/api/story/oneStory/${prevStoryId}`,
        {
          withCredentials: true,
        },
      );

      setCurrentStory(res.data.story);
      setCurrentIndex(prevIndex);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    setShowConfirmDelete(false);
    try {
      setIsDeleting(true);
      await axios.post(
        `${BaseUrl}/api/story/deleteStory/${currentStory._id}`,
        {},
        {
          withCredentials: true,
        },
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
    <div className={styles.container}>
      {/* TOP BAR */}

      <div className={styles.topBar}>
        <Link
          to={isOwner ? "/myInfo" : `/lookFor/${currentStory.author._id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
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
            <button
              onClick={() => setShowConfirmDelete(true)}
              className={styles.iconBtn}
              title="Delete Story"
            >
              <FaTrash />
            </button>
          )}

          <button onClick={() => navigate("/")} className={styles.iconBtn}>
            <IoClose />
          </button>
        </div>
      </div>

      {/* MEDIA */}

      <div className={styles.storyWrapper}>
        {currentStory.mediaType === "image" ? (
          <img
            src={currentStory.mediaUrl}
            alt=""
            className={styles.storyMedia}
          />
        ) : (
          <video
            src={currentStory.mediaUrl}
            autoPlay
            controls
            className={styles.storyMedia}
          />
        )}
      </div>

      {/* LEFT */}

      {currentIndex > 0 && (
        <button onClick={handlePrev} className={styles.leftArrow}>
          <IoChevronBack />
        </button>
      )}

      {/* RIGHT */}

      {currentIndex < allStories.length - 1 && (
        <button onClick={handleNext} className={styles.rightArrow}>
          <IoChevronForward />
        </button>
      )}

      {/* OWNER CONTROLS */}

      {isOwner && (
        <button
          className={styles.viewsBtn}
          onClick={() => setShowViewers(true)}
        >
          <FaEye />

          <span>{currentStory.viewedBy?.length}</span>
        </button>
      )}

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
              [...currentStory.viewedBy]
                .sort((a, b) => {
                  const aId = a._id ? a._id.toString() : a.toString();
                  const bId = b._id ? b._id.toString() : b.toString();
                  if (aId === currentUser?._id?.toString()) return -1;
                  if (bId === currentUser?._id?.toString()) return 1;
                  return 0;
                })
                .map((user) => {
                  const isSelf = (user._id ? user._id.toString() : user.toString()) === currentUser?._id?.toString();
                  return (
                    <Link
                      key={user._id}
                      to={isSelf ? "/myInfo" : `/lookFor/${user._id}`}
                      className={styles.viewerItem}
                    >
                      <img src={user.profilePicture || "/insta.webp"} alt="" />
                      <span>{isSelf ? "You" : user.username}</span>
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

export default LookForStory;
