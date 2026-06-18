import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import styles from "./AddStory.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function AddStory() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
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
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors([]);
      setIsPaused(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const newErrors = [];
    if (!selectedFile) {
      newErrors.push("Please select media (image or video) first.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setUploading(true);
    const formData = new FormData();
    formData.append("media", selectedFile);

    try {
      await axios.post(`${API_URL}/api/story/addStory`, formData, {
        withCredentials: true,
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      setErrors([error.response?.data?.message || "Failed to upload story."]);
    } finally {
      setUploading(false);
    }
  };

  const triggerSelectFile = () => fileInputRef.current?.click();

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    navigate("/");
  };

  return (
    <div className={styles.container}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/favicon-v2.svg" alt="miniGram" />
          <h1>MiniGram</h1>
        </Link>

        <Link to="/" className={styles.backBtn}>
          ← Back
        </Link>
      </div>

      <div className={styles.glassCard}>
        <h2 className={styles.title}>Share your story</h2>

        {errors.length > 0 && (
          <ul className={styles.errorList}>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleUpload} className={styles.form}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            style={{ display: "none" }}
          />

          <div className={styles.studioLayout}>
            <div className={styles.mediaContainer}>
              {previewUrl ? (
                selectedFile?.type.startsWith("video/") ? (
                  <div className={styles.videoWrapper}>
                    <video
                      ref={videoRef}
                      src={previewUrl}
                      className={styles.preview}
                      muted={isMuted}
                      loop
                      playsInline
                      autoPlay
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
                    <button
                      type="button"
                      className={styles.changeFileBtn}
                      onClick={triggerSelectFile}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div className={styles.imageWrapper}>
                    <img src={previewUrl} alt="Preview" className={styles.preview} />
                    <button
                      type="button"
                      className={styles.changeFileBtn}
                      onClick={triggerSelectFile}
                    >
                      Change File
                    </button>
                  </div>
                )
              ) : (
                <div className={styles.uploadPlaceholder} onClick={triggerSelectFile}>
                  <span className={styles.plusSign}>+</span>
                  <span className={styles.placeholderText}>Click to select Photo or Video</span>
                  <span className={styles.helperText}>Supports MP4, WebM, JPEG, PNG</span>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Studio Settings & Details */}
            <div className={styles.controlsSide}>
              <div className={styles.instructions}>
                <h3>Creator Studio</h3>
                <p>Stories you share will be visible to your followers for 24 hours. Choose an engaging photo or short video clip to share your moment!</p>
              </div>

              {selectedFile ? (
                <div className={styles.fileDetails}>
                  <h4>Media details</h4>
                  <p><strong>Name:</strong> {selectedFile.name}</p>
                  <p><strong>Type:</strong> {selectedFile.type}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className={styles.noFileSelected}>
                  <p>No media selected yet. Click the upload area to pick a file.</p>
                </div>
              )}

              <div className={styles.actionContainer}>
                {uploading ? (
                  <div className={styles.loaderContainer}>
                    <ClipLoader size={28} color="#c084fc" />
                    <span>Uploading Story...</span>
                  </div>
                ) : (
                  <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitBtn}>
                      Share Story
                    </button>
                    <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStory;