import React, { useEffect, useState } from "react";
import flouraiLogo from "../assets/Text_Logo.png";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.flourai.io";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#edf6ef";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.background = "#edf6ef";

    const loadUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load user");
        }

        setUser(data.user);

        if (data.user?.robloxId) {
          const avatarRes = await fetch(
            `${API_BASE}/api/auth/avatar/${data.user.robloxId}`,
            {
              credentials: "include",
            }
          );

          const avatarData = await avatarRes.json();

          if (avatarData.ok && avatarData.imageUrl) {
            setAvatar(avatarData.imageUrl);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      }
    };

    loadUser();

    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.background = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
      document.documentElement.style.background = "";
    };
  }, []);

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarGlow} />

        <div style={styles.sidebarTop}>
          <div style={styles.logoWrap}>
            <div style={styles.logoGlow} />
            <img src={flouraiLogo} alt="Flourai" style={styles.logoImage} />
          </div>
        </div>

        {user && (
          <div style={styles.profileCard}>
            <div style={styles.profileGlow} />

            <div style={styles.avatar}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${user.displayName} avatar`}
                  style={styles.avatarImg}
                />
              ) : (
                user.displayName?.charAt(0)?.toUpperCase() || "F"
              )}
            </div>

            <div style={styles.profileTextWrap}>
              <div style={styles.profileName}>{user.displayName}</div>
              <div style={styles.profileUser}>@{user.username}</div>
            </div>
          </div>
        )}

        <div style={styles.nav}>
          <div style={styles.navActive}>Overview</div>
          <div style={styles.navItem}>Activity</div>
          <div style={styles.navItem}>Members</div>
          <div style={styles.navItem}>Sessions</div>
          <div style={styles.navItem}>Settings</div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Workspace</p>
            <h1 style={styles.title}>Flourai Panel</h1>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {!user && !error && <div style={styles.loading}>Loading...</div>}

        {user && (
          <>
            <div style={styles.grid}>
              <div style={styles.cardLarge}>
                <p style={styles.label}>Connected Account</p>

                <div style={styles.accountProfileCard}>
                  <div style={styles.accountProfileGlow} />

                  <div style={styles.accountAvatar}>
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={`${user.displayName} avatar`}
                        style={styles.accountAvatarImg}
                      />
                    ) : (
                      user.displayName?.charAt(0)?.toUpperCase() || "F"
                    )}
                  </div>

                  <div style={styles.accountInfo}>
                    <h2 style={styles.accountName}>{user.displayName}</h2>
                    <p style={styles.accountUsername}>@{user.username}</p>
                    <p style={styles.accountId}>ID: {user.robloxId}</p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <p style={styles.label}>Weekly Activity</p>
                <h2 style={styles.stat}>0h</h2>
                <p style={styles.sub}>Tracked time</p>
              </div>

              <div style={styles.card}>
                <p style={styles.label}>Members</p>
                <h2 style={styles.stat}>0</h2>
                <p style={styles.sub}>Workspace users</p>
              </div>
            </div>

            <div style={styles.bottomCard}>
              <p style={styles.label}>System Status</p>
              <h3 style={styles.bottomTitle}>Flourai workspace is active 🌿</h3>
              <p style={styles.sub}>
                Your environment is connected and ready for activity tracking,
                sessions, and management tools.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    background:
      "radial-gradient(circle at top left, rgba(123,207,155,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(191,232,208,0.26), transparent 30%), linear-gradient(180deg, #f6fbf6, #edf6ef)",
    fontFamily: "Inter, sans-serif",
    color: "#203229",
    overflow: "hidden",
  },

  sidebar: {
    position: "relative",
    minHeight: "100vh",
    padding: "20px 18px",
    background: "linear-gradient(180deg, #2f5d46 0%, #1d3d2e 100%)",
    color: "white",
    boxShadow: "10px 0 40px rgba(0,0,0,0.22)",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },

  sidebarGlow: {
    position: "absolute",
    top: "-100px",
    left: "-40px",
    width: "260px",
    height: "260px",
    background:
      "radial-gradient(circle, rgba(128,255,182,0.20), transparent 72%)",
    pointerEvents: "none",
  },

  sidebarTop: {
    marginBottom: "18px",
    position: "relative",
    zIndex: 1,
  },

  logoWrap: {
    width: "100%",
    height: "136px",
    borderRadius: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
    border: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "180px",
    height: "180px",
    transform: "translate(-50%, -50%)",
    background:
      "radial-gradient(circle, rgba(120,255,170,0.16), transparent 70%)",
    filter: "blur(18px)",
    pointerEvents: "none",
  },

  logoImage: {
    height: "92px",
    width: "auto",
    display: "block",
    marginLeft: "-1px",
    filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.25))",
    userSelect: "none",
    pointerEvents: "none",
    position: "relative",
    zIndex: 1,
  },

  profileCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.16), 0 0 24px rgba(124,255,180,0.08)",
    overflow: "hidden",
  },

  profileGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(143,255,190,0.14), transparent 46%)",
    pointerEvents: "none",
  },

  avatar: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#4f8b67",
    border: "2px solid rgba(255,255,255,0.15)",
    boxShadow:
      "0 0 0 3px rgba(124,255,180,0.15), 0 0 25px rgba(124,255,180,0.35), inset 0 1px 6px rgba(255,255,255,0.18)",
    flexShrink: 0,
    overflow: "hidden",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
    display: "block",
  },

  profileTextWrap: {
    minWidth: 0,
  },

  profileName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.2,
  },

  profileUser: {
    fontSize: "13px",
    color: "rgba(232,245,236,0.82)",
    marginTop: "4px",
  },

  nav: {
    display: "grid",
    gap: "12px",
    marginTop: "4px",
    position: "relative",
    zIndex: 1,
  },

  navItem: {
    padding: "15px 18px",
    borderRadius: "16px",
    color: "rgba(255,255,255,0.88)",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
  },

  navActive: {
    padding: "15px 18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.14)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow:
      "0 10px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
  },

  main: {
    padding: "32px 34px",
    minWidth: 0,
  },

  header: {
    marginBottom: "22px",
  },

  kicker: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "#6f8a7d",
    margin: 0,
  },

  title: {
    fontSize: "44px",
    lineHeight: 1.05,
    margin: "10px 0 0",
    fontWeight: 800,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr",
    gap: "18px",
  },

  cardLarge: {
    background: "rgba(255,255,255,0.78)",
    borderRadius: "22px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.65)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  },

  card: {
    background: "rgba(255,255,255,0.78)",
    borderRadius: "22px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.65)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  },

  bottomCard: {
    marginTop: "20px",
    background: "rgba(255,255,255,0.78)",
    borderRadius: "22px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.65)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  },

  label: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#6f8a7d",
    margin: 0,
  },

  accountProfileCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "18px",
    padding: "18px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(237,248,240,0.95), rgba(228,242,233,0.92))",
    border: "1px solid rgba(111,160,128,0.18)",
    boxShadow:
      "0 16px 34px rgba(46,90,67,0.10), 0 0 26px rgba(113,201,145,0.10)",
    overflow: "hidden",
  },

  accountProfileGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(131,221,163,0.18), transparent 42%)",
    pointerEvents: "none",
  },

  accountAvatar: {
    width: "66px",
    height: "66px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#4f8d68",
    border: "2px solid rgba(255,255,255,0.6)",
    boxShadow:
      "0 0 0 4px rgba(124,255,180,0.18), 0 0 30px rgba(102,201,138,0.35), inset 0 2px 10px rgba(255,255,255,0.18)",
    flexShrink: 0,
    overflow: "hidden",
  },

  accountAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
    display: "block",
  },

  accountInfo: {
    minWidth: 0,
  },

  accountName: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.1,
    color: "#203229",
    fontWeight: 800,
  },

  accountUsername: {
    margin: "8px 0 0",
    fontSize: "18px",
    color: "#5b7467",
    fontWeight: 500,
  },

  accountId: {
    margin: "10px 0 0",
    fontSize: "16px",
    color: "#6b7c73",
  },

  stat: {
    fontSize: "34px",
    margin: "14px 0 8px",
    fontWeight: 700,
  },

  sub: {
    color: "#6b7c73",
    margin: "8px 0 0",
    fontSize: "16px",
  },

  bottomTitle: {
    fontSize: "26px",
    marginTop: "12px",
    marginBottom: "10px",
  },

  error: {
    background: "#ffe5e5",
    padding: "12px",
    borderRadius: "10px",
    color: "#7a2020",
  },

  loading: {
    background: "rgba(255,255,255,0.85)",
    padding: "12px",
    borderRadius: "10px",
  },
};