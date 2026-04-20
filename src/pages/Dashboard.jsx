import React, { useEffect, useMemo, useState } from "react";
import flouraiLogo from "../assets/Text_Logo.png";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.flourai.io";

const DEFAULT_TABS = ["Overview", "Activity", "Members", "Sessions", "Settings"];

const DEFAULT_WEEKLY_ACTIVITY = [
  { label: "Mon", minutes: 0 },
  { label: "Tue", minutes: 0 },
  { label: "Wed", minutes: 0 },
  { label: "Thu", minutes: 0 },
  { label: "Fri", minutes: 0 },
  { label: "Sat", minutes: 0 },
  { label: "Sun", minutes: 0 },
];

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

function formatMinutes(minutes = 0) {
  const value = Number(minutes || 0);
  const hrs = Math.floor(value / 60);
  const mins = value % 60;

  if (hrs <= 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function getInitials(name = "") {
  return String(name)
    .split(" ")
    .map((part) => part?.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function apiRequest(path, options = {}, fallbackError = "Request failed") {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data.error || fallbackError);
  }

  return data;
}

function MemberAvatar({ src, name, size = 44, style = {} }) {
  const initials = getInitials(name || "M");

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #d9f3df, #b8e6c5)",
        color: "#17331f",
        fontWeight: 700,
        fontSize: size > 42 ? 16 : 13,
        border: "1px solid rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        border: "1px dashed rgba(23,51,31,0.15)",
        background: "rgba(255,255,255,0.65)",
        color: "#526256",
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
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

  const [activityOverview, setActivityOverview] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");

  const [workspaceSettings, setWorkspaceSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const [selectedDepartmentKey, setSelectedDepartmentKey] = useState("staffing");
  const [selectedDepartmentMemberId, setSelectedDepartmentMemberId] = useState("");
  const [assigningDepartment, setAssigningDepartment] = useState(false);
  const [removingDepartmentUserId, setRemovingDepartmentUserId] = useState("");

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);
  const [selectedMemberLoading, setSelectedMemberLoading] = useState(false);
  const [selectedMemberError, setSelectedMemberError] = useState("");

  const [warningInput, setWarningInput] = useState("");
  const [suspensionInput, setSuspensionInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [deletingItemId, setDeletingItemId] = useState("");
  const [savingWarning, setSavingWarning] = useState(false);
  const [savingSuspension, setSavingSuspension] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#edf6ef";
    document.body.style.fontFamily =
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    document.documentElement.style.background = "#edf6ef";

    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.background = "";
      document.body.style.fontFamily = "";
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

        const meData = await apiRequest("/api/auth/me", {}, "Failed to load user");

        setUser(meData.user || null);

        if (meData.user?.robloxId) {
          try {
            const avatarData = await apiRequest(
              `/api/auth/avatar/${meData.user.robloxId}`,
              {},
              "Failed to load avatar"
            );

            if (avatarData.ok && avatarData.imageUrl) {
              setAvatar(avatarData.imageUrl);
            }
          } catch {
            // ignore avatar failure
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

      const data = await apiRequest(
        "/api/workspace/access",
        {},
        "Failed to load workspace access"
      );

      setWorkspaceAccess(data);
    } catch (err) {
      setAccessError(err.message || "Failed to load workspace access");
    } finally {
      setAccessLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError("");

      const data = await apiRequest(
        "/api/workspace/members",
        {},
        "Failed to load members"
      );

      setMembers(Array.isArray(data.members) ? data.members : []);
      setMembersLoaded(true);
    } catch (err) {
      setMembersError(err.message || "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  const loadActivityOverview = async () => {
    try {
      setActivityLoading(true);
      setActivityError("");

      const data = await apiRequest(
        "/api/workspace/activity/overview",
        {},
        "Failed to load activity overview"
      );

      setActivityOverview(data);
    } catch (err) {
      setActivityError(err.message || "Failed to load activity overview");
    } finally {
      setActivityLoading(false);
    }
  };

  const loadWorkspaceSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError("");

      const data = await apiRequest(
        "/api/workspace/settings",
        {},
        "Failed to load workspace settings"
      );

      setWorkspaceSettings(data.settings || null);
    } catch (err) {
      setSettingsError(err.message || "Failed to load workspace settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadWorkspaceAccess();
    loadActivityOverview();
    loadWorkspaceSettings();
    loadMembers();
  }, [user]);

  const loadMemberProfile = async (userId) => {
    if (!userId) return;

    try {
      setSelectedMemberLoading(true);
      setSelectedMemberError("");

      const data = await apiRequest(
        `/api/workspace/members/${userId}/profile`,
        {},
        "Failed to load member profile"
      );

      setSelectedMemberId(userId);
      setSelectedMemberProfile(data.member || null);
      setWarningInput("");
      setSuspensionInput("");
      setNoteInput("");
    } catch (err) {
      setSelectedMemberError(err.message || "Failed to load member profile");
    } finally {
      setSelectedMemberLoading(false);
    }
  };

  const refreshMembers = async () => {
    try {
      setRefreshingMembers(true);
      setMembersError("");

      await apiRequest(
        "/api/workspace/members/refresh",
        { method: "POST" },
        "Failed to refresh members"
      );

      setMembersLoaded(false);

      await Promise.all([
        loadMembers(),
        loadWorkspaceAccess(),
        loadActivityOverview(),
        loadWorkspaceSettings(),
      ]);

      if (selectedMemberId) {
        await loadMemberProfile(selectedMemberId);
      }
    } catch (err) {
      setMembersError(err.message || "Failed to refresh members");
    } finally {
      setRefreshingMembers(false);
    }
  };

  const assignDepartmentMember = async () => {
    if (!selectedDepartmentKey || !selectedDepartmentMemberId) return;

    try {
      setAssigningDepartment(true);
      setSettingsError("");

      const data = await apiRequest(
        `/api/workspace/settings/departments/${selectedDepartmentKey}/members`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: selectedDepartmentMemberId,
          }),
        },
        "Failed to assign member"
      );

      setWorkspaceSettings((prev) => ({
        ...(prev || {}),
        departments: data.departments,
      }));

      setSelectedDepartmentMemberId("");

      await Promise.all([loadWorkspaceAccess(), loadMembers(), loadWorkspaceSettings()]);
    } catch (err) {
      setSettingsError(err.message || "Failed to assign member");
    } finally {
      setAssigningDepartment(false);
    }
  };

  const removeDepartmentMember = async (departmentKey, userId) => {
    if (!departmentKey || !userId) return;

    try {
      setRemovingDepartmentUserId(userId);
      setSettingsError("");

      const data = await apiRequest(
        `/api/workspace/settings/departments/${departmentKey}/members/${userId}`,
        { method: "DELETE" },
        "Failed to remove member"
      );

      setWorkspaceSettings((prev) => ({
        ...(prev || {}),
        departments: data.departments,
      }));

      await Promise.all([loadWorkspaceAccess(), loadMembers(), loadWorkspaceSettings()]);
    } catch (err) {
      setSettingsError(err.message || "Failed to remove member");
    } finally {
      setRemovingDepartmentUserId("");
    }
  };

  const closeMemberDrawer = () => {
    setSelectedMemberId(null);
    setSelectedMemberProfile(null);
    setSelectedMemberError("");
    setWarningInput("");
    setSuspensionInput("");
    setNoteInput("");
    setDeletingItemId("");
  };

  const createMemberItem = async (type) => {
    if (!selectedMemberId) return;

    const configMap = {
      warning: {
        endpoint: "warnings",
        body: { reason: warningInput.trim() },
        valid: !!warningInput.trim(),
        setSaving: setSavingWarning,
        clear: () => setWarningInput(""),
      },
      suspension: {
        endpoint: "suspensions",
        body: { details: suspensionInput.trim() },
        valid: !!suspensionInput.trim(),
        setSaving: setSavingSuspension,
        clear: () => setSuspensionInput(""),
      },
      note: {
        endpoint: "notes",
        body: { body: noteInput.trim() },
        valid: !!noteInput.trim(),
        setSaving: setSavingNote,
        clear: () => setNoteInput(""),
      },
    };

    const config = configMap[type];
    if (!config || !config.valid) return;

    try {
      config.setSaving(true);
      setSelectedMemberError("");

      const data = await apiRequest(
        `/api/workspace/members/${selectedMemberId}/${config.endpoint}`,
        {
          method: "POST",
          body: JSON.stringify(config.body),
        },
        `Failed to add ${type}`
      );

      setSelectedMemberProfile(data.member || null);
      config.clear();

      await Promise.all([loadMembers(), loadActivityOverview()]);
    } catch (err) {
      setSelectedMemberError(err.message || `Failed to add ${type}`);
    } finally {
      config.setSaving(false);
    }
  };

  const deleteMemberItem = async (type, itemId) => {
    if (!selectedMemberId || !itemId) return;

    const configMap = {
      warning: {
        endpoint: `warnings/${itemId}`,
        errorText: "Failed to delete warning",
      },
      suspension: {
        endpoint: `suspensions/${itemId}`,
        errorText: "Failed to delete suspension",
      },
      note: {
        endpoint: `notes/${itemId}`,
        errorText: "Failed to delete note",
      },
    };

    const config = configMap[type];
    if (!config) return;

    try {
      setDeletingItemId(itemId);
      setSelectedMemberError("");

      const data = await apiRequest(
        `/api/workspace/members/${selectedMemberId}/${config.endpoint}`,
        { method: "DELETE" },
        config.errorText
      );

      setSelectedMemberProfile(data.member || null);

      await Promise.all([loadMembers(), loadActivityOverview()]);
    } catch (err) {
      setSelectedMemberError(err.message || config.errorText);
    } finally {
      setDeletingItemId("");
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
        member.roleName?.toLowerCase().includes(query) ||
        member.departmentLabel?.toLowerCase().includes(query)
      );
    });
  }, [members, memberSearch]);

  const permissions = workspaceAccess?.permissions || {};
  const canRefreshMembers = !!permissions.canRefreshMembers;
  const canWarn = !!permissions.canWarn;
  const canSuspend = !!permissions.canSuspend;
  const canAddNotes = !!permissions.canAddNotes;
  const canViewActivity = !!permissions.canViewActivity;
  const canManageWebsite = !!permissions.canManageWebsite;
  const canManageSettings = !!permissions.canManageSettings;

  const workspaceName = workspaceAccess?.workspace?.name || "Flourai Panel";
  const workspaceRoleLabel = workspaceAccess?.viewer?.roleLabel || "Connected";
  const lastMemberSync = workspaceAccess?.workspace?.lastMemberSync || "";

  const activitySummary = activityOverview?.summary || {
    totalMembers: members.length,
    totalMinutes: 0,
    activeMembers: 0,
    averageMinutes: 0,
    onTrackMembers: 0,
    quotaRate: 0,
    targetMinutes: 30,
  };

  const departmentCollection =
    workspaceSettings?.departments ||
    workspaceAccess?.workspace?.departments ||
    {};

  const departmentList = Object.values(departmentCollection || {});
  const safeDepartmentKey =
    selectedDepartmentKey && departmentCollection?.[selectedDepartmentKey]
      ? selectedDepartmentKey
      : departmentList[0]?.key || "";

  const selectedDepartment = departmentCollection?.[safeDepartmentKey] || null;

  const activityWeekly = Array.isArray(activityOverview?.weekly)
    ? activityOverview.weekly
    : DEFAULT_WEEKLY_ACTIVITY;

  const activityTopMembers = Array.isArray(activityOverview?.topMembers)
    ? activityOverview.topMembers
    : [];

  const styles = getStyles({ isMobile, isTablet, sidebarOpen });

  return (
    <div style={styles.page}>
      {isMobile && sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {selectedMemberId && (
        <>
          <div style={styles.drawerOverlay} onClick={closeMemberDrawer} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div style={styles.drawerHeaderLeft}>
                <MemberAvatar
                  src={selectedMemberProfile?.avatar}
                  name={selectedMemberProfile?.displayName || "Member"}
                  size={64}
                />

                <div style={{ minWidth: 0 }}>
                  <h2 style={styles.drawerTitle}>
                    {selectedMemberProfile?.displayName || "Loading member..."}
                  </h2>

                  <p style={styles.drawerSubtitle}>
                    {selectedMemberProfile?.username
                      ? `@${selectedMemberProfile.username}`
                      : ""}
                  </p>

                  <div style={styles.badgeRow}>
                    {selectedMemberProfile?.roleLabel && (
                      <span style={styles.badge}>{selectedMemberProfile.roleLabel}</span>
                    )}
                    {selectedMemberProfile?.departmentLabel && (
                      <span style={styles.softBadge}>
                        {selectedMemberProfile.departmentLabel}
                      </span>
                    )}
                    <span style={styles.softBadge}>
                      Weekly: {formatMinutes(selectedMemberProfile?.weeklyTotalMinutes || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <button style={styles.iconButton} onClick={closeMemberDrawer}>
                ✕
              </button>
            </div>

            {selectedMemberError && <div style={styles.error}>{selectedMemberError}</div>}

            {selectedMemberLoading && !selectedMemberProfile ? (
              <div style={styles.loading}>Loading member profile...</div>
            ) : selectedMemberProfile ? (
              <div style={styles.drawerBody}>
                <div style={styles.panel}>
                  <div style={styles.sectionLabel}>Profile</div>
                  <div style={styles.statsGrid4}>
                    <div style={styles.metricCard}>
                      <div style={styles.metricLabel}>Warnings</div>
                      <div style={styles.metricValue}>
                        {selectedMemberProfile.warnings?.length || 0}
                      </div>
                    </div>
                    <div style={styles.metricCard}>
                      <div style={styles.metricLabel}>Suspensions</div>
                      <div style={styles.metricValue}>
                        {selectedMemberProfile.suspensions?.length || 0}
                      </div>
                    </div>
                    <div style={styles.metricCard}>
                      <div style={styles.metricLabel}>Notes</div>
                      <div style={styles.metricValue}>
                        {selectedMemberProfile.notes?.length || 0}
                      </div>
                    </div>
                    <div style={styles.metricCard}>
                      <div style={styles.metricLabel}>Weekly Total</div>
                      <div style={styles.metricValue}>
                        {formatMinutes(selectedMemberProfile.weeklyTotalMinutes || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {canViewActivity && (
                  <div style={styles.panel}>
                    <div style={styles.sectionLabel}>Weekly Activity</div>
                    <div style={styles.barChart}>
                      {(selectedMemberProfile.weeklyActivity || DEFAULT_WEEKLY_ACTIVITY).map(
                        (day) => {
                          const height = clamp(Number(day.minutes || 0) * 1.6, 10, 110);

                          return (
                            <div key={day.label} style={styles.barItem}>
                              <span style={styles.barValue}>{day.minutes}m</span>
                              <div style={styles.barTrack}>
                                <div
                                  style={{
                                    ...styles.barFill,
                                    height: `${height}px`,
                                  }}
                                />
                              </div>
                              <span style={styles.barLabel}>{day.label}</span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                <div style={styles.drawerColumns}>
                  <div style={styles.panel}>
                    <div style={styles.sectionLabel}>Add Warning</div>
                    <textarea
                      value={warningInput}
                      onChange={(e) => setWarningInput(e.target.value)}
                      placeholder="Enter a warning reason..."
                      style={styles.textarea}
                      disabled={!canWarn || savingWarning}
                    />
                    {canWarn && (
                      <button
                        style={styles.primaryButton}
                        onClick={() => createMemberItem("warning")}
                        disabled={savingWarning}
                      >
                        {savingWarning ? "Adding..." : "Add Warning"}
                      </button>
                    )}

                    <div style={styles.listStack}>
                      {selectedMemberProfile.warnings?.length > 0 ? (
                        selectedMemberProfile.warnings.map((item) => (
                          <div key={item.id} style={styles.listCard}>
                            <div style={styles.listCardHeader}>
                              <strong>Warning</strong>
                              {canWarn && (
                                <button
                                  style={styles.dangerGhostButton}
                                  onClick={() => deleteMemberItem("warning", item.id)}
                                  disabled={deletingItemId === item.id}
                                >
                                  {deletingItemId === item.id ? "Deleting..." : "Delete"}
                                </button>
                              )}
                            </div>
                            <div style={styles.listCardText}>{item.reason}</div>
                            <div style={styles.listCardMeta}>
                              {new Date(item.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState text="No warnings yet." />
                      )}
                    </div>
                  </div>

                  <div style={styles.panel}>
                    <div style={styles.sectionLabel}>Add Suspension</div>
                    <textarea
                      value={suspensionInput}
                      onChange={(e) => setSuspensionInput(e.target.value)}
                      placeholder="Enter suspension details..."
                      style={styles.textarea}
                      disabled={!canSuspend || savingSuspension}
                    />
                    {canSuspend && (
                      <button
                        style={styles.primaryButton}
                        onClick={() => createMemberItem("suspension")}
                        disabled={savingSuspension}
                      >
                        {savingSuspension ? "Adding..." : "Add Suspension"}
                      </button>
                    )}

                    <div style={styles.listStack}>
                      {selectedMemberProfile.suspensions?.length > 0 ? (
                        selectedMemberProfile.suspensions.map((item) => (
                          <div key={item.id} style={styles.listCard}>
                            <div style={styles.listCardHeader}>
                              <strong>Suspension</strong>
                              {canSuspend && (
                                <button
                                  style={styles.dangerGhostButton}
                                  onClick={() =>
                                    deleteMemberItem("suspension", item.id)
                                  }
                                  disabled={deletingItemId === item.id}
                                >
                                  {deletingItemId === item.id ? "Deleting..." : "Delete"}
                                </button>
                              )}
                            </div>
                            <div style={styles.listCardText}>{item.details}</div>
                            <div style={styles.listCardMeta}>
                              {new Date(item.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState text="No suspensions yet." />
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.panel}>
                  <div style={styles.sectionLabel}>Staff Notes</div>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a private staff note..."
                    style={{ ...styles.textarea, minHeight: 160 }}
                    disabled={!canAddNotes || savingNote}
                  />
                  {canAddNotes && (
                    <button
                      style={styles.primaryButton}
                      onClick={() => createMemberItem("note")}
                      disabled={savingNote}
                    >
                      {savingNote ? "Saving..." : "Save Note"}
                    </button>
                  )}

                  <div style={styles.listStack}>
                    {selectedMemberProfile.notes?.length > 0 ? (
                      selectedMemberProfile.notes.map((item) => (
                        <div key={item.id} style={styles.listCard}>
                          <div style={styles.listCardHeader}>
                            <strong>Note</strong>
                            {canAddNotes && (
                              <button
                                style={styles.dangerGhostButton}
                                onClick={() => deleteMemberItem("note", item.id)}
                                disabled={deletingItemId === item.id}
                              >
                                {deletingItemId === item.id ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>
                          <div style={styles.listCardText}>{item.body}</div>
                          <div style={styles.listCardMeta}>
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState text="No notes yet." />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState text="Unable to load this member." />
            )}
          </div>
        </>
      )}

      <aside style={styles.sidebar}>
        <div style={styles.sidebarInner}>
          <div style={styles.logoWrap}>
            <img src={flouraiLogo} alt="Flourai" style={styles.logo} />
          </div>

          {user && (
            <div style={styles.profileCard}>
              <MemberAvatar src={avatar} name={user.displayName} size={48} />
              <div style={{ minWidth: 0 }}>
                <div style={styles.profileName}>{user.displayName}</div>
                <div style={styles.profileUser}>@{user.username}</div>
                <div style={styles.profileRole}>{workspaceRoleLabel}</div>
              </div>
            </div>
          )}

          <div style={styles.navList}>
            {DEFAULT_TABS.map((tab) => {
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  style={active ? styles.navButtonActive : styles.navButton}
                  onClick={() => {
                    setActiveTab(tab);
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
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
              <div style={styles.kicker}>Workspace</div>
              <h1 style={styles.pageTitle}>{workspaceName}</h1>
            </div>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {initialLoading && !error && (
          <div style={styles.loadingCard}>Loading dashboard...</div>
        )}

        {!initialLoading && !error && user && accessLoading && (
          <div style={styles.loadingCard}>Loading workspace access...</div>
        )}

        {!initialLoading && !error && user && accessError && (
          <div style={styles.error}>{accessError}</div>
        )}

        {user && activeTab === "Overview" && (
          <div style={styles.pageStack}>
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.card, ...styles.heroCard }}>
                <div style={styles.sectionLabel}>Connected Account</div>
                <div style={styles.heroInner}>
                  <MemberAvatar src={avatar} name={user.displayName} size={68} />
                  <div>
                    <div style={styles.heroName}>{user.displayName}</div>
                    <div style={styles.heroText}>@{user.username}</div>
                    <div style={styles.heroText}>ID: {user.robloxId}</div>
                    <div style={styles.heroText}>
                      Workspace Role: {workspaceRoleLabel}
                    </div>
                    <div style={styles.heroText}>
                      Department: {workspaceAccess?.viewer?.departmentLabel || "No Department"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.sectionLabel}>Activity</div>
                <div style={styles.bigStat}>
                  {formatMinutes(activitySummary.totalMinutes)}
                </div>
                <div style={styles.mutedText}>
                  Tracked weekly activity across synced directory members.
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.sectionLabel}>Directory Count</div>
                <div style={styles.bigStat}>{membersLoaded ? members.length : "—"}</div>
                <div style={styles.mutedText}>
                  {lastMemberSync
                    ? `Last synced: ${new Date(lastMemberSync).toLocaleString()}`
                    : "Members will appear after the first sync."}
                </div>
              </div>
            </div>

            <div style={styles.twoColGrid}>
              <div style={styles.card}>
                <div style={styles.sectionLabel}>System Status</div>
                <div style={styles.sectionTitle}>Workspace is connected 🌿</div>
                <div style={styles.mutedText}>
                  This panel supports member profile records, activity totals,
                  warnings, suspensions, notes, and department-based permissions.
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.sectionLabel}>Quick Numbers</div>
                <div style={styles.pillGrid}>
                  <div style={styles.infoPill}>
                    <span>Active Members</span>
                    <strong>{activitySummary.activeMembers}</strong>
                  </div>
                  <div style={styles.infoPill}>
                    <span>Avg Weekly</span>
                    <strong>{formatMinutes(activitySummary.averageMinutes)}</strong>
                  </div>
                  <div style={styles.infoPill}>
                    <span>On Track</span>
                    <strong>{activitySummary.quotaRate}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && activeTab === "Activity" && (
          <div style={styles.pageStack}>
            <div style={styles.card}>
              <div style={styles.sectionLabel}>Activity</div>
              <div style={styles.sectionTitle}>Workspace activity overview</div>
              <div style={styles.mutedText}>
                View tracked totals, weekly trends, top performers, and quota progress.
              </div>
            </div>

            {activityError && <div style={styles.error}>{activityError}</div>}

            {activityLoading ? (
              <div style={styles.loadingCard}>Loading activity overview...</div>
            ) : (
              <>
                <div style={styles.metricGrid}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Total Tracked</div>
                    <div style={styles.metricValue}>
                      {formatMinutes(activitySummary.totalMinutes)}
                    </div>
                    <div style={styles.metricSub}>All synced members this week</div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Active Members</div>
                    <div style={styles.metricValue}>{activitySummary.activeMembers}</div>
                    <div style={styles.metricSub}>Members with logged activity</div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Weekly Average</div>
                    <div style={styles.metricValue}>
                      {formatMinutes(activitySummary.averageMinutes)}
                    </div>
                    <div style={styles.metricSub}>Average per synced member</div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Quota Completion</div>
                    <div style={styles.metricValue}>{activitySummary.quotaRate}%</div>
                    <div style={styles.metricSub}>
                      Members at {activitySummary.targetMinutes}m+
                    </div>
                  </div>
                </div>

                <div style={styles.twoColGrid}>
                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>Weekly Trend</div>
                    <div style={styles.sectionTitle}>Group activity this week</div>

                    <div style={styles.barChartLarge}>
                      {activityWeekly.map((day) => {
                        const height = clamp(Number(day.minutes || 0) * 0.8, 18, 170);

                        return (
                          <div key={day.label} style={styles.barItem}>
                            <span style={styles.barValue}>{day.minutes}m</span>
                            <div style={{ ...styles.barTrack, height: 180 }}>
                              <div
                                style={{
                                  ...styles.barFill,
                                  height: `${height}px`,
                                }}
                              />
                            </div>
                            <span style={styles.barLabel}>{day.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.sectionLabel}>Top Performers</div>
                    <div style={styles.sectionTitle}>Most active members</div>

                    <div style={styles.listStack}>
                      {activityTopMembers.length > 0 ? (
                        activityTopMembers.map((member, index) => (
                          <button
                            key={member.userId}
                            style={styles.rankRow}
                            onClick={() => loadMemberProfile(member.userId)}
                          >
                            <div style={styles.rankRowLeft}>
                              <div style={styles.rankNumber}>#{index + 1}</div>
                              <MemberAvatar
                                src={member.avatar}
                                name={member.displayName}
                                size={42}
                              />
                              <div style={{ textAlign: "left", minWidth: 0 }}>
                                <div style={styles.rankName}>{member.displayName}</div>
                                <div style={styles.rankMeta}>
                                  @{member.username} •{" "}
                                  {member.roleLabel || member.roleName || "Member"}
                                </div>
                              </div>
                            </div>
                            <div style={styles.rankTime}>
                              {formatMinutes(member.weeklyTotalMinutes)}
                            </div>
                          </button>
                        ))
                      ) : (
                        <EmptyState text="No activity data yet." />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {user && activeTab === "Members" && (
          <div style={styles.pageStack}>
            <div style={styles.card}>
              <div style={styles.membersHeader}>
                <div>
                  <div style={styles.sectionLabel}>Directory</div>
                  <div style={styles.sectionTitle}>Members</div>
                </div>

                <div style={styles.membersActions}>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    style={styles.searchInput}
                  />

                  {canRefreshMembers && (
                    <button
                      style={styles.secondaryButton}
                      onClick={refreshMembers}
                      disabled={refreshingMembers}
                    >
                      {refreshingMembers ? "Refreshing..." : "Refresh"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.summaryGrid2}>
              <div style={styles.card}>
                <div style={styles.sectionLabel}>Total Members</div>
                <div style={styles.bigStat}>
                  {membersLoading ? "..." : filteredMembers.length}
                </div>
                <div style={styles.mutedText}>Showing synced directory members</div>
              </div>

              <div style={styles.card}>
                <div style={styles.sectionLabel}>Connected User</div>
                <div style={styles.sectionTitle}>{user.displayName}</div>
                <div style={styles.mutedText}>
                  {workspaceRoleLabel} • currently signed in
                </div>
              </div>
            </div>

            {membersError && <div style={styles.error}>{membersError}</div>}

            {membersLoading ? (
              <div style={styles.loadingCard}>Loading members...</div>
            ) : filteredMembers.length > 0 ? (
              <div style={styles.memberGrid}>
                {filteredMembers.map((member) => (
                  <button
                    key={member.userId}
                    style={styles.memberCard}
                    onClick={() => loadMemberProfile(member.userId)}
                  >
                    <div style={styles.memberCardTop}>
                      <MemberAvatar
                        src={member.avatar}
                        name={member.displayName}
                        size={52}
                      />

                      <div style={{ textAlign: "left", minWidth: 0 }}>
                        <div style={styles.memberCardName}>{member.displayName}</div>
                        <div style={styles.memberCardUser}>@{member.username}</div>
                      </div>
                    </div>

                    <div style={styles.badgeRow}>
                      <span style={styles.badge}>
                        {member.roleLabel || member.roleName || "Member"}
                      </span>

                      {member.departmentLabel && (
                        <span style={styles.softBadge}>{member.departmentLabel}</span>
                      )}

                      {member.isConnectedUser && (
                        <span style={styles.softBadge}>Connected Account</span>
                      )}

                      <span style={styles.softBadge}>
                        {formatMinutes(member.weeklyTotalMinutes || 0)} this week
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState text="No synced members were found in the directory yet." />
            )}
          </div>
        )}

        {user && activeTab === "Sessions" && (
          <div style={styles.pageStack}>
            <div style={styles.card}>
              <div style={styles.sectionLabel}>Sessions</div>
              <div style={styles.sectionTitle}>Training and session management</div>
              <div style={styles.mutedText}>
                This section is ready for trainings, host claims, attendance,
                and session history.
              </div>
            </div>

            <div style={styles.twoColGrid}>
              <div style={styles.card}>
                <div style={styles.sectionLabel}>Upcoming</div>
                <div style={styles.sectionTitle}>Next scheduled sessions</div>

                <div style={styles.listStack}>
                  <div style={styles.sessionRow}>
                    <strong>Orientation Training</strong>
                    <span>Today • 7:00 PM</span>
                  </div>
                  <div style={styles.sessionRow}>
                    <strong>Staff Development</strong>
                    <span>Tomorrow • 6:30 PM</span>
                  </div>
                  <div style={styles.sessionRow}>
                    <strong>Leadership Review</strong>
                    <span>Friday • 8:00 PM</span>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.sectionLabel}>Status</div>
                <div style={styles.sectionTitle}>Session controls</div>

                <div style={styles.listStack}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong>Host claiming</strong>
                      <div style={styles.settingSub}>
                        Allow one host to claim a live training slot.
                      </div>
                    </div>
                    <span style={styles.statusOn}>Enabled</span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Attendance tracking</strong>
                      <div style={styles.settingSub}>
                        Track who attended each session.
                      </div>
                    </div>
                    <span style={styles.statusOn}>Enabled</span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Session reminders</strong>
                      <div style={styles.settingSub}>
                        Push reminders before scheduled events.
                      </div>
                    </div>
                    <span style={styles.statusOff}>Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && activeTab === "Settings" && (
          <div style={styles.pageStack}>
            <div style={styles.card}>
              <div style={styles.sectionLabel}>Settings</div>
              <div style={styles.sectionTitle}>Workspace configuration</div>
              <div style={styles.mutedText}>
                Manage department access, moderation tools, sessions, and future website permissions.
              </div>
            </div>

            {settingsError && <div style={styles.error}>{settingsError}</div>}
            {settingsLoading && (
              <div style={styles.loadingCard}>Loading workspace settings...</div>
            )}

            <div style={styles.settingsGrid}>
              <div style={styles.settingsCard}>
                <div style={styles.sectionLabel}>Department Permissions</div>

                <div style={styles.listStack}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong>Warnings system</strong>
                      <div style={styles.settingSub}>
                        Current access for your assigned department.
                      </div>
                    </div>
                    <span style={canWarn ? styles.statusOn : styles.statusOff}>
                      {canWarn ? "Allowed" : "No Access"}
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Suspension records</strong>
                      <div style={styles.settingSub}>
                        Current access for your assigned department.
                      </div>
                    </div>
                    <span style={canSuspend ? styles.statusOn : styles.statusOff}>
                      {canSuspend ? "Allowed" : "No Access"}
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Private staff notes</strong>
                      <div style={styles.settingSub}>
                        Current access for your assigned department.
                      </div>
                    </div>
                    <span style={canAddNotes ? styles.statusOn : styles.statusOff}>
                      {canAddNotes ? "Allowed" : "No Access"}
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Activity visibility</strong>
                      <div style={styles.settingSub}>
                        View weekly activity and summaries.
                      </div>
                    </div>
                    <span style={canViewActivity ? styles.statusOn : styles.statusOff}>
                      {canViewActivity ? "Allowed" : "No Access"}
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Website controls</strong>
                      <div style={styles.settingSub}>
                        Reserved for future communications tools.
                      </div>
                    </div>
                    <span style={canManageWebsite ? styles.statusOn : styles.statusOff}>
                      {canManageWebsite ? "Allowed" : "Soon"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.settingsCard}>
                <div style={styles.sectionLabel}>Department Manager</div>

                <div style={styles.formStack}>
                  <div>
                    <label style={styles.inputLabel}>Department</label>
                    <div style={styles.selectWrap}>
                      <select
                        value={safeDepartmentKey}
                        onChange={(e) => setSelectedDepartmentKey(e.target.value)}
                        style={styles.select}
                        disabled={!canManageSettings}
                      >
                        {departmentList.map((department) => (
                          <option key={department.key} value={department.key}>
                            {department.label}
                          </option>
                        ))}
                      </select>
                      <span style={styles.selectArrow}>⌄</span>
                    </div>
                  </div>

                  <div>
                    <label style={styles.inputLabel}>Add member</label>
                    <div style={styles.selectWrap}>
                      <select
                        value={selectedDepartmentMemberId}
                        onChange={(e) => setSelectedDepartmentMemberId(e.target.value)}
                        style={styles.select}
                        disabled={!canManageSettings}
                      >
                        <option value="">Select a member...</option>
                        {members.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.displayName} (@{member.username})
                          </option>
                        ))}
                      </select>
                      <span style={styles.selectArrow}>⌄</span>
                    </div>
                  </div>

                  {canManageSettings && (
                    <button
                      style={styles.primaryButton}
                      onClick={assignDepartmentMember}
                      disabled={!selectedDepartmentMemberId || assigningDepartment}
                    >
                      {assigningDepartment ? "Saving..." : "Assign to Department"}
                    </button>
                  )}

                  {selectedDepartment && (
                    <>
                      <div style={styles.subCard}>
                        <div style={styles.sectionTitle}>{selectedDepartment.label}</div>

                        <div style={styles.badgeRow}>
                          <span
                            style={
                              selectedDepartment.permissions?.canWarn
                                ? styles.permissionOn
                                : styles.permissionOff
                            }
                          >
                            Warn
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canSuspend
                                ? styles.permissionOn
                                : styles.permissionOff
                            }
                          >
                            Suspend
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canAddNotes
                                ? styles.permissionOn
                                : styles.permissionOff
                            }
                          >
                            Notes
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canViewActivity
                                ? styles.permissionOn
                                : styles.permissionOff
                            }
                          >
                            View Activity
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canManageWebsite
                                ? styles.permissionOn
                                : styles.permissionOff
                            }
                          >
                            Website
                          </span>
                        </div>
                      </div>

                      <div style={styles.listStack}>
                        {Array.isArray(selectedDepartment.members) &&
                        selectedDepartment.members.length > 0 ? (
                          selectedDepartment.members.map((member) => (
                            <div key={member.userId} style={styles.departmentRow}>
                              <div style={styles.departmentRowLeft}>
                                <MemberAvatar
                                  src={member.avatar}
                                  name={member.displayName}
                                  size={42}
                                />
                                <div>
                                  <div style={styles.rankName}>{member.displayName}</div>
                                  <div style={styles.rankMeta}>
                                    @{member.username} •{" "}
                                    {member.roleLabel || member.roleName || "Member"}
                                  </div>
                                </div>
                              </div>

                              {canManageSettings && (
                                <button
                                  style={styles.dangerGhostButton}
                                  onClick={() =>
                                    removeDepartmentMember(
                                      selectedDepartment.key,
                                      member.userId
                                    )
                                  }
                                  disabled={removingDepartmentUserId === member.userId}
                                >
                                  {removingDepartmentUserId === member.userId
                                    ? "Removing..."
                                    : "Remove"}
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <EmptyState text="No members in this department yet." />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={styles.settingsCard}>
                <div style={styles.sectionLabel}>Workspace</div>

                <div style={styles.listStack}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong>Auto refresh members</strong>
                      <div style={styles.settingSub}>
                        Refresh synced member directory on demand.
                      </div>
                    </div>
                    <span style={styles.statusOn}>
                      {canRefreshMembers ? "Allowed" : "Limited"}
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Department</strong>
                      <div style={styles.settingSub}>
                        Your currently assigned internal team.
                      </div>
                    </div>
                    <span style={styles.statusOff}>
                      {workspaceAccess?.viewer?.departmentLabel || "No Department"}
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Activity quotas</strong>
                      <div style={styles.settingSub}>
                        Weekly target currently set to{" "}
                        {activitySummary.targetMinutes || 30} minutes.
                      </div>
                    </div>
                    <span style={styles.statusOn}>
                      {activitySummary.targetMinutes || 30}m
                    </span>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong>Member sync status</strong>
                      <div style={styles.settingSub}>
                        View last successful workspace sync.
                      </div>
                    </div>
                    <span style={styles.statusOff}>
                      {lastMemberSync
                        ? new Date(lastMemberSync).toLocaleDateString()
                        : "Pending"}
                    </span>
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

function getStyles({ isMobile, isTablet, sidebarOpen }) {
  const sidebarWidth = 260;

  return {
    page: {
      minHeight: "100vh",
      display: "flex",
      background:
        "radial-gradient(circle at top left, rgba(202,232,207,0.7), transparent 35%), #edf6ef",
      color: "#17331f",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(13, 22, 17, 0.28)",
      zIndex: 20,
    },

    sidebar: {
      position: isMobile ? "fixed" : "sticky",
      top: 0,
      left: 0,
      width: sidebarWidth,
      height: "100vh",
      transform: isMobile
        ? sidebarOpen
          ? "translateX(0)"
          : "translateX(-100%)"
        : "translateX(0)",
      transition: "transform 0.25s ease",
      zIndex: 30,
      padding: 16,
      boxSizing: "border-box",
      flexShrink: 0,
    },

    sidebarInner: {
      height: "100%",
      borderRadius: 26,
      background:
        "linear-gradient(180deg, rgba(15,26,20,0.98), rgba(24,42,31,0.96))",
      color: "#fff",
      padding: 18,
      boxSizing: "border-box",
      boxShadow: "0 24px 50px rgba(14, 26, 18, 0.22)",
      border: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },

    logoWrap: {
      height: 76,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 8px 12px",
      boxSizing: "border-box",
      overflow: "hidden",
    },

    logo: {
      width: 172,
      maxWidth: "100%",
      height: "auto",
      objectFit: "contain",
      display: "block",
    },

    profileCard: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 12,
    },

    profileName: {
      fontWeight: 700,
      fontSize: 14,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    profileUser: {
      fontSize: 12,
      color: "rgba(255,255,255,0.68)",
      marginTop: 2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    profileRole: {
      fontSize: 11,
      color: "#b7f3c9",
      marginTop: 4,
    },

    navList: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 6,
    },

    navButton: {
      border: "none",
      background: "transparent",
      color: "rgba(255,255,255,0.78)",
      padding: "12px 14px",
      borderRadius: 14,
      textAlign: "left",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      transition: "all 0.2s ease",
    },

    navButtonActive: {
      border: "1px solid rgba(183,243,201,0.3)",
      background:
        "linear-gradient(135deg, rgba(183,243,201,0.18), rgba(255,255,255,0.06))",
      color: "#fff",
      padding: "12px 14px",
      borderRadius: 14,
      textAlign: "left",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 700,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    },

    main: {
      flex: 1,
      minWidth: 0,
      padding: isMobile ? "14px 12px 24px" : "clamp(18px, 2vw, 28px)",
    },

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 22,
    },

    topBarLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },

    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.84)",
      cursor: "pointer",
      fontSize: 18,
      boxShadow: "0 10px 25px rgba(22, 48, 30, 0.06)",
    },

    kicker: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#6d8672",
      fontWeight: 700,
      marginBottom: 5,
    },

    pageTitle: {
      margin: 0,
      fontSize: "clamp(24px, 3.5vw, 38px)",
      lineHeight: 1.05,
      fontWeight: 800,
      color: "#17331f",
    },

    pageStack: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },

    card: {
      background: "rgba(255,255,255,0.82)",
      backdropFilter: "blur(10px)",
      borderRadius: 22,
      padding: isMobile ? 16 : "clamp(18px, 2vw, 24px)",
      border: "1px solid rgba(23,51,31,0.08)",
      boxShadow: "0 18px 45px rgba(22, 48, 30, 0.06)",
    },

    settingsCard: {
      background: "rgba(255,255,255,0.84)",
      backdropFilter: "blur(10px)",
      borderRadius: 22,
      padding: isMobile ? 16 : 20,
      border: "1px solid rgba(23,51,31,0.08)",
      boxShadow: "0 18px 45px rgba(22, 48, 30, 0.06)",
    },

    heroCard: {
      minHeight: 220,
    },

    heroInner: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginTop: 10,
      flexWrap: "wrap",
    },

    heroName: {
      fontSize: 24,
      fontWeight: 800,
      color: "#17331f",
      marginBottom: 6,
    },

    heroText: {
      fontSize: 14,
      color: "#5d7262",
      marginBottom: 4,
    },

    sectionLabel: {
      fontSize: 12,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#739178",
      marginBottom: 10,
    },

    sectionTitle: {
      fontSize: "clamp(18px, 2.2vw, 24px)",
      fontWeight: 800,
      color: "#17331f",
      lineHeight: 1.15,
    },

    bigStat: {
      fontSize: "clamp(28px, 4vw, 40px)",
      fontWeight: 800,
      color: "#17331f",
      marginBottom: 8,
    },

    mutedText: {
      fontSize: 14,
      lineHeight: 1.55,
      color: "#5d7262",
    },

    summaryGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr",
      gap: 18,
    },

    summaryGrid2: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 18,
    },

    twoColGrid: {
      display: "grid",
      gridTemplateColumns: isMobile || isTablet ? "1fr" : "1.1fr 1fr",
      gap: 18,
    },

    metricGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))",
      gap: 16,
    },

    metricCard: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(244,250,245,0.95))",
      borderRadius: 18,
      padding: 18,
      border: "1px solid rgba(23,51,31,0.08)",
      boxShadow: "0 12px 30px rgba(22, 48, 30, 0.05)",
    },

    metricLabel: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#739178",
      fontWeight: 700,
      marginBottom: 8,
    },

    metricValue: {
      fontSize: 28,
      fontWeight: 800,
      color: "#17331f",
      marginBottom: 6,
    },

    metricSub: {
      fontSize: 13,
      color: "#5d7262",
      lineHeight: 1.45,
    },

    statsGrid4: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
      gap: 14,
    },

    pillGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: 12,
      marginTop: 10,
    },

    infoPill: {
      borderRadius: 16,
      background: "rgba(237,246,239,0.95)",
      border: "1px solid rgba(23,51,31,0.08)",
      padding: 14,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      color: "#27432e",
      fontSize: 14,
      fontWeight: 600,
    },

    membersHeader: {
      display: "flex",
      alignItems: isMobile ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 14,
      flexDirection: isMobile ? "column" : "row",
    },

    membersActions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },

    searchInput: {
      minWidth: isMobile ? "100%" : 240,
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid rgba(23,51,31,0.12)",
      background: "rgba(255,255,255,0.9)",
      color: "#17331f",
      outline: "none",
      fontSize: 14,
    },

    memberGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 16,
    },

    memberCard: {
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.86)",
      borderRadius: 20,
      padding: 16,
      cursor: "pointer",
      textAlign: "left",
      boxShadow: "0 14px 30px rgba(22, 48, 30, 0.05)",
    },

    memberCardTop: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
    },

    memberCardName: {
      fontSize: 16,
      fontWeight: 800,
      color: "#17331f",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    memberCardUser: {
      fontSize: 13,
      color: "#637767",
      marginTop: 4,
    },

    badgeRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },

    badge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 10px",
      borderRadius: 999,
      background: "#17331f",
      color: "#fff",
      fontSize: 12,
      fontWeight: 700,
    },

    softBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 10px",
      borderRadius: 999,
      background: "#e4f2e7",
      color: "#21422a",
      fontSize: 12,
      fontWeight: 700,
      border: "1px solid rgba(23,51,31,0.08)",
    },

    barChart: {
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gap: 12,
      alignItems: "end",
      marginTop: 10,
    },

    barChartLarge: {
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gap: 12,
      alignItems: "end",
      marginTop: 14,
    },

    barItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
    },

    barValue: {
      fontSize: 12,
      fontWeight: 700,
      color: "#5a7260",
    },

    barTrack: {
      width: "100%",
      maxWidth: 42,
      height: 120,
      borderRadius: 999,
      background: "rgba(223,236,226,0.9)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      overflow: "hidden",
      border: "1px solid rgba(23,51,31,0.06)",
    },

    barFill: {
      width: "100%",
      borderRadius: 999,
      background:
        "linear-gradient(180deg, rgba(133,211,154,0.9), rgba(34,111,58,0.95))",
    },

    barLabel: {
      fontSize: 12,
      fontWeight: 800,
      color: "#48604e",
    },

    listStack: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginTop: 14,
    },

    rankRow: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.84)",
      borderRadius: 18,
      padding: 12,
      cursor: "pointer",
      textAlign: "left",
    },

    rankRowLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },

    rankNumber: {
      minWidth: 38,
      height: 38,
      borderRadius: 12,
      background: "#edf6ef",
      border: "1px solid rgba(23,51,31,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      color: "#21422a",
      fontSize: 13,
    },

    rankName: {
      fontSize: 14,
      fontWeight: 800,
      color: "#17331f",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    rankMeta: {
      fontSize: 12,
      color: "#617666",
      marginTop: 3,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    rankTime: {
      fontSize: 14,
      fontWeight: 800,
      color: "#17331f",
      whiteSpace: "nowrap",
    },

    sessionRow: {
      borderRadius: 16,
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.86)",
      padding: 14,
      display: "flex",
      justifyContent: "space-between",
      gap: 14,
      alignItems: "center",
      color: "#27432e",
      fontSize: 14,
      flexWrap: "wrap",
    },

    settingsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1.15fr 1fr",
      gap: 18,
    },

    settingRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 16,
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(23,51,31,0.08)",
      flexWrap: "wrap",
    },

    settingSub: {
      fontSize: 13,
      lineHeight: 1.45,
      color: "#5c7260",
      marginTop: 4,
    },

    statusOn: {
      padding: "7px 10px",
      borderRadius: 999,
      background: "#dff5e4",
      color: "#1f6a36",
      fontSize: 12,
      fontWeight: 800,
      border: "1px solid rgba(31,106,54,0.12)",
      whiteSpace: "nowrap",
    },

    statusOff: {
      padding: "7px 10px",
      borderRadius: 999,
      background: "#eef1ef",
      color: "#6a756d",
      fontSize: 12,
      fontWeight: 800,
      border: "1px solid rgba(23,51,31,0.08)",
      whiteSpace: "nowrap",
    },

    formStack: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },

    inputLabel: {
      display: "block",
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#6d8672",
      marginBottom: 8,
    },

    selectWrap: {
      position: "relative",
    },

    select: {
      width: "100%",
      padding: "14px 44px 14px 16px",
      borderRadius: 16,
      border: "1px solid rgba(33, 66, 42, 0.12)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,250,245,0.94))",
      fontSize: 14,
      fontWeight: 600,
      color: "#17331f",
      outline: "none",
      boxSizing: "border-box",
      boxShadow: "0 10px 24px rgba(22,48,30,0.05)",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    selectArrow: {
      position: "absolute",
      right: 16,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      fontSize: 12,
      color: "#5f7565",
      fontWeight: 800,
    },

    subCard: {
      borderRadius: 18,
      background: "rgba(237,246,239,0.95)",
      border: "1px solid rgba(23,51,31,0.08)",
      padding: 16,
    },

    permissionOn: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 10px",
      borderRadius: 999,
      background: "#dff5e4",
      color: "#1f6a36",
      fontSize: 12,
      fontWeight: 800,
      border: "1px solid rgba(31,106,54,0.12)",
    },

    permissionOff: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 10px",
      borderRadius: 999,
      background: "#eef1ef",
      color: "#6a756d",
      fontSize: 12,
      fontWeight: 800,
      border: "1px solid rgba(23,51,31,0.08)",
    },

    departmentRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "center",
      padding: 12,
      borderRadius: 16,
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.82)",
      flexWrap: "wrap",
    },

    departmentRowLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },

    primaryButton: {
      border: "none",
      background: "linear-gradient(135deg, #17331f, #21462d)",
      color: "#fff",
      padding: "12px 22px",
      borderRadius: 18,
      fontWeight: 800,
      fontSize: 13,
      cursor: "pointer",
      boxShadow: "0 10px 20px rgba(22,48,30,0.1)",
      alignSelf: "flex-start",
      marginTop: 12,
    },

    secondaryButton: {
      border: "1px solid rgba(23,51,31,0.12)",
      background: "rgba(255,255,255,0.9)",
      color: "#17331f",
      padding: "12px 16px",
      borderRadius: 14,
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
    },

    dangerGhostButton: {
      border: "1px solid rgba(179,60,60,0.15)",
      background: "rgba(255,245,245,0.9)",
      color: "#b24242",
      padding: "8px 12px",
      borderRadius: 12,
      fontWeight: 700,
      fontSize: 12,
      cursor: "pointer",
    },

    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.9)",
      color: "#17331f",
      fontSize: 16,
      cursor: "pointer",
      flexShrink: 0,
    },

    drawerOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(13, 22, 17, 0.34)",
      zIndex: 40,
    },

    drawer: {
      position: "fixed",
      top: 0,
      right: 0,
      width: isMobile ? "100%" : isTablet ? "100%" : "min(960px, 88vw)",
      height: "100vh",
      background: "#f4faf5",
      zIndex: 50,
      overflowY: "auto",
      boxSizing: "border-box",
      padding: isMobile ? 18 : 24,
      boxShadow: "-24px 0 60px rgba(14,26,18,0.18)",
    },

    drawerHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
      marginBottom: 18,
    },

    drawerHeaderLeft: {
      display: "flex",
      gap: 14,
      alignItems: "center",
      minWidth: 0,
    },

    drawerTitle: {
      margin: 0,
      fontSize: 24,
      lineHeight: 1.1,
      fontWeight: 800,
      color: "#17331f",
    },

    drawerSubtitle: {
      margin: "5px 0 0",
      fontSize: 14,
      color: "#667a6b",
    },

    drawerBody: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      paddingBottom: 24,
    },

    drawerColumns: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 16,
    },

    panel: {
      borderRadius: 24,
      background: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(23,51,31,0.06)",
      boxShadow: "0 10px 30px rgba(22,48,30,0.04)",
      padding: isMobile ? 16 : 22,
    },

    textarea: {
      width: "100%",
      minHeight: 120,
      borderRadius: 20,
      border: "1px solid rgba(23,51,31,0.1)",
      background: "#fcfcfc",
      padding: "18px 18px",
      resize: "vertical",
      fontSize: 15,
      color: "#17331f",
      boxSizing: "border-box",
      outline: "none",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
    },

    listCard: {
      borderRadius: 16,
      border: "1px solid rgba(23,51,31,0.08)",
      background: "rgba(255,255,255,0.84)",
      padding: 14,
    },

    listCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
      flexWrap: "wrap",
    },

    listCardText: {
      fontSize: 14,
      lineHeight: 1.55,
      color: "#27432e",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },

    listCardMeta: {
      fontSize: 12,
      color: "#6b7f70",
      marginTop: 10,
    },

    loadingCard: {
      padding: 18,
      borderRadius: 18,
      background: "rgba(255,255,255,0.82)",
      border: "1px solid rgba(23,51,31,0.08)",
      color: "#5e7362",
      fontWeight: 600,
    },

    loading: {
      padding: 18,
      borderRadius: 18,
      background: "rgba(255,255,255,0.82)",
      border: "1px solid rgba(23,51,31,0.08)",
      color: "#5e7362",
      fontWeight: 600,
    },

    error: {
      padding: 14,
      borderRadius: 16,
      background: "rgba(255,235,235,0.95)",
      border: "1px solid rgba(194,74,74,0.14)",
      color: "#a33b3b",
      fontWeight: 600,
    },
  };
}
