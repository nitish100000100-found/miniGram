import { useState, useRef, useEffect } from "react";

import { Link } from "react-router-dom";
import styles from "./signUp.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [errors, setErrors] = useState([]);
  const [otp, setOtp] = useState("");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fullNameRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const verifiedEmailRef = useRef("");

  const timeoutRef = useRef(null);

  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    });

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "",
      });
    }, 2000);
  };
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleSendOtp = async () => {
    const email = emailRef.current.value.trim().toLowerCase();

    if (!email) {
      setErrors(["Please enter email first"]);
      return;
    }

    setSendingOtp(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/send-signup-otp`,
        { email },
      );

      setErrors([]);
      setIsOtpSent(true);

      showNotification(response.data.message, "success");
    } catch (error) {
      setErrors([error?.response?.data?.message || "Failed to send OTP"]);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = emailRef.current.value.trim().toLowerCase();

    if (!otp) {
      setErrors(["Please enter OTP"]);
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          email,
          otp,
        },
      );

      verifiedEmailRef.current = email;

      setIsOtpVerified(true);
      setErrors([]);

      showNotification(response.data.message, "success");
    } catch (error) {
      setErrors([error?.response?.data?.message || "OTP verification failed"]);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const fullName = fullNameRef.current.value.trim();
    const username = usernameRef.current.value.trim().toLowerCase();
    const email = emailRef.current.value.trim().toLowerCase();
    const password = passwordRef.current.value.trim();
    const confirmPassword = confirmPasswordRef.current.value.trim();

    const newErrors = [];

    if (!isOtpVerified) {
      newErrors.push("Please verify your email first");
    }

    if (verifiedEmailRef.current !== email) {
      newErrors.push("Email changed. Verify OTP again");
    }

    if (!fullName) {
      newErrors.push("Full Name is required.");
    }

    if (!username) {
      newErrors.push("Username is required.");
    }

    if (!email) {
      newErrors.push("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push("Email is invalid.");
    }

    if (!password) {
      newErrors.push("Password is required.");
    } else if (password.length < 6) {
      newErrors.push("Password must be at least 6 characters long.");
    }

    if (password !== confirmPassword) {
      newErrors.push("Passwords do not match.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setSigningUp(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          name: fullName,
          username,
          email,
          password,
          otp
        },
        {
          withCredentials: true,
        },
      );

      setErrors([]);
      setOtp("");
      setIsOtpSent(false);
      setIsOtpVerified(false);

      verifiedEmailRef.current = "";

      fullNameRef.current.value = "";
      usernameRef.current.value = "";
      emailRef.current.value = "";
      passwordRef.current.value = "";
      confirmPasswordRef.current.value = "";

      showNotification("Account created successfully!", "success");

      navigate("/");
    } catch (error) {
      setErrors([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <div className={styles.container}>
      {notification.show && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.successNotification
              : styles.errorNotification
          }`}
        >
          <span className={styles.notificationIcon}>
            {notification.type === "success" ? "✓" : "⚠"}
          </span>

          <span>{notification.message}</span>
        </div>
      )}
      <div className={styles.card}>
        <h1 className={styles.logo}>MiniGram</h1>
        <p className={styles.subtitle}>Create your account</p>

        {errors.length > 0 && (
          <ul className={styles.errorList}>
            {errors.map((error, index) => (
              <li key={index} className={styles.errorItem}>
                {error}
              </li>
            ))}
          </ul>
        )}

        <form className={styles.form} onSubmit={handleSignup}>
          <input
            ref={fullNameRef}
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            className={styles.input}
          />

          <input
            ref={usernameRef}
            type="text"
            placeholder="Username"
            autoComplete="username"
            className={styles.input}
          />

          <div className={styles.emailRow}>
            <input
              ref={emailRef}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className={styles.input}
            />

            <button
              type="button"
              className={`${styles.button} ${styles.otpBtn}`}
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? <ClipLoader size={18} color="#fff" /> : "Send OTP"}
            </button>
          </div>

          {isOtpSent && (
            <>
              <input
                type="text"
                value={otp}
                maxLength={6}
                placeholder="Enter OTP"
                className={styles.input}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                type="button"
                className={`${styles.button} ${styles.verifyBtn}`}
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
              >
                {verifyingOtp ? (
                  <ClipLoader size={18} color="#fff" />
                ) : (
                  "Verify OTP"
                )}
              </button>
            </>
          )}

          <div className={styles.passwordWrapper}>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              disabled={!isOtpVerified}
              className={styles.input}
            />

            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className={styles.passwordWrapper}>
            <input
              ref={confirmPasswordRef}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              autoComplete="new-password"
              disabled={!isOtpVerified}
              className={styles.input}
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
            className={styles.button}
            disabled={!isOtpVerified || signingUp}
          >
            {signingUp ? <ClipLoader size={18} color="#fff" /> : "Sign Up"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/signin" className={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;