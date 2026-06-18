import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import styles from "./AddPost.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function AddPost() {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState("post"); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
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
      if (uploadType === "loop" && !file.type.startsWith("video/")) {
        setError("Loops can only be video files.");
        return;
      }
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
      setIsPaused(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select media first.");
      return;
    }

    if (uploadType === "loop" && !selectedFile.type.startsWith("video/")) {
      setError("Loops can only be video files.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append(uploadType === "loop" ? "video" : "media", selectedFile);
    formData.append("caption", caption);

    try {
      const endpoint = uploadType === "loop" ? "/api/loop/upload" : "/api/post/upload";
      await axios.post(`${API_URL}${endpoint}`, formData, {
        withCredentials: true,
      });
      navigate("/myInfo");
    } catch (error) {
      setError(error.response?.data?.message || `Failed to upload ${uploadType}.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
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
        <h2>Share your memory</h2>

        {/* Tab Toggle */}
        <div className={styles.tabContainer}>
          <button
            type="button"
            className={`${styles.tab} ${uploadType === "post" ? styles.activeTab : ""}`}
            onClick={() => {
              setUploadType("post");
              setSelectedFile(null);
              setPreviewUrl("");
              setCaption("");
              setError("");
            }}
          >
            Post
          </button>
          <button
            type="button"
            className={`${styles.tab} ${uploadType === "loop" ? styles.activeTab : ""}`}
            onClick={() => {
              setUploadType("loop");
              setSelectedFile(null);
              setPreviewUrl("");
              setCaption("");
              setError("");
            }}
          >
            Loop
          </button>
        </div>
        
        {error && <p className={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleUpload} className={styles.form}>
          <div
            className={styles.uploadBox}
            onClick={() => {
              if (!previewUrl) {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={uploadType === "loop" ? "video/*" : "image/*,video/*"}
              style={{ display: "none" }}
            />
            {previewUrl ? (
              selectedFile?.type.startsWith("video/") ? (
                <div className={styles.videoWrapper}>
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className={styles.preview}
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
                  <button
                    type="button"
                    className={styles.changeFileBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={styles.preview}
                  onClick={() => fileInputRef.current?.click()}
                />
              )
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.icon}>
                  {uploadType === "loop" ? "🎥" : "📸"}
                </span>
                <p>
                  {uploadType === "loop"
                    ? "Click to upload a video"
                    : "Click to upload photo or video"}
                </p>
              </div>
            )}
          </div>

          {/* Caption Field */}
          <div className={styles.inputGroup}>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          {/* Submit Actions */}
          <div className={styles.actions}>
            {uploading ? (
              <div className={styles.loader}>
                <ClipLoader size={24} color="#c084fc" />
                <span>Uploading {uploadType === "loop" ? "Loop" : "Post"}...</span>
              </div>
            ) : (
              <button type="submit" className={styles.submitBtn}>
                Share {uploadType === "loop" ? "Loop" : "Post"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPost;
