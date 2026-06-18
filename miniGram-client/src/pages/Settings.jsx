import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";
import {
  FaLock,
  FaUserShield,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaUserSlash,
  FaBookmark,
} from "react-icons/fa";
import styles from "./Settings.module.css";
import { SocketContext } from "../context/SocketContext.jsx";

const Settings = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { socket } = useContext(SocketContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [API_URL]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleTogglePrivacy = async () => {
    if (!user || savingPrivacy) return;

    setSavingPrivacy(true);
    setErrors([]);
    setSuccessMessage("");
    try {
      const endpoint = user.isPrivate
        ? "switch-to-public"
        : "switch-to-private";
      const res = await axios.post(
        `${API_URL}/api/user/${endpoint}`,
        {},
        { withCredentials: true },
      );

      if (res.data?.user) {
        setUser((prev) => ({
          ...prev,
          isPrivate: res.data.user.isPrivate,
        }));
        setSuccessMessage(
          res.data.message ||
            `Account is now ${res.data.user.isPrivate ? "private" : "public"}`,
        );
      }
    } catch (error) {
      console.error("Failed to toggle privacy status:", error);
      setErrors([
        error?.response?.data?.message || "Failed to update privacy settings.",
      ]);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrors(["All password fields are required."]);
      return;
    }

    if (newPassword.length < 6) {
      setErrors(["New password must be at least 6 characters long."]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors(["New passwords do not match."]);
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axios.post(
        `${API_URL}/api/auth/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true },
      );

      setSuccessMessage(res.data?.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to change password:", error);
      setErrors([
        error?.response?.data?.message || "Failed to change password.",
      ]);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      socket?.disconnect();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      setErrors(["Failed to logout. Please try again."]);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <ClipLoader size={45} color="#8b5cf6" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.settingsCard}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/myInfo")}
          >
            <IoArrowBack size={24} />
          </button>
          <h2 className={styles.heading}>Settings</h2>
          <div style={{ width: "24px" }} />
        </div>

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {successMessage && (
          <div className={styles.successBox}>{successMessage}</div>
        )}

        {/* PRIVACY SECTION */}
        {user && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaUserShield className={styles.sectionIcon} />
              <span>Account Privacy</span>
            </div>
            <div className={styles.privacySetting}>
              <div className={styles.settingText}>
                <span className={styles.settingLabel}>Private Account</span>
                <p className={styles.settingDesc}>
                  When your account is private, only people you approve can see
                  your photos and videos.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={user.isPrivate}
                  onChange={handleTogglePrivacy}
                  disabled={savingPrivacy}
                />
                <span
                  className={`${styles.slider} ${savingPrivacy ? styles.sliderDisabled : ""}`}
                ></span>
              </label>
            </div>
          </div>
        )}

        {/* PASSWORD SECTION */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FaLock className={styles.sectionIcon} />
            <span>Change Password</span>
          </div>
          <form onSubmit={handleChangePassword} className={styles.form}>
            <div className={styles.passwordWrapper}>
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowOldPassword((prev) => !prev)}
              >
                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className={styles.saveBtn}
            >
              {passwordLoading ? (
                <ClipLoader size={18} color="#fff" />
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>

        {/* ACCORDION/LINKS SECTION */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FaUserShield className={styles.sectionIcon} />
            <span>Account Actions</span>
          </div>
          <div className={styles.linksContainer}>
            <Link to="/blocked-users" className={styles.linkItem}>
              <FaUserSlash className={styles.linkIcon} />
              <span>Blocked Users</span>
            </Link>
            <Link to="/saved-posts" className={styles.linkItem}>
              <FaBookmark className={styles.linkIcon} />
              <span>Saved Posts</span>
            </Link>
          </div>
        </div>

        {/* LOGOUT SECTION */}
        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <FaSignOutAlt className={styles.btnIcon} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
