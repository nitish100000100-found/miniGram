import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "./AddPost.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function AddPost() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select media first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("media", selectedFile);
    formData.append("caption", caption);

    try {
      await axios.post(`${API_URL}/api/post/upload`, formData, {
        withCredentials: true,
      });
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload post.");
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
        
        {error && <p className={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleUpload} className={styles.form}>
          {/* File Upload / Preview Area */}
          <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              style={{ display: "none" }}
            />
            {previewUrl ? (
              selectedFile?.type.startsWith("video/") ? (
                <video src={previewUrl} className={styles.preview} controls />
              ) : (
                <img src={previewUrl} alt="Preview" className={styles.preview} />
              )
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.icon}>📸</span>
                <p>Click to upload photo or video</p>
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
                <span>Uploading Post...</span>
              </div>
            ) : (
              <button type="submit" className={styles.submitBtn}>
                Share Post
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPost;
