import React, { useEffect, useState } from "react";
import flouraiLogo from "../assets/Text_Logo.png";

import logo from "../assets/home.png";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.flourai.io";

function useResponsive() {
  const getWidth = () =>
    typeof window !== "undefined" ? window.innerWidth : 1400;

  const [width, setWidth] = useState(getWidth());

  useEffect(() => {
    const onResize = () => setWidth(getWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1100,
  };
}

export default function Home() {
  const { isMobile, isTablet } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/roblox/start`;
  };

  const styles = createStyles({ isMobile, isTablet, menuOpen });

  return (
    <div style={styles.page}>
      <div style={styles.glowOne}></div>
      <div style={styles.glowTwo}></div>
      <div style={styles.glowThree}></div>

      <header style={styles.nav}>
        <div style={styles.brandWrap}>
  <img src={logo} alt="Flourai" style={{ height: 40 }} />
</div>

        {!isMobile && (
          <div style={styles.navLinks}>
            <span style={styles.navLink}>Home</span>
            <span style={styles.navLink}>Workspace</span>
            <span style={styles.navLink}>Activity</span>
          </div>
        )}

        <div style={styles.navActions}>
          {isMobile ? (
            <button
              style={styles.menuButton}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          ) : (
            <button style={styles.navButton} onClick={handleLogin}>
              Enter Flourai
            </button>
          )}
        </div>
      </header>

      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          <span style={styles.mobileMenuItem}>Home</span>
          <span style={styles.mobileMenuItem}>Workspace</span>
          <span style={styles.mobileMenuItem}>Activity</span>
          <button style={styles.mobileMenuButton} onClick={handleLogin}>
            Enter Flourai
          </button>
        </div>
      )}

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

            <div style={styles.workspaceCard}>
              <div style={styles.workspaceTop}>
                <div>
                  <p style={styles.workspaceLabel}>Flourai system</p>
                  <h3 style={styles.workspaceTitle}>Workspace Preview</h3>
                </div>

                <div style={styles.livePill}>Garden Live</div>
              </div>

              <div style={styles.workspaceGrid}>
                <div style={styles.workspaceLarge}>
                  <p style={styles.blockLabel}>Overview</p>
                  <h4 style={styles.blockTitle}>Elegant, calm, organized.</h4>
                  <p style={styles.blockText}>
                    A central place for Flourai’s staff systems, member
                    management, and internal operations.
                  </p>
                </div>

                <div style={styles.workspaceSmall}>
                  <p style={styles.blockLabel}>Activity</p>
                  <h4 style={styles.smallStat}>24h</h4>
                  <p style={styles.blockText}>Tracked this week</p>
                </div>

                <div style={styles.workspaceSmall}>
                  <p style={styles.blockLabel}>Sessions</p>
                  <h4 style={styles.smallStat}>08</h4>
                  <p style={styles.blockText}>Managed events</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.bottomSection}>
          <div style={styles.bottomHeader}>
            <p style={styles.bottomKicker}>Designed for Flourai</p>
            <h2 style={styles.bottomTitle}>
              Built by vorvyns, data managed safe.
            </h2>
          </div>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureDot}></div>
              <h3 style={styles.featureTitle}>Activity Tracking</h3>
              <p style={styles.featureText}>
                Monitor weekly progress, participation, and contribution with a
                cleaner interface tailored to Flourai.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureDot}></div>
              <h3 style={styles.featureTitle}>Staff Oversight</h3>
              <p style={styles.featureText}>
                Organize internal roles, sessions, and moderation through a
                softer management experience.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureDot}></div>
              <h3 style={styles.featureTitle}>Flourai Identity</h3>
              <p style={styles.featureText}>
                Every part of the workspace reflects Flourai’s own visual style,
                tone, and garden-inspired atmosphere.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function createStyles({ isMobile, isTablet, menuOpen }) {
  const compact = isMobile || isTablet;

  return {
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
      top: isMobile ? "-160px" : "-120px",
      left: isMobile ? "-180px" : "-120px",
      width: isMobile ? "360px" : "520px",
      height: isMobile ? "360px" : "520px",
      borderRadius: "999px",
      background: "rgba(123, 207, 155, 0.28)",
      filter: `blur(${isMobile ? 70 : 90}px)`,
    },
    glowTwo: {
      position: "absolute",
      bottom: "-120px",
      right: isMobile ? "-140px" : "-60px",
      width: isMobile ? "320px" : "500px",
      height: isMobile ? "320px" : "500px",
      borderRadius: "999px",
      background: "rgba(191, 232, 208, 0.34)",
      filter: `blur(${isMobile ? 70 : 90}px)`,
    },
    glowThree: {
      position: "absolute",
      top: isMobile ? "160px" : "220px",
      right: isMobile ? "10px" : "220px",
      width: isMobile ? "160px" : "260px",
      height: isMobile ? "160px" : "260px",
      borderRadius: "999px",
      background: "rgba(215, 182, 111, 0.16)",
      filter: `blur(${isMobile ? 50 : 70}px)`,
    },
    nav: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      padding: isMobile ? "18px 16px" : isTablet ? "22px 24px" : "26px 40px",
    },
    brandWrap: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
    },
    brandLeaf: {
      width: "14px",
      height: "14px",
      borderRadius: "999px",
      background: "linear-gradient(135deg, #7bcf9b 0%, #2f5d46 100%)",
      boxShadow: "0 0 20px rgba(109,189,139,0.5)",
      flexShrink: 0,
    },
    brandText: {
      fontSize: isMobile ? "22px" : "24px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    navLinks: {
      display: "flex",
      gap: isTablet ? "20px" : "28px",
      color: "#5f7668",
      fontWeight: 500,
    },
    navLink: {
      cursor: "default",
    },
    navActions: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
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
      whiteSpace: "nowrap",
    },
    menuButton: {
      border: "1px solid rgba(47,93,70,0.12)",
      background: "rgba(255,255,255,0.85)",
      color: "#203229",
      width: "46px",
      height: "46px",
      borderRadius: "14px",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: 700,
      boxShadow: "0 10px 30px rgba(30,60,40,0.06)",
    },
    mobileMenu: {
      position: "relative",
      zIndex: 3,
      margin: "0 16px 10px",
      padding: "14px",
      borderRadius: "22px",
      background: "rgba(255,255,255,0.82)",
      border: "1px solid rgba(255,255,255,0.95)",
      boxShadow: "0 18px 40px rgba(24,48,36,0.08)",
      display: "grid",
      gap: "12px",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    },
    mobileMenuItem: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#3a5245",
      padding: "6px 2px",
    },
    mobileMenuButton: {
      marginTop: "4px",
      border: "none",
      background: "linear-gradient(135deg, #2f5d46 0%, #214434 100%)",
      color: "#fff",
      padding: "14px 16px",
      borderRadius: "16px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 700,
      boxShadow: "0 18px 34px rgba(33,68,52,0.18)",
    },
    main: {
      position: "relative",
      zIndex: 2,
      padding: isMobile ? "10px 16px 48px" : isTablet ? "14px 24px 56px" : "20px 40px 70px",
    },
    hero: {
      maxWidth: "1380px",
      margin: "0 auto",
      minHeight: isMobile ? "auto" : "78vh",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1.05fr 0.95fr",
      gap: isMobile ? "20px" : isTablet ? "24px" : "28px",
      alignItems: "center",
    },
    heroLeft: {
      paddingRight: isMobile ? 0 : "14px",
      order: 1,
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
      fontSize: isMobile ? "44px" : isTablet ? "60px" : "76px",
      lineHeight: 0.96,
      letterSpacing: "-0.05em",
    },
    subtitle: {
      marginTop: "22px",
      maxWidth: "680px",
      fontSize: isMobile ? "16px" : isTablet ? "18px" : "20px",
      lineHeight: isMobile ? 1.7 : 1.8,
      color: "#53685d",
    },
    buttonRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
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
      width: isMobile ? "100%" : "auto",
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
      width: isMobile ? "100%" : "auto",
    },
    infoRow: {
      marginTop: "26px",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : compact ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(160px, 1fr))",
      gap: "14px",
    },
    infoCard: {
      minWidth: 0,
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
      order: 2,
    },
    logoPanel: {
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(255,255,255,0.9)",
      borderRadius: isMobile ? "24px" : "32px",
      padding: isMobile ? "20px" : "28px",
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
    workspaceCard: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(247,252,248,0.72) 100%)",
      border: "1px solid rgba(255,255,255,0.9)",
      borderRadius: isMobile ? "24px" : "28px",
      padding: isMobile ? "18px" : "22px",
      boxShadow: "0 25px 60px rgba(24,48,36,0.08)",
    },
    workspaceTop: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      gap: "10px",
      marginBottom: "16px",
    },
    workspaceLabel: {
      margin: 0,
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color: "#739080",
      fontWeight: 700,
    },
    workspaceTitle: {
      margin: "8px 0 0",
      fontSize: isMobile ? "24px" : "28px",
    },
    livePill: {
      padding: "8px 12px",
      borderRadius: "999px",
      background: "rgba(191, 232, 208, 0.52)",
      color: "#2f5d46",
      fontWeight: 700,
      fontSize: "13px",
    },
    workspaceGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1.15fr 1fr 1fr",
      gap: "14px",
    },
    workspaceLarge: {
      gridColumn: isMobile ? "auto" : isTablet ? "1 / -1" : "auto",
      background: "rgba(242, 249, 241, 0.95)",
      borderRadius: "22px",
      padding: "18px",
      minHeight: isMobile ? "auto" : "150px",
    },
    workspaceSmall: {
      background: "rgba(232, 245, 236, 0.95)",
      borderRadius: "22px",
      padding: "18px",
      minHeight: isMobile ? "auto" : "150px",
    },
    blockLabel: {
      margin: 0,
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: "#749081",
      fontWeight: 700,
    },
    blockTitle: {
      margin: "10px 0 8px",
      fontSize: isMobile ? "22px" : "24px",
      lineHeight: 1.1,
    },
    blockText: {
      margin: 0,
      color: "#587063",
      lineHeight: 1.65,
      fontSize: isMobile ? "15px" : "16px",
    },
    smallStat: {
      margin: "16px 0 8px",
      fontSize: isMobile ? "32px" : "36px",
      lineHeight: 1,
    },
    bottomSection: {
      maxWidth: "1380px",
      margin: isMobile ? "28px auto 0" : "6px auto 0",
      paddingTop: "12px",
    },
    bottomHeader: {
      marginBottom: "18px",
    },
    bottomKicker: {
      margin: 0,
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color: "#72907f",
      fontWeight: 700,
    },
    bottomTitle: {
      margin: "10px 0 0",
      fontSize: isMobile ? "30px" : isTablet ? "36px" : "42px",
      letterSpacing: "-0.03em",
      maxWidth: "760px",
      lineHeight: 1.08,
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)",
      gap: "18px",
      marginTop: "18px",
    },
    featureCard: {
      background: "rgba(255,255,255,0.78)",
      border: "1px solid rgba(255,255,255,0.9)",
      borderRadius: "26px",
      padding: isMobile ? "20px" : "24px",
      boxShadow: "0 18px 40px rgba(24,48,36,0.05)",
    },
    featureDot: {
      width: "12px",
      height: "12px",
      borderRadius: "999px",
      background: "linear-gradient(135deg, #7bcf9b 0%, #d7b66f 100%)",
      marginBottom: "14px",
    },
    featureTitle: {
      margin: 0,
      fontSize: isMobile ? "21px" : "24px",
    },
    featureText: {
      marginTop: "10px",
      color: "#5a7063",
      lineHeight: 1.75,
      fontSize: "16px",
    },
  };
}