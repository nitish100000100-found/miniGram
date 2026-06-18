import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import styles from "./AddHighlight.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function AddHighlight() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [story, setStory] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, storyRes] = await Promise.all([
          axios.get(`${API_URL}/api/user/current`, { withCredentials: true }),
          axios.get(`${API_URL}/api/story/oneStory/${storyId}`, { withCredentials: true })
        ]);

        const user = userRes.data.user;
        setCurrentUser(user);
        setHighlights(user.highlights || []);
        setStory(storyRes.data.story || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [storyId]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleAddToExisting = async (highlightId) => {
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/highlight/add-story/${highlightId}`, { storyId }, { withCredentials: true });
      navigate(-1);
    } catch (err) {
      console.error(err.response?.data?.message || "Error adding to highlight");
      setSubmitting(false);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("storyId", storyId);
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }
      await axios.post(`${API_URL}/api/highlight/create-from-story`, formData, { withCredentials: true });
      navigate(-1);
    } catch (err) {
      console.error(err.response?.data?.message || "Error creating highlight");
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>← Back</button>
        
        {highlights.length > 0 && (
          <>
            <div className={styles.section}>
              <h3>Add to Existing Highlight</h3>
              <div className={styles.list}>
                {highlights.map(h => (
                  <button key={h._id} onClick={() => handleAddToExisting(h._id)} disabled={submitting} className={styles.item}>
                    <img src={h.coverImage || currentUser?.profilePicture || "/insta.webp"} alt="" className={styles.cover} />
                    <span>{h.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.divider} />
          </>
        )}

        <div className={styles.creationWrapper}>
          {/* Left Column: Selected Story */}
          <div className={styles.storyCol}>
            <h3>Selected Story</h3>
            <div className={styles.storyPreviewBox}>
              {story?.mediaType === "video" ? (
                <div className={styles.videoWrapper}>
                  <video
                    ref={videoRef}
                    src={story.mediaUrl}
                    className={styles.storyVideo}
                    muted={isMuted}
                    playsInline
                    autoPlay
                    loop
                    onClick={handleToggle}
                  />
                  {isPaused && (
                    <div className={styles.videoPlayOverlay}>
                      <FaPlay size={18} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className={styles.videoMuteBtn}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                </div>
              ) : (
                <img src={story?.mediaUrl || "/insta.webp"} alt="Story" className={styles.storyImg} />
              )}
            </div>
          </div>

          {/* Right Column: Create New Form */}
          <form onSubmit={handleCreateNew} className={styles.formCol}>
            <h3>Create New Highlight</h3>
            
            <div className={styles.coverUpload} onClick={() => fileInputRef.current?.click()}>
              <img src={coverPreview || "/insta.webp"} alt="" className={styles.coverCircle} />
              <div className={styles.coverOverlay}>Change Cover</div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }}
                disabled={submitting}
              />
            </div>
            <span className={styles.coverLabel} onClick={() => fileInputRef.current?.click()}>
              Set cover photo for your highlight
            </span>

            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Highlight Name" 
              className={styles.input}
              disabled={submitting}
            />
            <button type="submit" disabled={!title.trim() || submitting} className={styles.btn}>
              Create & Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddHighlight;
