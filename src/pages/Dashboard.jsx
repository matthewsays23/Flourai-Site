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

const DEFAULT_TABS = ["Overview", "Activity", "Members", "Sessions", "Settings"];

export default function Dashboard() {
  const { isMobile, isTablet } = useResponsive();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const [workspaceAccess, setWorkspaceAccess] = useState(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [refreshingMembers, setRefreshingMembers] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#edf6ef";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.background = "#edf6ef";

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setInitialLoading(true);
        setError("");

        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        const meData = await meRes.json();

        if (!meRes.ok) {
          throw new Error(meData.error || "Failed to load user");
        }

        setUser(meData.user);

        if (meData.user?.robloxId) {
          try {
            const avatarRes = await fetch(
              `${API_BASE}/api/auth/avatar/${meData.user.robloxId}`,
              {
                credentials: "include",
              }
            );
            const avatarData = await avatarRes.json();

            if (avatarData.ok && avatarData.imageUrl) {
              setAvatar(avatarData.imageUrl);
            }
          } catch {
            // keep dashboard alive even if avatar fails
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setInitialLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadWorkspaceAccess = async () => {
      try {
        setAccessLoading(true);
        setAccessError("");

        const res = await fetch(`${API_BASE}/api/workspace/access`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load workspace access");
        }

        setWorkspaceAccess(data);
      } catch (err) {
        setAccessError(err.message || "Failed to load workspace access");
      } finally {
        setAccessLoading(false);
      }
    };

    loadWorkspaceAccess();
  }, [user]);

  useEffect(() => {
    if (activeTab !== "Members") return;
    if (!user) return;
    if (!workspaceAccess?.permissions?.canViewMembers) return;
    if (membersLoaded) return;

    loadMembers();
  }, [activeTab, user, workspaceAccess, membersLoaded]);

  const loadMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError("");

      const res = await fetch(`${API_BASE}/api/workspace/members`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load members");
      }

      setMembers(Array.isArray(data.members) ? data.members : []);
      setMembersLoaded(true);
    } catch (err) {
      setMembersError(err.message || "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  const refreshMembers = async () => {
    try {
      setRefreshingMembers(true);
      setMembersError("");

      const refreshRes = await fetch(
        `${API_BASE}/api/workspace/members/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const refreshData = await refreshRes.json();

      if (!refreshRes.ok) {
        throw new Error(refreshData.error || "Failed to refresh members");
      }

      await loadMembers();
    } catch (err) {
      setMembersError(err.message || "Failed to refresh members");
    } finally {
      setRefreshingMembers(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) => {
      return (
        member.displayName?.toLowerCase().includes(query) ||
        member.username?.toLowerCase().includes(query) ||
        member.roleLabel?.toLowerCase().includes(query) ||
        member.roleName?.toLowerCase().includes(query)
      );
    });
  }, [members, memberSearch]);

  const permissions = workspaceAccess?.permissions || {};
  const canViewMembers = !!permissions.canViewMembers;
  const canRefreshMembers = !!permissions.canRefreshMembers;
  const availableTabs = DEFAULT_TABS.filter((tab) => {
    if (tab === "Members" && workspaceAccess && !canViewMembers) return false;
    return true;
  });

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab("Overview");
    }
  }, [activeTab, availableTabs]);

  const workspaceName = workspaceAccess?.workspace?.name || "Flourai Panel";
  const workspaceRoleLabel = workspaceAccess?.viewer?.roleLabel || "Connected";
  const lastMemberSync = workspaceAccess?.workspace?.lastMemberSync || "";

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
              <div style={styles.profileRole}>{workspaceRoleLabel}</div>
            </div>
          </div>
        )}

        <div style={styles.nav}>
          {availableTabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <div
                key={tab}
                style={active ? styles.navActive : styles.navItem}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            );
          })}
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
              <h1 style={styles.title}>{workspaceName}</h1>
            </div>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {initialLoading && !error && (
          <div style={styles.loading}>Loading dashboard...</div>
        )}

        {!initialLoading && !error && user && accessLoading && (
          <div style={styles.loading}>Loading workspace access...</div>
        )}

        {!initialLoading && !error && user && accessError && (
          <div style={styles.error}>{accessError}</div>
        )}

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
                    <p style={styles.accountRole}>Workspace Role: {workspaceRoleLabel}</p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <p style={styles.label}>Directory Access</p>
                <h2 style={styles.stat}>{canViewMembers ? "Yes" : "No"}</h2>
                <p style={styles.sub}>
                  {canViewMembers
                    ? "You can open the Members directory."
                    : "Your group role is not bound to the Members directory."}
                </p>
              </div>

              <div style={styles.card}>
                <p style={styles.label}>Directory Count</p>
                <h2 style={styles.stat}>{membersLoaded ? members.length : "—"}</h2>
                <p style={styles.sub}>
                  {lastMemberSync
                    ? `Last synced: ${new Date(lastMemberSync).toLocaleString()}`
                    : "Members will appear after the first sync."}
                </p>
              </div>
            </div>

            <div style={styles.bottomCard}>
              <p style={styles.label}>System Status</p>
              <h3 style={styles.bottomTitle}>Workspace is connected 🌿</h3>
              <p style={styles.sub}>
                This panel is now structured for real group permissions, synced
                members, and role-bound workspace access.
              </p>
            </div>
          </>
        )}

        {user && activeTab === "Members" && (
          <div style={styles.membersWrap}>
            {!canViewMembers ? (
              <div style={styles.lockedCard}>
                <p style={styles.label}>Restricted</p>
                <h3 style={styles.bottomTitle}>You do not have access to Members</h3>
                <p style={styles.sub}>
                  Your current Roblox group role is not included in the bound
                  roles for the directory.
                </p>
              </div>
            ) : (
              <>
                <div style={styles.membersTopBar}>
                  <div>
                    <p style={styles.label}>Directory</p>
                    <h2 style={styles.membersTitle}>Members</h2>
                  </div>

                  <div style={styles.membersActions}>
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      style={styles.memberSearch}
                    />

                    {canRefreshMembers && (
                      <button
                        style={styles.refreshButton}
                        onClick={refreshMembers}
                        disabled={refreshingMembers}
                      >
                        {refreshingMembers ? "Refreshing..." : "Refresh"}
                      </button>
                    )}
                  </div>
                </div>

                <div style={styles.membersSummaryRow}>
                  <div style={styles.summaryCard}>
                    <p style={styles.label}>Total Members</p>
                    <h2 style={styles.stat}>
                      {membersLoading ? "..." : filteredMembers.length}
                    </h2>
                    <p style={styles.sub}>Visible in directory</p>
                  </div>

                  <div style={styles.summaryCard}>
                    <p style={styles.label}>Connected User</p>
                    <h2 style={styles.summaryName}>{user.displayName}</h2>
                    <p style={styles.sub}>
                      {workspaceRoleLabel} • currently signed in
                    </p>
                  </div>
                </div>

                {membersError && <div style={styles.error}>{membersError}</div>}

                {membersLoading ? (
                  <div style={styles.loading}>Loading members...</div>
                ) : filteredMembers.length > 0 ? (
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
                            <span style={styles.memberBadge}>
                              {member.roleLabel || member.roleName || "Member"}
                            </span>

                            {member.isConnectedUser && (
                              <span style={styles.memberBadgeSoft}>
                                Connected Account
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    No directory members were found for the currently bound
                    roles.
                  </div>
                )}
              </>
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
              This section will hold workspace options, role binds, and access
              controls.
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
      position: "relative",
      zIndex: 1,
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
      position: "relative",
      zIndex: 1,
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

    profileRole: {
      fontSize: "12px",
      color: "rgba(190,245,211,0.95)",
      marginTop: "6px",
      fontWeight: 700,
      letterSpacing: "0.04em",
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

    lockedCard: {
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

    accountRole: {
      margin: "10px 0 0",
      fontSize: isMobile ? "15px" : "16px",
      color: "#2f5d46",
      fontWeight: 700,
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
      borderRadius: "12px",
      color: "#7a2020",
      border: "1px solid rgba(122,32,32,0.08)",
    },

    loading: {
      background: "rgba(255,255,255,0.85)",
      padding: "12px 14px",
      borderRadius: "12px",
      color: "#203229",
      border: "1px solid rgba(47,93,70,0.08)",
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

    membersActions: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexDirection: isMobile ? "column" : "row",
      width: isMobile ? "100%" : "auto",
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

    refreshButton: {
      padding: "14px 18px",
      borderRadius: "16px",
      border: "1px solid rgba(47,93,70,0.12)",
      background: "#2f5d46",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 25px rgba(47,93,70,0.18)",
      minWidth: "110px",
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

    memberBadgeSoft: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
      color: "#5b7467",
      background: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(47,93,70,0.08)",
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