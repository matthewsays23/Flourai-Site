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

function formatMinutes(minutes = 0) {
  const value = Number(minutes || 0);
  const hrs = Math.floor(value / 60);
  const mins = value % 60;
  if (hrs <= 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part?.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function createMockWeeklyActivity(member) {
  const seed = Number(member?.userId || 1) % 7;
  return [
    { label: "Mon", minutes: 15 + seed * 3 },
    { label: "Tue", minutes: 22 + seed * 4 },
    { label: "Wed", minutes: 12 + seed * 5 },
    { label: "Thu", minutes: 34 + seed * 2 },
    { label: "Fri", minutes: 41 + seed * 3 },
    { label: "Sat", minutes: 28 + seed * 4 },
    { label: "Sun", minutes: 19 + seed * 2 },
  ];
}

function sumMinutes(items = []) {
  return items.reduce((total, item) => total + Number(item.minutes || 0), 0);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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

  const [selectedMember, setSelectedMember] = useState(null);
  const [memberWarnings, setMemberWarnings] = useState({});
  const [memberSuspensions, setMemberSuspensions] = useState({});
  const [memberNotes, setMemberNotes] = useState({});
  const [warningInput, setWarningInput] = useState("");
  const [suspensionInput, setSuspensionInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

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
            // keep alive
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

  useEffect(() => {
    if (!user) return;
    loadWorkspaceAccess();
  }, [user]);

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

  useEffect(() => {
    if (!user) return;
    if (membersLoaded) return;
    loadMembers();
  }, [user, membersLoaded]);

  const refreshMembers = async () => {
    try {
      setRefreshingMembers(true);
      setMembersError("");

      const refreshRes = await fetch(`${API_BASE}/api/workspace/members/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const refreshData = await refreshRes.json();

      if (!refreshRes.ok) {
        throw new Error(refreshData.error || "Failed to refresh members");
      }

      setMembersLoaded(false);

      await Promise.all([loadMembers(), loadWorkspaceAccess()]);
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

  const enrichedMembers = useMemo(() => {
    return filteredMembers.map((member) => {
      const weeklyActivity = member.weeklyActivity || createMockWeeklyActivity(member);
      const totalWeeklyMinutes = sumMinutes(weeklyActivity);
      const warnings = memberWarnings[member.userId] || [];
      const suspensions = memberSuspensions[member.userId] || [];
      const notes = memberNotes[member.userId] || [];

      return {
        ...member,
        weeklyActivity,
        totalWeeklyMinutes,
        warnings,
        suspensions,
        notes,
      };
    });
  }, [filteredMembers, memberWarnings, memberSuspensions, memberNotes]);

  const allEnrichedMembers = useMemo(() => {
    return members.map((member) => {
      const weeklyActivity = member.weeklyActivity || createMockWeeklyActivity(member);
      const totalWeeklyMinutes = sumMinutes(weeklyActivity);
      const warnings = memberWarnings[member.userId] || [];
      const suspensions = memberSuspensions[member.userId] || [];
      const notes = memberNotes[member.userId] || [];

      return {
        ...member,
        weeklyActivity,
        totalWeeklyMinutes,
        warnings,
        suspensions,
        notes,
      };
    });
  }, [members, memberWarnings, memberSuspensions, memberNotes]);

  const activityStats = useMemo(() => {
    const baseMembers = allEnrichedMembers;
    const totalMembers = baseMembers.length;
    const totalMinutes = baseMembers.reduce(
      (total, member) => total + Number(member.totalWeeklyMinutes || 0),
      0
    );
    const activeMembers = baseMembers.filter(
      (member) => Number(member.totalWeeklyMinutes || 0) > 0
    ).length;
    const avgMinutes = totalMembers ? Math.round(totalMinutes / totalMembers) : 0;
    const targetMinutes = 30;
    const onTrackCount = baseMembers.filter(
      (member) => Number(member.totalWeeklyMinutes || 0) >= targetMinutes
    ).length;
    const quotaRate = totalMembers
      ? Math.round((onTrackCount / totalMembers) * 100)
      : 0;

    const dailyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekSeries = dailyLabels.map((label) => ({
      label,
      minutes: baseMembers.reduce((total, member) => {
        const day = member.weeklyActivity?.find((entry) => entry.label === label);
        return total + Number(day?.minutes || 0);
      }, 0),
    }));

    const topMembers = [...baseMembers]
      .sort((a, b) => b.totalWeeklyMinutes - a.totalWeeklyMinutes)
      .slice(0, 5);

    return {
      totalMembers,
      totalMinutes,
      activeMembers,
      avgMinutes,
      onTrackCount,
      quotaRate,
      weekSeries,
      topMembers,
      targetMinutes,
    };
  }, [allEnrichedMembers]);

  const selectedMemberDetails = useMemo(() => {
    if (!selectedMember) return null;

    const match = allEnrichedMembers.find(
      (member) => String(member.userId) === String(selectedMember.userId)
    );

    return match || null;
  }, [selectedMember, allEnrichedMembers]);

  useEffect(() => {
    if (!selectedMemberDetails) {
      setWarningInput("");
      setSuspensionInput("");
      setNoteInput("");
      return;
    }

    setWarningInput("");
    setSuspensionInput("");
    setNoteInput("");
  }, [selectedMemberDetails?.userId]);

  const handleOpenMember = (member) => {
    setSelectedMember(member);
  };

  const handleCloseMember = () => {
    setSelectedMember(null);
  };

  const addWarning = () => {
    if (!selectedMemberDetails || !warningInput.trim()) return;

    setMemberWarnings((prev) => {
      const current = prev[selectedMemberDetails.userId] || [];
      return {
        ...prev,
        [selectedMemberDetails.userId]: [
          {
            id: Date.now(),
            reason: warningInput.trim(),
            createdAt: new Date().toISOString(),
          },
          ...current,
        ],
      };
    });

    setWarningInput("");
  };

  const addSuspension = () => {
    if (!selectedMemberDetails || !suspensionInput.trim()) return;

    setMemberSuspensions((prev) => {
      const current = prev[selectedMemberDetails.userId] || [];
      return {
        ...prev,
        [selectedMemberDetails.userId]: [
          {
            id: Date.now(),
            details: suspensionInput.trim(),
            createdAt: new Date().toISOString(),
          },
          ...current,
        ],
      };
    });

    setSuspensionInput("");
  };

  const addNote = () => {
    if (!selectedMemberDetails || !noteInput.trim()) return;

    setMemberNotes((prev) => {
      const current = prev[selectedMemberDetails.userId] || [];
      return {
        ...prev,
        [selectedMemberDetails.userId]: [
          {
            id: Date.now(),
            body: noteInput.trim(),
            createdAt: new Date().toISOString(),
          },
          ...current,
        ],
      };
    });

    setNoteInput("");
  };

  const permissions = workspaceAccess?.permissions || {};
  const canRefreshMembers = !!permissions.canRefreshMembers;
  const availableTabs = DEFAULT_TABS;

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

      {selectedMemberDetails && (
        <>
          <div style={styles.memberDrawerOverlay} onClick={handleCloseMember} />
          <div style={styles.memberDrawer}>
            <div style={styles.memberDrawerHeader}>
              <div style={styles.memberDrawerHeaderLeft}>
                <div style={styles.memberDrawerAvatar}>
                  {selectedMemberDetails.avatar ? (
                    <img
                      src={selectedMemberDetails.avatar}
                      alt={`${selectedMemberDetails.displayName} avatar`}
                      style={styles.memberDrawerAvatarImg}
                    />
                  ) : (
                    getInitials(selectedMemberDetails.displayName || "Member")
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h2 style={styles.memberDrawerName}>
                    {selectedMemberDetails.displayName}
                  </h2>
                  <p style={styles.memberDrawerUsername}>
                    @{selectedMemberDetails.username}
                  </p>
                  <div style={styles.memberDrawerBadgeRow}>
                    <span style={styles.memberBadge}>
                      {selectedMemberDetails.roleLabel ||
                        selectedMemberDetails.roleName ||
                        "Member"}
                    </span>
                    <span style={styles.memberBadgeSoft}>
                      Weekly: {formatMinutes(selectedMemberDetails.totalWeeklyMinutes)}
                    </span>
                  </div>
                </div>
              </div>

              <button style={styles.closeDrawerButton} onClick={handleCloseMember}>
                ✕
              </button>
            </div>

            <div style={styles.memberDrawerGrid}>
              <div style={styles.drawerSection}>
                <p style={styles.label}>Profile</p>
                <div style={styles.drawerStatGrid}>
                  <div style={styles.drawerStatCard}>
                    <span style={styles.drawerStatLabel}>Warnings</span>
                    <strong style={styles.drawerStatValue}>
                      {selectedMemberDetails.warnings.length}
                    </strong>
                  </div>
                  <div style={styles.drawerStatCard}>
                    <span style={styles.drawerStatLabel}>Suspensions</span>
                    <strong style={styles.drawerStatValue}>
                      {selectedMemberDetails.suspensions.length}
                    </strong>
                  </div>
                  <div style={styles.drawerStatCard}>
                    <span style={styles.drawerStatLabel}>Notes</span>
                    <strong style={styles.drawerStatValue}>
                      {selectedMemberDetails.notes.length}
                    </strong>
                  </div>
                  <div style={styles.drawerStatCard}>
                    <span style={styles.drawerStatLabel}>Weekly Total</span>
                    <strong style={styles.drawerStatValue}>
                      {formatMinutes(selectedMemberDetails.totalWeeklyMinutes)}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={styles.drawerSection}>
                <p style={styles.label}>Weekly Activity</p>
                <div style={styles.weeklyBars}>
                  {selectedMemberDetails.weeklyActivity.map((day) => {
                    const barHeight = clamp(day.minutes * 1.6, 14, 110);
                    return (
                      <div key={day.label} style={styles.weeklyBarWrap}>
                        <div style={styles.weeklyBarTrack}>
                          <div
                            style={{
                              ...styles.weeklyBarFill,
                              height: `${barHeight}px`,
                            }}
                          />
                        </div>
                        <span style={styles.weeklyBarLabel}>{day.label}</span>
                        <span style={styles.weeklyBarValue}>{day.minutes}m</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.drawerSection}>
                <p style={styles.label}>Add Warning</p>
                <textarea
                  value={warningInput}
                  onChange={(e) => setWarningInput(e.target.value)}
                  placeholder="Enter a warning reason..."
                  style={styles.drawerTextarea}
                />
                <button style={styles.primaryButton} onClick={addWarning}>
                  Add Warning
                </button>

                <div style={styles.drawerList}>
                  {selectedMemberDetails.warnings.length > 0 ? (
                    selectedMemberDetails.warnings.map((item) => (
                      <div key={item.id} style={styles.drawerListItem}>
                        <strong style={styles.drawerListTitle}>Warning</strong>
                        <p style={styles.drawerListText}>{item.reason}</p>
                        <span style={styles.drawerListDate}>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.drawerEmpty}>No warnings yet.</div>
                  )}
                </div>
              </div>

              <div style={styles.drawerSection}>
                <p style={styles.label}>Add Suspension</p>
                <textarea
                  value={suspensionInput}
                  onChange={(e) => setSuspensionInput(e.target.value)}
                  placeholder="Enter suspension details..."
                  style={styles.drawerTextarea}
                />
                <button style={styles.primaryButton} onClick={addSuspension}>
                  Add Suspension
                </button>

                <div style={styles.drawerList}>
                  {selectedMemberDetails.suspensions.length > 0 ? (
                    selectedMemberDetails.suspensions.map((item) => (
                      <div key={item.id} style={styles.drawerListItem}>
                        <strong style={styles.drawerListTitle}>Suspension</strong>
                        <p style={styles.drawerListText}>{item.details}</p>
                        <span style={styles.drawerListDate}>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.drawerEmpty}>No suspensions yet.</div>
                  )}
                </div>
              </div>

              <div style={styles.drawerSectionFull}>
                <p style={styles.label}>Staff Notes</p>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a private staff note..."
                  style={styles.drawerTextareaLarge}
                />
                <button style={styles.primaryButton} onClick={addNote}>
                  Save Note
                </button>

                <div style={styles.drawerList}>
                  {selectedMemberDetails.notes.length > 0 ? (
                    selectedMemberDetails.notes.map((item) => (
                      <div key={item.id} style={styles.drawerListItem}>
                        <strong style={styles.drawerListTitle}>Note</strong>
                        <p style={styles.drawerListText}>{item.body}</p>
                        <span style={styles.drawerListDate}>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.drawerEmpty}>No notes yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
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
                    <p style={styles.accountRole}>
                      Workspace Role: {workspaceRoleLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <p style={styles.label}>Activity</p>
                <h2 style={styles.stat}>{formatMinutes(activityStats.totalMinutes)}</h2>
                <p style={styles.sub}>
                  Total tracked weekly activity across synced members.
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

            <div style={styles.bottomGrid}>
              <div style={styles.bottomCard}>
                <p style={styles.label}>System Status</p>
                <h3 style={styles.bottomTitle}>Workspace is connected 🌿</h3>
                <p style={styles.sub}>
                  This panel is now structured for member moderation, activity
                  visibility, session planning, and workspace configuration.
                </p>
              </div>

              <div style={styles.bottomCard}>
                <p style={styles.label}>Quick Numbers</p>
                <div style={styles.quickInfoGrid}>
                  <div style={styles.quickInfoPill}>
                    <span>Active Members</span>
                    <strong>{activityStats.activeMembers}</strong>
                  </div>
                  <div style={styles.quickInfoPill}>
                    <span>Avg Weekly</span>
                    <strong>{formatMinutes(activityStats.avgMinutes)}</strong>
                  </div>
                  <div style={styles.quickInfoPill}>
                    <span>On Track</span>
                    <strong>{activityStats.quotaRate}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {user && activeTab === "Activity" && (
          <div style={styles.panelStack}>
            <div style={styles.placeholderCard}>
              <p style={styles.label}>Activity</p>
              <h3 style={styles.bottomTitle}>Workspace activity overview</h3>
              <p style={styles.sub}>
                View tracked totals, weekly trends, top performers, and quota progress.
              </p>
            </div>

            <div style={styles.activityTopGrid}>
              <div style={styles.statCardEnhanced}>
                <span style={styles.enhancedStatLabel}>Total Tracked</span>
                <strong style={styles.enhancedStatValue}>
                  {formatMinutes(activityStats.totalMinutes)}
                </strong>
                <small style={styles.enhancedStatSub}>All synced members this week</small>
              </div>

              <div style={styles.statCardEnhanced}>
                <span style={styles.enhancedStatLabel}>Active Members</span>
                <strong style={styles.enhancedStatValue}>
                  {activityStats.activeMembers}
                </strong>
                <small style={styles.enhancedStatSub}>Members with logged activity</small>
              </div>

              <div style={styles.statCardEnhanced}>
                <span style={styles.enhancedStatLabel}>Weekly Average</span>
                <strong style={styles.enhancedStatValue}>
                  {formatMinutes(activityStats.avgMinutes)}
                </strong>
                <small style={styles.enhancedStatSub}>Average per synced member</small>
              </div>

              <div style={styles.statCardEnhanced}>
                <span style={styles.enhancedStatLabel}>Quota Completion</span>
                <strong style={styles.enhancedStatValue}>
                  {activityStats.quotaRate}%
                </strong>
                <small style={styles.enhancedStatSub}>
                  Members at {activityStats.targetMinutes}m+
                </small>
              </div>
            </div>

            <div style={styles.activityBodyGrid}>
              <div style={styles.activityChartCard}>
                <p style={styles.label}>Weekly Trend</p>
                <h3 style={styles.sectionTitle}>Group activity this week</h3>
                <div style={styles.activityChartBars}>
                  {activityStats.weekSeries.map((day) => {
                    const barHeight = clamp(day.minutes * 0.7, 18, 170);
                    return (
                      <div key={day.label} style={styles.activityChartBarItem}>
                        <span style={styles.activityChartValue}>{day.minutes}m</span>
                        <div style={styles.activityChartTrack}>
                          <div
                            style={{
                              ...styles.activityChartFill,
                              height: `${barHeight}px`,
                            }}
                          />
                        </div>
                        <span style={styles.activityChartLabel}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.activitySideCard}>
                <p style={styles.label}>Top Performers</p>
                <h3 style={styles.sectionTitle}>Most active members</h3>
                <div style={styles.topList}>
                  {activityStats.topMembers.length > 0 ? (
                    activityStats.topMembers.map((member, index) => (
                      <div
                        key={member.userId}
                        style={styles.topListItem}
                        onClick={() => handleOpenMember(member)}
                      >
                        <div style={styles.topListLeft}>
                          <div style={styles.topRank}>#{index + 1}</div>
                          <div style={styles.topAvatar}>
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.displayName}
                                style={styles.topAvatarImg}
                              />
                            ) : (
                              getInitials(member.displayName || "M")
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <strong style={styles.topName}>{member.displayName}</strong>
                            <p style={styles.topMeta}>
                              @{member.username} •{" "}
                              {member.roleLabel || member.roleName || "Member"}
                            </p>
                          </div>
                        </div>
                        <div style={styles.topTime}>
                          {formatMinutes(member.totalWeeklyMinutes)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>No activity data yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {user && activeTab === "Members" && (
          <div style={styles.membersWrap}>
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
                  {membersLoading ? "..." : enrichedMembers.length}
                </h2>
                <p style={styles.sub}>Showing synced directory members</p>
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
            ) : enrichedMembers.length > 0 ? (
              <div style={styles.membersGrid}>
                {enrichedMembers.map((member) => (
                  <div
                    key={member.userId}
                    style={styles.memberCardClickable}
                    onClick={() => handleOpenMember(member)}
                  >
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

                        <span style={styles.memberBadgeSoft}>
                          {formatMinutes(member.totalWeeklyMinutes)} this week
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                No synced members were found in the directory yet.
              </div>
            )}
          </div>
        )}

        {user && activeTab === "Sessions" && (
          <div style={styles.panelStack}>
            <div style={styles.placeholderCard}>
              <p style={styles.label}>Sessions</p>
              <h3 style={styles.bottomTitle}>Training and session management</h3>
              <p style={styles.sub}>
                This section is ready for scheduled trainings, host claims, attendance,
                and session history.
              </p>
            </div>

            <div style={styles.sessionGrid}>
              <div style={styles.sessionCard}>
                <p style={styles.label}>Upcoming</p>
                <h3 style={styles.sectionTitle}>Next scheduled sessions</h3>
                <div style={styles.sessionList}>
                  <div style={styles.sessionListItem}>
                    <strong>Orientation Training</strong>
                    <span>Today • 7:00 PM</span>
                  </div>
                  <div style={styles.sessionListItem}>
                    <strong>Staff Development</strong>
                    <span>Tomorrow • 6:30 PM</span>
                  </div>
                  <div style={styles.sessionListItem}>
                    <strong>Leadership Review</strong>
                    <span>Friday • 8:00 PM</span>
                  </div>
                </div>
              </div>

              <div style={styles.sessionCard}>
                <p style={styles.label}>Status</p>
                <h3 style={styles.sectionTitle}>Session controls</h3>
                <div style={styles.settingsList}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Host claiming</strong>
                      <p style={styles.settingSub}>
                        Allow one host to claim a live training slot.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>Enabled</div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Attendance tracking</strong>
                      <p style={styles.settingSub}>
                        Track who attended each session.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>Enabled</div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Session reminders</strong>
                      <p style={styles.settingSub}>
                        Push reminders before scheduled events.
                      </p>
                    </div>
                    <div style={styles.toggleOff}>Soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && activeTab === "Settings" && (
          <div style={styles.panelStack}>
            <div style={styles.placeholderCard}>
              <p style={styles.label}>Settings</p>
              <h3 style={styles.bottomTitle}>Workspace configuration</h3>
              <p style={styles.sub}>
                Manage directory behavior, moderation tools, sessions, and activity
                visibility from one place.
              </p>
            </div>

            <div style={styles.settingsGrid}>
              <div style={styles.settingsCard}>
                <p style={styles.label}>Moderation</p>
                <div style={styles.settingsList}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Warnings system</strong>
                      <p style={styles.settingSub}>
                        Enable warning records inside member profiles.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>Enabled</div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Suspension records</strong>
                      <p style={styles.settingSub}>
                        Save suspension history on each user.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>Enabled</div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Private staff notes</strong>
                      <p style={styles.settingSub}>
                        Keep internal notes on members.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>Enabled</div>
                  </div>
                </div>
              </div>

              <div style={styles.settingsCard}>
                <p style={styles.label}>Workspace</p>
                <div style={styles.settingsList}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Auto refresh members</strong>
                      <p style={styles.settingSub}>
                        Refresh synced member directory on demand.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>
                      {canRefreshMembers ? "Allowed" : "Limited"}
                    </div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Activity quotas</strong>
                      <p style={styles.settingSub}>
                        Weekly target currently set to 30 minutes.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>30m</div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Member sync status</strong>
                      <p style={styles.settingSub}>
                        View last successful workspace sync.
                      </p>
                    </div>
                    <div style={styles.toggleOff}>
                      {lastMemberSync
                        ? new Date(lastMemberSync).toLocaleDateString()
                        : "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

    bottomGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "20px",
      marginTop: "20px",
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

    quickInfoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginTop: "16px",
    },

    quickInfoPill: {
      background: "rgba(237,248,240,0.95)",
      border: "1px solid rgba(111,160,128,0.16)",
      borderRadius: "18px",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "14px",
      color: "#5b7467",
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

    panelStack: {
      display: "grid",
      gap: "18px",
    },

    activityTopGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
        ? "1fr 1fr"
        : "repeat(4, 1fr)",
      gap: "18px",
    },

    statCardEnhanced: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "22px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    },

    enhancedStatLabel: {
      display: "block",
      fontSize: "13px",
      color: "#6f8a7d",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "10px",
    },

    enhancedStatValue: {
      display: "block",
      fontSize: "32px",
      fontWeight: 800,
      color: "#203229",
      lineHeight: 1.1,
    },

    enhancedStatSub: {
      display: "block",
      marginTop: "10px",
      fontSize: "14px",
      color: "#6b7c73",
    },

    activityBodyGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
      gap: "18px",
    },

    activityChartCard: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    },

    activitySideCard: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    },

    sectionTitle: {
      fontSize: "22px",
      fontWeight: 800,
      color: "#203229",
      margin: "10px 0 0",
    },

    activityChartBars: {
      height: isMobile ? "220px" : "300px",
      marginTop: "26px",
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "14px",
      alignItems: "end",
    },

    activityChartBarItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "end",
      height: "100%",
      minWidth: 0,
    },

    activityChartValue: {
      fontSize: "12px",
      color: "#5b7467",
      marginBottom: "10px",
      fontWeight: 700,
    },

    activityChartTrack: {
      width: "100%",
      maxWidth: "56px",
      height: "190px",
      borderRadius: "999px",
      background: "rgba(232,242,235,0.95)",
      border: "1px solid rgba(111,160,128,0.10)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: "6px",
    },

    activityChartFill: {
      width: "100%",
      borderRadius: "999px",
      background: "linear-gradient(180deg, #72b48b 0%, #2f5d46 100%)",
      boxShadow: "0 10px 22px rgba(47,93,70,0.28)",
    },

    activityChartLabel: {
      fontSize: "12px",
      color: "#6b7c73",
      marginTop: "10px",
      fontWeight: 700,
    },

    topList: {
      display: "grid",
      gap: "12px",
      marginTop: "20px",
    },

    topListItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "14px",
      background: "rgba(237,248,240,0.95)",
      border: "1px solid rgba(111,160,128,0.12)",
      borderRadius: "18px",
      padding: "14px",
      cursor: "pointer",
    },

    topListLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
    },

    topRank: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      background: "#2f5d46",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: "12px",
      flexShrink: 0,
    },

    topAvatar: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      overflow: "hidden",
      background: "#4f8d68",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      flexShrink: 0,
    },

    topAvatarImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },

    topName: {
      display: "block",
      fontSize: "15px",
      color: "#203229",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    topMeta: {
      margin: "4px 0 0",
      fontSize: "13px",
      color: "#6b7c73",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    topTime: {
      fontSize: "14px",
      fontWeight: 800,
      color: "#2f5d46",
      flexShrink: 0,
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

    memberCardClickable: {
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
      cursor: "pointer",
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

    sessionGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "18px",
    },

    sessionCard: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    },

    sessionList: {
      display: "grid",
      gap: "12px",
      marginTop: "20px",
    },

    sessionListItem: {
      background: "rgba(237,248,240,0.95)",
      border: "1px solid rgba(111,160,128,0.14)",
      borderRadius: "18px",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      color: "#203229",
    },

    settingsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "18px",
    },

    settingsCard: {
      background: "rgba(255,255,255,0.78)",
      borderRadius: "22px",
      padding: "24px",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    },

    settingsList: {
      display: "grid",
      gap: "14px",
      marginTop: "20px",
    },

    settingRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      padding: "14px",
      borderRadius: "18px",
      background: "rgba(237,248,240,0.95)",
      border: "1px solid rgba(111,160,128,0.14)",
    },

    settingTitle: {
      display: "block",
      fontSize: "15px",
      color: "#203229",
      marginBottom: "4px",
    },

    settingSub: {
      margin: 0,
      fontSize: "13px",
      color: "#6b7c73",
      lineHeight: 1.5,
    },

    toggleOn: {
      padding: "8px 12px",
      borderRadius: "999px",
      background: "rgba(191, 232, 208, 0.75)",
      color: "#2f5d46",
      fontSize: "12px",
      fontWeight: 800,
      border: "1px solid rgba(111,160,128,0.14)",
      flexShrink: 0,
    },

    toggleOff: {
      padding: "8px 12px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.95)",
      color: "#6b7c73",
      fontSize: "12px",
      fontWeight: 800,
      border: "1px solid rgba(47,93,70,0.08)",
      flexShrink: 0,
    },

    memberDrawerOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(16, 25, 20, 0.42)",
      zIndex: 39,
    },

    memberDrawer: {
      position: "fixed",
      top: 0,
      right: 0,
      width: isMobile ? "100%" : "min(760px, 92vw)",
      height: "100vh",
      background: "linear-gradient(180deg, #f8fcf8 0%, #edf6ef 100%)",
      boxShadow: "-10px 0 40px rgba(0,0,0,0.18)",
      zIndex: 40,
      padding: isMobile ? "18px 16px 24px" : "24px 24px 28px",
      overflowY: "auto",
      borderLeft: "1px solid rgba(111,160,128,0.14)",
    },

    memberDrawerHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "16px",
      marginBottom: "18px",
    },

    memberDrawerHeaderLeft: {
      display: "flex",
      gap: "16px",
      alignItems: "center",
      minWidth: 0,
    },

    memberDrawerAvatar: {
      width: "76px",
      height: "76px",
      borderRadius: "50%",
      background: "#4f8d68",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      fontWeight: 800,
      fontSize: "22px",
      flexShrink: 0,
      boxShadow:
        "0 0 0 4px rgba(124,255,180,0.16), 0 0 28px rgba(102,201,138,0.28)",
    },

    memberDrawerAvatarImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },

    memberDrawerName: {
      margin: 0,
      fontSize: isMobile ? "26px" : "30px",
      lineHeight: 1.1,
      color: "#203229",
      fontWeight: 800,
    },

    memberDrawerUsername: {
      margin: "6px 0 0",
      fontSize: "15px",
      color: "#5b7467",
    },

    memberDrawerBadgeRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "10px",
    },

    closeDrawerButton: {
      width: "42px",
      height: "42px",
      borderRadius: "14px",
      border: "1px solid rgba(47,93,70,0.12)",
      background: "#fff",
      color: "#203229",
      fontSize: "18px",
      fontWeight: 700,
      cursor: "pointer",
      flexShrink: 0,
    },

    memberDrawerGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "18px",
    },

    drawerSection: {
      background: "rgba(255,255,255,0.84)",
      borderRadius: "22px",
      padding: "20px",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
    },

    drawerSectionFull: {
      gridColumn: isMobile ? "auto" : "1 / -1",
      background: "rgba(255,255,255,0.84)",
      borderRadius: "22px",
      padding: "20px",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
    },

    drawerStatGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "18px",
    },

    drawerStatCard: {
      background: "rgba(237,248,240,0.95)",
      borderRadius: "18px",
      border: "1px solid rgba(111,160,128,0.12)",
      padding: "14px",
      display: "grid",
      gap: "6px",
    },

    drawerStatLabel: {
      fontSize: "12px",
      color: "#6f8a7d",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },

    drawerStatValue: {
      fontSize: "22px",
      color: "#203229",
      fontWeight: 800,
    },

    weeklyBars: {
      marginTop: "20px",
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "10px",
      alignItems: "end",
      minHeight: "180px",
    },

    weeklyBarWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      minWidth: 0,
    },

    weeklyBarTrack: {
      width: "100%",
      maxWidth: "38px",
      height: "120px",
      borderRadius: "999px",
      background: "rgba(232,242,235,0.95)",
      padding: "5px",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      border: "1px solid rgba(111,160,128,0.10)",
    },

    weeklyBarFill: {
      width: "100%",
      borderRadius: "999px",
      background: "linear-gradient(180deg, #72b48b 0%, #2f5d46 100%)",
      boxShadow: "0 10px 22px rgba(47,93,70,0.20)",
    },

    weeklyBarLabel: {
      fontSize: "11px",
      color: "#6b7c73",
      fontWeight: 700,
    },

    weeklyBarValue: {
      fontSize: "11px",
      color: "#5b7467",
      fontWeight: 700,
    },

    drawerTextarea: {
      width: "100%",
      minHeight: "90px",
      resize: "vertical",
      marginTop: "16px",
      borderRadius: "16px",
      border: "1px solid rgba(47,93,70,0.12)",
      background: "#fff",
      padding: "14px",
      fontFamily: "inherit",
      fontSize: "14px",
      color: "#203229",
      outline: "none",
      boxSizing: "border-box",
    },

    drawerTextareaLarge: {
      width: "100%",
      minHeight: "120px",
      resize: "vertical",
      marginTop: "16px",
      borderRadius: "16px",
      border: "1px solid rgba(47,93,70,0.12)",
      background: "#fff",
      padding: "14px",
      fontFamily: "inherit",
      fontSize: "14px",
      color: "#203229",
      outline: "none",
      boxSizing: "border-box",
    },

    primaryButton: {
      marginTop: "12px",
      padding: "12px 16px",
      borderRadius: "14px",
      border: "1px solid rgba(47,93,70,0.12)",
      background: "#2f5d46",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 25px rgba(47,93,70,0.18)",
    },

    drawerList: {
      display: "grid",
      gap: "10px",
      marginTop: "16px",
    },

    drawerListItem: {
      background: "rgba(237,248,240,0.95)",
      borderRadius: "16px",
      border: "1px solid rgba(111,160,128,0.12)",
      padding: "14px",
      display: "grid",
      gap: "6px",
    },

    drawerListTitle: {
      fontSize: "14px",
      color: "#203229",
    },

    drawerListText: {
      margin: 0,
      fontSize: "14px",
      color: "#5b7467",
      lineHeight: 1.5,
      whiteSpace: "pre-wrap",
    },

    drawerListDate: {
      fontSize: "12px",
      color: "#6f8a7d",
      fontWeight: 700,
    },

    drawerEmpty: {
      background: "rgba(255,255,255,0.84)",
      borderRadius: "16px",
      border: "1px dashed rgba(111,160,128,0.18)",
      padding: "14px",
      color: "#6b7c73",
      fontSize: "14px",
    },
  };
}