import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";
import styles from "./EditProfile.module.css";

const EditProfile = () => {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    profession: "",
    gender: "",
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });

        const user = res.data.user;

        setFormData({
          name: user.name || "",
          username: user.username || "",
          bio: user.bio || "",
          profession: user.profession || "",
          gender: user.gender || "",
        });

        setProfilePic(user.profilePicture || "/insta.webp");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setProfilePic(URL.createObjectURL(file));
    setRemoveProfilePic(false);
  };

  const handleRemoveProfilePic = () => {
    setSelectedFile(null);
    setProfilePic("/insta.webp");
    setRemoveProfilePic(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = [];

    if (!formData.name.trim()) {
      validationErrors.push("Name is required");
    }

    if (!formData.username.trim()) {
      validationErrors.push("Username is required");
    }

    if (formData.username.trim().length < 3) {
      validationErrors.push("Username must be at least 3 characters");
    }

    if (formData.bio.length > 200) {
      validationErrors.push("Bio cannot exceed 200 characters");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    try {
      setSaving(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("username", formData.username.trim().toLowerCase());
      data.append("bio", formData.bio);
      data.append("profession", formData.profession);
      data.append("gender", formData.gender);
      data.append("removeProfilePic", removeProfilePic ? "true" : "false");

      if (selectedFile) {
        data.append("profilepic", selectedFile);
      }

      const res = await axios.post(
        `${API_URL}/api/user/editProfile`,
        data,
        {
          withCredentials: true,
        },
      );

      const updatedUser = res.data.user || res.data;

      navigate(`/myInfo`);
    } catch (error) {
      console.error(error);

      setErrors([error?.response?.data?.message || "Something went wrong"]);
    } finally {
      setSaving(false);
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
      <form className={styles.editProfileCard} onSubmit={handleSubmit}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/myInfo")}
          >
            <IoArrowBack size={24} />
          </button>

          <h2 className={styles.heading}>Edit Profile</h2>

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

        <div className={styles.profileSection}>
          <label htmlFor="profilePic" className={styles.imageContainer}>
            <img
              src={profilePic || "/insta.webp"}
              alt="Profile"
              className={styles.profileImage}
            />
          </label>

          <input
            id="profilePic"
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfilePicChange}
          />

          <label htmlFor="profilePic" className={styles.changeText}>
            Change Profile Picture
          </label>
          {profilePic !== "/insta.webp" && (
            <button
              type="button"
              className={styles.removePicBtn}
              onClick={handleRemoveProfilePic}
            >
              Remove Current Photo
            </button>
          )}
        </div>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <input
          type="text"
          name="profession"
          placeholder="Profession"
          value={formData.profession}
          onChange={handleChange}
        />

        <textarea
          name="bio"
          rows={4}
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
        />

        <div className={styles.genderSection}>
          <p className={styles.genderLabel}>Gender</p>

          <div className={styles.genderOptions}>
            <label className={styles.genderOption}>
              <input
                type="radio"
                name="gender"
                value=""
                checked={formData.gender === ""}
                onChange={handleChange}
              />
              <span>Prefer not to say</span>
            </label>

            <label className={styles.genderOption}>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              <span>Male</span>
            </label>

            <label className={styles.genderOption}>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              <span>Female</span>
            </label>

            <label className={styles.genderOption}>
              <input
                type="radio"
                name="gender"
                value="Other"
                checked={formData.gender === "Other"}
                onChange={handleChange}
              />
              <span>Other</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? <ClipLoader size={18} color="#fff" /> : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
