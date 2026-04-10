import React, { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Flourai</h1>
        <p style={styles.text}>Your account has been connected. Preparing your dashboard...</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, #fffaf8 0%, #eef7f1 100%)",
    fontFamily: "Inter, sans-serif",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    background: "rgba(255,255,255,0.78)",
    borderRadius: "28px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    fontSize: "38px",
    color: "#2f2a2d",
  },
  text: {
    marginTop: "12px",
    color: "#61555b",
    fontSize: "17px",
  },
};