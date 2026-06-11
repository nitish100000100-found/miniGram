import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "./forgotpass.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    let interval;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resendTimer]);

  const emailRef = useRef(null);
  const savedEmailRef = useRef("");
  const savedOtpRef = useRef("");

  const otpRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

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

  const sendOtpHandler = async () => {
    try {
      const email = emailRef.current.value.trim();

      if (!email) {
        return showNotification("Email is required", "error");
      }

      setLoading(true);

      savedEmailRef.current = email;

      const res = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email,
      });

      showNotification(res.data.message, "success");

      setResendTimer(30);
      setStep(2);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpHandler = async () => {
    try {
      const otp = otpRef.current.value.trim();

      if (!otp) {
        return showNotification("OTP is required", "error");
      }

      setLoading(true);

      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: savedEmailRef.current,
        otp,
      });

      showNotification(res.data.message, "success");
      savedOtpRef.current = otp;
      setStep(3);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordHandler = async () => {
    try {
      const otp = savedOtpRef.current;
      const newPassword = newPasswordRef.current.value;
      const confirmPassword = confirmPasswordRef.current.value;

      if (!otp) {
        return showNotification("OTP is required", "error");
      }

      if (newPassword.length < 6) {
        return showNotification(
          "Password must be at least 6 characters",
          "error",
        );
      }

      if (newPassword !== confirmPassword) {
        return showNotification("Passwords do not match", "error");
      }

      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        {
          email: savedEmailRef.current,
          otp,
          newPassword,
        },
        {
          withCredentials: true,
        },
      );

      showNotification(res.data.message, "success");

      savedEmailRef.current = "";

      if (emailRef.current) emailRef.current.value = "";
      if (otpRef.current) otpRef.current.value = "";
      if (newPasswordRef.current) newPasswordRef.current.value = "";
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
      savedEmailRef.current = "";

      navigate("/");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  const resendOtpHandler = async () => {
    if (resendTimer > 0) return;

    try {
      setResendingOtp(true);

      const res = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email: savedEmailRef.current,
      });

      showNotification(res.data.message, "success");
      setResendTimer(30);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setResendingOtp(false);
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
        <h2>Forgot Password</h2>

        {step === 1 && (
          <>
            <input ref={emailRef} type="email" placeholder="Enter Email" />

            <button onClick={sendOtpHandler} disabled={loading}>
              {loading ? <ClipLoader size={20} color="#fff" /> : "Send OTP"}
            </button>
            <Link to="/signin" className={styles.backLink}>
              Back to Sign In
            </Link>
          </>
        )}

        {step === 2 && (
          <>
            <input
              ref={otpRef}
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
            />

            <button onClick={verifyOtpHandler} disabled={loading}>
              {loading ? <ClipLoader size={20} color="#fff" /> : "Verify OTP"}
            </button>

            <button
              type="button"
              className={styles.resendBtn}
              onClick={resendOtpHandler}
              disabled={resendingOtp || resendTimer > 0}
            >
              {resendingOtp ? (
                <ClipLoader size={20} color="#fff" />
              ) : resendTimer > 0 ? (
                `Resend OTP in ${resendTimer}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className={styles.passwordWrapper}>
              <input
                ref={newPasswordRef}
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
              />

              <span
                className={styles.eyeIcon}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className={styles.passwordWrapper}>
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
              />

              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button onClick={resetPasswordHandler} disabled={loading}>
              {loading ? (
                <ClipLoader size={20} color="#fff" />
              ) : (
                "Reset Password"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
