import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import styles from "./signIn.module.css";


import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const handleSignIn = async (e) => {
    e.preventDefault();

    const form = e.target;

    const username = form.elements.username?.value?.trim()?.toLowerCase();

    const password = form.elements.password?.value?.trim();

    const newErrors = [];

    if (!username) {
      newErrors.push("Username is required.");
    }

    if (!password) {
      newErrors.push("Password is required.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signin`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      );

      setErrors([]);
      form.reset();

    
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    }
  };

  return (
    <div className={styles.container}>
    
      <div className={styles.card}>
        <h1 className={styles.logo}>MiniGram</h1>

        <p className={styles.subtitle}>Welcome Back</p>

        {errors.length > 0 && (
          <ul className={styles.errorList}>
            {errors.map((error, index) => (
              <li key={index} className={styles.errorItem}>
                {error}
              </li>
            ))}
          </ul>
        )}

        <form className={styles.form} onSubmit={handleSignIn}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            className={styles.input}
          />

          <div className={styles.passwordWrapper}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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

          <div className={styles.forgotWrapper}>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

       

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
