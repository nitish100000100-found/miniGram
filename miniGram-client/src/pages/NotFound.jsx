import { Link } from "react-router-dom";

function NotFound() {
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      background:
        "linear-gradient(135deg, #0f0f1a, #17172b, #1e1e3f)",
    },

    card: {
      width: "100%",
      maxWidth: "550px",
      textAlign: "center",
      padding: "50px 30px",
      borderRadius: "24px",
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    },

    title: {
      fontSize: "7rem",
      lineHeight: 1,
      marginBottom: "12px",
      color: "#9b5cff",
    },

    subtitle: {
      fontSize: "2rem",
      color: "#fff",
      marginBottom: "15px",
    },

    text: {
      color: "#bdbdd7",
      lineHeight: 1.6,
      marginBottom: "30px",
    },

    button: {
      display: "inline-block",
      padding: "12px 24px",
      borderRadius: "12px",
      textDecoration: "none",
      fontWeight: "600",
      color: "#fff",
      background: "#8b5cf6",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>404</h1>

        <h2 style={styles.subtitle}>Page Not Found</h2>

        <p style={styles.text}>
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link to="/" style={styles.button}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;