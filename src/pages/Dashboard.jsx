import React, { useEffect, useMemo, useState } from "react";
import flouraiLogo from "../assets/Text_Logo.png";

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
    isMobile: width < 900,
    isTablet: width >= 900 && width < 1200,
  };
}

export default function Dashboard() {
  const { isMobile, isTablet } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("Overview");

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");

  const [memberSearch, setMemberSearch] = useState("");

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

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const mockMembers = useMemo(() => {
    const baseMembers = [
      {
        userId: "1",
        displayName: "Avery",
        username: "flouraiteam",
        role: "Leadership",
        avatar: "",
      },
      {
        userId: "2",
        displayName: "Luna",
        username: "gardenops",
        role: "Management",
        avatar: "",
      },
      {
        userId: "3",
        displayName: "Rowan",
        username: "botanicalstaff",
        role: "Staff",
        avatar: "",
      },
      {
        userId: "4",
        displayName: "Iris",
        username: "teacoordinator",
        role: "Sessions",
        avatar: "",
      },
      {
        userId: "5",
        displayName: "Sage",
        username: "communitycare",
        role: "Moderation",
        avatar: "",
      },
    ];

    if (user) {
      return [
        {
          userId: user.robloxId,
          displayName: user.displayName,
          username: user.username,
          role: "Connected Account",
          avatar,
        },
        ...baseMembers,
      ];
    }

    return baseMembers;
  }, [user, avatar]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) return mockMembers;

    return mockMembers.filter((member) => {
      return (
        member.displayName?.toLowerCase().includes(query) ||
        member.username?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    });
  }, [mockMembers, memberSearch]);

  const styles = createStyles({ isMobile, isTablet, sidebarOpen });

  return (
    <div style={styles.page}>
      {isMobile && sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

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
          <div
            style={activeTab === "Overview" ? styles.navActive : styles.navItem}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </div>

          <div
            style={activeTab === "Activity" ? styles.navActive : styles.navItem}
            onClick={() => setActiveTab("Activity")}
          >
            Activity
          </div>

          <div
            style={activeTab === "Members" ? styles.navActive : styles.navItem}
            onClick={() => setActiveTab("Members")}
          >
            Members
          </div>

          <div
            style={activeTab === "Sessions" ? styles.navActive : styles.navItem}
            onClick={() => setActiveTab("Sessions")}
          >
            Sessions
          </div>

          <div
            style={activeTab === "Settings" ? styles.navActive : styles.navItem}
            onClick={() => setActiveTab("Settings")}
          >
            Settings
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {isMobile && (
              <button
                style={styles.menuButton}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                ☰
              </button>
            )}

            <div>
              <p style={styles.kicker}>Workspace</p>
              <h1 style={styles.title}>Flourai Panel</h1>
            </div>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {!user && !error && <div style={styles.loading}>Loading...</div>}

        {user && activeTab === "Overview" && (
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
                <h2 style={styles.stat}>{mockMembers.length}</h2>
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

        {user && activeTab === "Members" && (
          <div style={styles.membersWrap}>
            <div style={styles.membersTopBar}>
              <div>
                <p style={styles.label}>Directory</p>
                <h2 style={styles.membersTitle}>Members</h2>
              </div>

              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={styles.memberSearch}
              />
            </div>

            <div style={styles.membersSummaryRow}>
              <div style={styles.summaryCard}>
                <p style={styles.label}>Total Members</p>
                <h2 style={styles.stat}>{filteredMembers.length}</h2>
                <p style={styles.sub}>Visible in directory</p>
              </div>

              <div style={styles.summaryCard}>
                <p style={styles.label}>Connected User</p>
                <h2 style={styles.summaryName}>{user.displayName}</h2>
                <p style={styles.sub}>Currently signed in</p>
              </div>
            </div>

            <div style={styles.membersGrid}>
              {filteredMembers.map((member) => (
                <div key={member.userId} style={styles.memberCard}>
                  <div style={styles.memberGlow} />

                  <div style={styles.memberAvatar}>
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={`${member.displayName} avatar`}
                        style={styles.memberAvatarImg}
                      />
                    ) : (
                      member.displayName?.charAt(0)?.toUpperCase() || "M"
                    )}
                  </div>

                  <div style={styles.memberText}>
                    <h3 style={styles.memberName}>{member.displayName}</h3>
                    <p style={styles.memberUsername}>@{member.username}</p>
                    <div style={styles.memberMetaRow}>
                      <span style={styles.memberBadge}>{member.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div style={styles.emptyState}>
                No members matched your search.
              </div>
            )}
          </div>
        )}

        {user && activeTab === "Activity" && (
          <div style={styles.placeholderCard}>
            <p style={styles.label}>Activity</p>
            <h3 style={styles.bottomTitle}>Activity panel coming next</h3>
            <p style={styles.sub}>
              This section will show tracked time, trends, and top performers.
            </p>
          </div>
        )}

        {user && activeTab === "Sessions" && (
          <div style={styles.placeholderCard}>
            <p style={styles.label}>Sessions</p>
            <h3 style={styles.bottomTitle}>Sessions panel coming next</h3>
            <p style={styles.sub}>
              This section will manage trainings, events, and session records.
            </p>
          </div>
        )}

        {user && activeTab === "Settings" && (
          <div style={styles.placeholderCard}>
            <p style={styles.label}>Settings</p>
            <h3 style={styles.bottomTitle}>Settings panel coming next</h3>
            <p style={styles.sub}>
              This section will hold workspace options, roles, and controls.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function createStyles({ isMobile, isTablet, sidebarOpen }) {
  return {
    page: {
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
      background:
        "radial-gradient(circle at top left, rgba(123,207,155,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(191,232,208,0.26), transparent 30%), linear-gradient(180deg, #f6fbf6, #edf6ef)",
      fontFamily: "Inter, sans-serif",
      color: "#203229",
      overflow: "hidden",
      position: "relative",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(16, 25, 20, 0.42)",
      zIndex: 19,
    },

    sidebar: {
      position: isMobile ? "fixed" : "relative",
      top: 0,
      left: isMobile ? (sidebarOpen ? 0 : "-100%") : 0,
      bottom: 0,
      width: isMobile ? "86vw" : "auto",
      maxWidth: isMobile ? "320px" : "none",
      minHeight: "100vh",
      padding: "20px 18px",
      background: "linear-gradient(180deg, #2f5d46 0%, #1d3d2e 100%)",
      color: "white",
      boxShadow: "10px 0 40px rgba(0,0,0,0.22)",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
      zIndex: 20,
      transition: isMobile ? "left 0.25s ease" : "none",
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
      maxWidth: "100%",
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
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    profileUser: {
      fontSize: "13px",
      color: "rgba(232,245,236,0.82)",
      marginTop: "4px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
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
      transition: "background 0.18s ease, transform 0.18s ease",
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
      cursor: "pointer",
    },

    main: {
      padding: isMobile ? "18px 16px 28px" : isTablet ? "28px 24px" : "32px 34px",
      minWidth: 0,
      width: "100%",
    },

    header: {
      marginBottom: "22px",
    },

    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    menuButton: {
      border: "1px solid rgba(47,93,70,0.12)",
      background: "rgba(255,255,255,0.86)",
      color: "#203229",
      width: "46px",
      height: "46px",
      borderRadius: "14px",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: 700,
      boxShadow: "0 10px 30px rgba(30,60,40,0.06)",
      flexShrink: 0,
    },

    kicker: {
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: "#6f8a7d",
      margin: 0,
    },

    title: {
      fontSize: isMobile ? "34px" : isTablet ? "40px" : "44px",
      lineHeight: 1.05,
      margin: "10px 0 0",
      fontWeight: 800,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
        ? "1fr 1fr"
        : "1.5fr 1fr 1fr",
      gap: "18px",
    },

    cardLarge: {
      gridColumn: isTablet ? "1 / -1" : "auto",
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: isMobile ? "20px" : "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      minWidth: 0,
    },

    card: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: isMobile ? "20px" : "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      minWidth: 0,
    },

    bottomCard: {
      marginTop: "20px",
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: isMobile ? "20px" : "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      minWidth: 0,
    },

    placeholderCard: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: isMobile ? "20px" : "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      minWidth: 0,
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
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
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
      width: isMobile ? "60px" : "66px",
      height: isMobile ? "60px" : "66px",
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
      fontSize: isMobile ? "24px" : "28px",
      lineHeight: 1.1,
      color: "#203229",
      fontWeight: 800,
      wordBreak: "break-word",
    },

    accountUsername: {
      margin: "8px 0 0",
      fontSize: isMobile ? "16px" : "18px",
      color: "#5b7467",
      fontWeight: 500,
      wordBreak: "break-word",
    },

    accountId: {
      margin: "10px 0 0",
      fontSize: isMobile ? "15px" : "16px",
      color: "#6b7c73",
      wordBreak: "break-word",
    },

    stat: {
      fontSize: isMobile ? "30px" : "34px",
      margin: "14px 0 8px",
      fontWeight: 700,
    },

    sub: {
      color: "#6b7c73",
      margin: "8px 0 0",
      fontSize: isMobile ? "15px" : "16px",
      lineHeight: 1.6,
    },

    bottomTitle: {
      fontSize: isMobile ? "22px" : "26px",
      marginTop: "12px",
      marginBottom: "10px",
      lineHeight: 1.2,
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

    membersWrap: {
      display: "grid",
      gap: "18px",
    },

    membersTopBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: "14px",
      flexDirection: isMobile ? "column" : "row",
    },

    membersTitle: {
      margin: "10px 0 0",
      fontSize: isMobile ? "28px" : "34px",
      lineHeight: 1.1,
      fontWeight: 800,
      color: "#203229",
    },

    memberSearch: {
      width: isMobile ? "100%" : "320px",
      padding: "14px 16px",
      borderRadius: "16px",
      border: "1px solid rgba(47,93,70,0.12)",
      outline: "none",
      fontSize: "15px",
      background: "rgba(255,255,255,0.86)",
      color: "#203229",
      boxShadow: "0 10px 30px rgba(30,60,40,0.05)",
    },

    membersSummaryRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "18px",
    },

    summaryCard: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: isMobile ? "20px" : "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      minWidth: 0,
    },

    summaryName: {
      fontSize: isMobile ? "24px" : "28px",
      margin: "14px 0 8px",
      fontWeight: 700,
      color: "#203229",
    },

    membersGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
        ? "1fr 1fr"
        : "repeat(3, 1fr)",
      gap: "18px",
    },

    memberCard: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "18px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      minWidth: 0,
      overflow: "hidden",
    },

    memberGlow: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at top left, rgba(131,221,163,0.14), transparent 42%)",
      pointerEvents: "none",
    },

    memberAvatar: {
      width: "62px",
      height: "62px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#4f8d68",
      border: "2px solid rgba(255,255,255,0.6)",
      boxShadow:
        "0 0 0 4px rgba(124,255,180,0.16), 0 0 28px rgba(102,201,138,0.28), inset 0 2px 10px rgba(255,255,255,0.18)",
      flexShrink: 0,
      overflow: "hidden",
      position: "relative",
      zIndex: 1,
    },

    memberAvatarImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      borderRadius: "50%",
    },

    memberText: {
      minWidth: 0,
      position: "relative",
      zIndex: 1,
    },

    memberName: {
      margin: 0,
      fontSize: "22px",
      lineHeight: 1.1,
      fontWeight: 800,
      color: "#203229",
      wordBreak: "break-word",
    },

    memberUsername: {
      margin: "6px 0 0",
      fontSize: "15px",
      color: "#5b7467",
      wordBreak: "break-word",
    },

    memberMetaRow: {
      marginTop: "10px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },

    memberBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
      color: "#2f5d46",
      background: "rgba(191, 232, 208, 0.55)",
      border: "1px solid rgba(111,160,128,0.18)",
    },

    emptyState: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
      color: "#5b7467",
      fontSize: "16px",
    },
  };
}