import React from "react";
import flouraiLogo from "../assets/Text_Logo.png";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://flourai-backend.onrender.com";

export default function Home() {
  const handleLogin = () => {
    window.location.href = `${API_BASE}/auth/roblox/start`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowOne}></div>
      <div style={styles.glowTwo}></div>
      <div style={styles.glowThree}></div>

      <header style={styles.nav}>
        <div style={styles.brandWrap}>
          <div style={styles.brandLeaf}></div>
          <span style={styles.brandText}>Flourai</span>
        </div>

        <div style={styles.navLinks}>
          <span style={styles.navLink}>Home</span>
          <span style={styles.navLink}>Workspace</span>
          <span style={styles.navLink}>Activity</span>
        </div>

        <button style={styles.navButton} onClick={handleLogin}>
          Enter Flourai
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <p style={styles.kicker}>Flourai workspace</p>

            <h1 style={styles.title}>Welcome to Flourai.</h1>

            <p style={styles.subtitle}>
              A refined garden-inspired workspace for activity tracking, staff
              organization, sessions, and community management — built entirely
              around the Flourai experience.
            </p>

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={handleLogin}>
                Continue with Roblox
              </button>

              <button style={styles.secondaryButton}>View Workspace</button>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Theme</span>
                <strong style={styles.infoValue}>Botanical</strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Purpose</span>
                <strong style={styles.infoValue}>Internal Management</strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Focus</span>
                <strong style={styles.infoValue}>Activity & Staff</strong>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.logoPanel}>
              <img src={flouraiLogo} alt="Flourai" style={styles.logoImage} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #fbfff9 0%, #f2f9f1 46%, #edf6ef 100%)",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#203229",
  },
  glowOne: {
    position: "absolute",
    top: "-120px",
    left: "-120px",
    width: "520px",
    height: "520px",
    borderRadius: "999px",
    background: "rgba(123, 207, 155, 0.28)",
    filter: "blur(90px)",
  },
  glowTwo: {
    position: "absolute",
    bottom: "-120px",
    right: "-60px",
    width: "500px",
    height: "500px",
    borderRadius: "999px",
    background: "rgba(191, 232, 208, 0.34)",
    filter: "blur(90px)",
  },
  glowThree: {
    position: "absolute",
    top: "220px",
    right: "220px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(215, 182, 111, 0.16)",
    filter: "blur(70px)",
  },
  nav: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "26px 40px",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandLeaf: {
    width: "14px",
    height: "14px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #7bcf9b 0%, #2f5d46 100%)",
    boxShadow: "0 0 20px rgba(109,189,139,0.5)",
  },
  brandText: {
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  navLinks: {
    display: "flex",
    gap: "28px",
    color: "#5f7668",
    fontWeight: 500,
  },
  navLink: {
    cursor: "default",
  },
  navButton: {
    border: "1px solid rgba(47,93,70,0.12)",
    background: "rgba(255,255,255,0.78)",
    color: "#203229",
    padding: "13px 20px",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 10px 30px rgba(30,60,40,0.06)",
  },
  main: {
    position: "relative",
    zIndex: 2,
    padding: "20px 40px 70px",
  },
  hero: {
    maxWidth: "1380px",
    margin: "0 auto",
    minHeight: "78vh",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "28px",
    alignItems: "center",
  },
  heroLeft: {
    paddingRight: "14px",
  },
  kicker: {
    margin: 0,
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: "13px",
    color: "#6a8b79",
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: "76px",
    lineHeight: 0.96,
    letterSpacing: "-0.05em",
  },
  subtitle: {
    marginTop: "22px",
    maxWidth: "680px",
    fontSize: "20px",
    lineHeight: 1.8,
    color: "#53685d",
  },
  buttonRow: {
    display: "flex",
    gap: "14px",
    marginTop: "28px",
    flexWrap: "wrap",
  },
  primaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #2f5d46 0%, #214434 100%)",
    color: "white",
    padding: "15px 24px",
    borderRadius: "18px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 18px 34px rgba(33,68,52,0.22)",
  },
  secondaryButton: {
    border: "1px solid rgba(47,93,70,0.12)",
    background: "rgba(255,255,255,0.8)",
    color: "#203229",
    padding: "15px 24px",
    borderRadius: "18px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 12px 28px rgba(0,0,0,0.04)",
  },
  infoRow: {
    marginTop: "26px",
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  infoCard: {
    minWidth: "160px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.9)",
    borderRadius: "18px",
    padding: "14px 16px",
    boxShadow: "0 10px 30px rgba(30,60,40,0.05)",
  },
  infoLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "#769181",
    marginBottom: "7px",
    fontWeight: 700,
  },
  infoValue: {
    fontSize: "15px",
  },
  heroRight: {
    display: "grid",
    gap: "18px",
  },
  logoPanel: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.9)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(24,48,36,0.08)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },
  logoImage: {
    width: "100%",
    display: "block",
    objectFit: "contain",
    filter: "drop-shadow(0 18px 26px rgba(47,93,70,0.18))",
  },
};