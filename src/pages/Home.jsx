import React, { useEffect, useState } from "react";
import flouraiLogo from "../assets/Text_Logo.png";
import mark from "../assets/home.png";

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
    isMobile: width < 780,
    isTablet: width >= 780 && width < 1120,
  };
}

export default function Home() {
  const { isMobile, isTablet } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/roblox/start`;
  };

  const handleWorkspace = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/dashboard";
        return;
      }

      handleLogin();
    } catch {
      handleLogin();
    }
  };

  const styles = createStyles({ isMobile, isTablet });

  return (
    <div style={styles.page}>
      <header style={styles.nav}>
        <button style={styles.brand} onClick={() => window.scrollTo(0, 0)}>
          <img src={mark} alt="" style={styles.brandMark} />
          <span style={styles.brandText}>Flourai</span>
        </button>

        {!isMobile && (
          <nav style={styles.navLinks} aria-label="Primary">
            <a href="#home" style={styles.navLink}>
              Home
            </a>
            <a href="#workspace" style={styles.navLink}>
              Workspace
            </a>
            <a href="#activity" style={styles.navLink}>
              Activity
            </a>
            <a href="/verify" style={styles.navLink}>
              Verify
            </a>
          </nav>
        )}

        {isMobile ? (
          <button
            style={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        ) : (
          <button style={styles.navButton} onClick={handleWorkspace}>
            Enter Flourai
          </button>
        )}
      </header>

      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          <a href="#home" style={styles.mobileLink}>
            Home
          </a>
          <a href="#workspace" style={styles.mobileLink}>
            Workspace
          </a>
          <a href="#activity" style={styles.mobileLink}>
            Activity
          </a>
          <a href="/verify" style={styles.mobileLink}>
            Verify
          </a>
          <button style={styles.mobileButton} onClick={handleWorkspace}>
            Enter Flourai
          </button>
        </div>
      )}

      <main id="home" style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <p style={styles.kicker}>Flourai workspace</p>
            <h1 style={styles.title}>Welcome to Flourai.</h1>
            <p style={styles.subtitle}>
              A refined garden-inspired workspace for activity tracking, staff
              organization, sessions, and community management - built entirely
              around the Flourai experience.
            </p>

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={handleLogin}>
                Continue with Roblox
              </button>
              <button style={styles.secondaryButton} onClick={handleWorkspace}>
                View Workspace
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => {
                  window.location.href = "/verify";
                }}
              >
                Verify Discord
              </button>
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

          <div id="workspace" style={styles.heroRight}>
            <div style={styles.logoPanel}>
              <img src={flouraiLogo} alt="Flourai" style={styles.logoImage} />
            </div>

            <div style={styles.workspaceCard}>
              <div style={styles.workspaceTop}>
                <div>
                  <p style={styles.workspaceLabel}>Flourai system</p>
                  <h2 style={styles.workspaceTitle}>Workspace Preview</h2>
                </div>
                <span style={styles.livePill}>Garden Live</span>
              </div>

              <div style={styles.workspaceGrid}>
                <div style={styles.workspaceLarge}>
                  <p style={styles.blockLabel}>Overview</p>
                  <h3 style={styles.blockTitle}>Elegant, calm, organized.</h3>
                  <p style={styles.blockText}>
                    A central place for Flourai's staff systems, member
                    management, and internal operations.
                  </p>
                </div>

                <div id="activity" style={styles.workspaceSmall}>
                  <p style={styles.blockLabel}>Activity</p>
                  <strong style={styles.smallStat}>24h</strong>
                  <p style={styles.blockText}>Tracked this week</p>
                </div>

                <div style={styles.workspaceSmall}>
                  <p style={styles.blockLabel}>Sessions</p>
                  <strong style={styles.smallStat}>08</strong>
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
            <article style={styles.featureCard}>
              <div style={styles.featureDot} />
              <h3 style={styles.featureTitle}>Activity Tracking</h3>
              <p style={styles.featureText}>
                Monitor weekly progress, participation, and contribution with a
                cleaner interface tailored to Flourai.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureDot} />
              <h3 style={styles.featureTitle}>Staff Oversight</h3>
              <p style={styles.featureText}>
                Organize internal roles, sessions, and moderation through a
                softer management experience.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureDot} />
              <h3 style={styles.featureTitle}>Flourai Identity</h3>
              <p style={styles.featureText}>
                Every part of the workspace reflects Flourai's visual style,
                tone, and garden-inspired atmosphere.
              </p>
            </article>
          </div>
        </section>

        <footer style={styles.footer}>
          <span style={styles.footerBrand}>Flourai</span>
          <div style={styles.footerLinks}>
            <a href="/terms" style={styles.footerLink}>
              Terms of Service
            </a>
            <a href="/privacy" style={styles.footerLink}>
              Privacy Policy
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function createStyles({ isMobile, isTablet }) {
  const compact = isMobile || isTablet;

  return {
    page: {
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
      background:
        "radial-gradient(circle at 7% 15%, rgba(155,214,172,0.26), transparent 18%), linear-gradient(180deg, #fbfdf8 0%, #f4f8f1 48%, #edf5ee 100%)",
      color: "#1c2f25",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    nav: {
      position: "relative",
      zIndex: 4,
      minHeight: 76,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr auto" : "1fr auto 1fr",
      alignItems: "center",
      gap: 14,
      padding: isMobile ? "14px 16px" : "18px 40px",
    },

    brand: {
      border: 0,
      background: "transparent",
      padding: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      justifySelf: "start",
      color: "#1c2f25",
    },

    brandMark: {
      width: 34,
      height: 34,
      objectFit: "cover",
      borderRadius: 10,
      filter: "drop-shadow(0 10px 18px rgba(53, 98, 68, 0.18))",
    },

    brandText: {
      fontSize: isMobile ? 22 : 24,
      fontWeight: 800,
      letterSpacing: 0,
    },

    navLinks: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: isTablet ? 26 : 36,
      color: "#59675f",
      fontSize: 16,
      fontWeight: 700,
    },

    navLink: {
      cursor: "pointer",
    },

    navButton: {
      justifySelf: "end",
      height: 50,
      minWidth: 156,
      borderRadius: 14,
      border: "1px solid rgba(28,47,37,0.08)",
      background: "rgba(255,255,255,0.76)",
      color: "#1c2f25",
      fontSize: 16,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 18px 42px rgba(40,70,52,0.08)",
    },

    menuButton: {
      height: 44,
      borderRadius: 14,
      border: "1px solid rgba(28,47,37,0.1)",
      background: "rgba(255,255,255,0.85)",
      color: "#1c2f25",
      padding: "0 14px",
      cursor: "pointer",
      fontWeight: 800,
    },

    mobileMenu: {
      position: "relative",
      zIndex: 5,
      margin: "0 18px 12px",
      padding: 14,
      borderRadius: 18,
      background: "rgba(255,255,255,0.86)",
      border: "1px solid rgba(28,47,37,0.08)",
      boxShadow: "0 22px 45px rgba(40,70,52,0.1)",
      display: "grid",
      gap: 10,
    },

    mobileLink: {
      color: "#52625a",
      fontWeight: 800,
      padding: "8px 4px",
    },

    mobileButton: {
      height: 48,
      border: 0,
      borderRadius: 14,
      background: "#294d38",
      color: "#ffffff",
      fontWeight: 800,
    },

    main: {
      position: "relative",
      zIndex: 2,
      padding: isMobile ? "18px 16px 58px" : "24px 40px 72px",
    },

    hero: {
      maxWidth: 1500,
      margin: "0 auto",
      minHeight: isMobile ? "auto" : "620px",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1.02fr 0.92fr",
      gap: isMobile ? 24 : 36,
      alignItems: "center",
    },

    heroLeft: {
      minWidth: 0,
    },

    kicker: {
      margin: "0 0 18px",
      color: "#7b8f83",
      fontSize: 13,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    },

    title: {
      margin: 0,
      maxWidth: 720,
      fontSize: isMobile ? 44 : isTablet ? 58 : 72,
      lineHeight: 0.98,
      fontWeight: 900,
      letterSpacing: 0,
      color: "#1b2e24",
    },

    subtitle: {
      margin: "24px 0 0",
      maxWidth: 720,
      color: "#5f6f66",
      fontSize: isMobile ? 17 : 21,
      lineHeight: 1.7,
      fontWeight: 500,
    },

    buttonRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 14,
      marginTop: 32,
      alignItems: isMobile ? "stretch" : "center",
    },

    primaryButton: {
      height: 54,
      border: 0,
      borderRadius: 14,
      background: "#294d38",
      color: "#ffffff",
      padding: "0 24px",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 850,
      boxShadow: "0 22px 38px rgba(41,77,56,0.2)",
    },

    secondaryButton: {
      height: 54,
      borderRadius: 14,
      border: "1px solid rgba(28,47,37,0.08)",
      background: "rgba(255,255,255,0.82)",
      color: "#1d3026",
      padding: "0 24px",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 850,
      boxShadow: "0 18px 38px rgba(40,70,52,0.07)",
    },

    infoRow: {
      marginTop: 28,
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : compact
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))",
      gap: 14,
      maxWidth: 760,
    },

    infoCard: {
      minHeight: 78,
      borderRadius: 16,
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(255,255,255,0.86)",
      padding: "16px 18px",
      boxShadow: "0 22px 45px rgba(40,70,52,0.08)",
    },

    infoLabel: {
      display: "block",
      color: "#7d9286",
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      marginBottom: 10,
    },

    infoValue: {
      color: "#21342a",
      fontSize: 16,
      fontWeight: 850,
    },

    heroRight: {
      display: "grid",
      gap: 18,
      minWidth: 0,
    },

    logoPanel: {
      minHeight: isMobile ? 150 : 160,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 26,
      background: "rgba(255,255,255,0.78)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 26px 65px rgba(40,70,52,0.08)",
      padding: isMobile ? 18 : 24,
      overflow: "hidden",
    },

    logoImage: {
      width: "min(760px, 100%)",
      height: "auto",
      objectFit: "contain",
      filter: "drop-shadow(0 18px 28px rgba(42,86,58,0.16))",
    },

    workspaceCard: {
      borderRadius: 26,
      background: "rgba(255,255,255,0.76)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 26px 65px rgba(40,70,52,0.08)",
      padding: isMobile ? 18 : 24,
    },

    workspaceTop: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      gap: 16,
      marginBottom: 20,
    },

    workspaceLabel: {
      margin: "0 0 10px",
      color: "#7b8f83",
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    },

    workspaceTitle: {
      margin: 0,
      color: "#1b2e24",
      fontSize: isMobile ? 28 : 34,
      lineHeight: 1.05,
      fontWeight: 900,
      letterSpacing: 0,
    },

    livePill: {
      height: 34,
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      background: "#dceee3",
      color: "#355c42",
      padding: "0 14px",
      fontSize: 14,
      fontWeight: 850,
      whiteSpace: "nowrap",
    },

    workspaceGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.15fr 1fr 1fr",
      gap: 14,
    },

    workspaceLarge: {
      minHeight: 220,
      borderRadius: 20,
      background: "rgba(236,246,239,0.92)",
      padding: 20,
    },

    workspaceSmall: {
      minHeight: 220,
      borderRadius: 20,
      background: "rgba(236,246,239,0.92)",
      padding: 20,
    },

    blockLabel: {
      margin: "0 0 16px",
      color: "#7b8f83",
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    },

    blockTitle: {
      margin: "0 0 12px",
      color: "#1d3026",
      fontSize: isMobile ? 24 : 26,
      lineHeight: 1.1,
      fontWeight: 900,
      letterSpacing: 0,
    },

    blockText: {
      margin: 0,
      color: "#67776e",
      fontSize: 16,
      lineHeight: 1.65,
      fontWeight: 500,
    },

    smallStat: {
      display: "block",
      color: "#14241b",
      fontSize: 44,
      lineHeight: 1,
      letterSpacing: "0.08em",
      marginBottom: 12,
    },

    bottomSection: {
      maxWidth: 1500,
      margin: isMobile ? "56px auto 0" : "72px auto 0",
    },

    bottomHeader: {
      marginBottom: 20,
    },

    bottomKicker: {
      margin: 0,
      color: "#7b8f83",
      fontSize: 13,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    },

    bottomTitle: {
      margin: "12px 0 0",
      maxWidth: 720,
      color: "#1b2e24",
      fontSize: isMobile ? 34 : 48,
      lineHeight: 1.02,
      fontWeight: 900,
      letterSpacing: 0,
    },

    featureGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)",
      gap: 14,
    },

    featureCard: {
      borderRadius: 20,
      background: "rgba(255,255,255,0.74)",
      border: "1px solid rgba(255,255,255,0.88)",
      padding: 22,
      boxShadow: "0 22px 45px rgba(40,70,52,0.07)",
    },

    featureDot: {
      width: 13,
      height: 13,
      borderRadius: 999,
      background: "linear-gradient(135deg, #7bcf9b, #d6b86e)",
      marginBottom: 18,
    },

    featureTitle: {
      margin: 0,
      color: "#1d3026",
      fontSize: 21,
      fontWeight: 900,
      letterSpacing: 0,
    },

    featureText: {
      margin: "12px 0 0",
      color: "#607268",
      fontSize: 15,
      lineHeight: 1.72,
    },

    footer: {
      maxWidth: 1500,
      margin: isMobile ? "56px auto 0" : "72px auto 0",
      padding: isMobile ? "22px 0 0" : "24px 0 0",
      borderTop: "1px solid rgba(28,47,37,0.12)",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 14,
      color: "#607268",
      fontSize: 14,
      fontWeight: 700,
    },

    footerBrand: {
      color: "#294d38",
      fontWeight: 900,
    },

    footerLinks: {
      display: "flex",
      flexWrap: "wrap",
      gap: isMobile ? 14 : 22,
    },

    footerLink: {
      color: "#607268",
      textDecoration: "none",
      fontWeight: 800,
    },
  };
}
