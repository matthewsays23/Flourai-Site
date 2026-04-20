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

const DEFAULT_WEEKLY_ACTIVITY = [
  { label: "Mon", minutes: 0 },
  { label: "Tue", minutes: 0 },
  { label: "Wed", minutes: 0 },
  { label: "Thu", minutes: 0 },
  { label: "Fri", minutes: 0 },
  { label: "Sat", minutes: 0 },
  { label: "Sun", minutes: 0 },
];

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

  const loadActivityOverview = async () => {
    try {
      setActivityLoading(true);
      setActivityError("");

      const res = await fetch(`${API_BASE}/api/workspace/activity/overview`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load activity overview");
      }

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

      const res = await fetch(`${API_BASE}/api/workspace/settings`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load workspace settings");
      }

      setWorkspaceSettings(data.settings);
    } catch (err) {
      setSettingsError(err.message || "Failed to load workspace settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadWorkspaceAccess();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (membersLoaded) return;
    loadMembers();
  }, [user, membersLoaded]);

  useEffect(() => {
    if (!user) return;
    loadActivityOverview();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadWorkspaceSettings();
  }, [user]);

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

      const res = await fetch(
        `${API_BASE}/api/workspace/settings/departments/${selectedDepartmentKey}/members`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedDepartmentMemberId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to assign member");
      }

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

      const res = await fetch(
        `${API_BASE}/api/workspace/settings/departments/${departmentKey}/members/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

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

  const loadMemberProfile = async (userId) => {
    try {
      setSelectedMemberLoading(true);
      setSelectedMemberError("");

      const res = await fetch(
        `${API_BASE}/api/workspace/members/${userId}/profile`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load member profile");
      }

      setSelectedMemberId(userId);
      setSelectedMemberProfile(data.member);
      setWarningInput("");
      setSuspensionInput("");
      setNoteInput("");
    } catch (err) {
      setSelectedMemberError(err.message || "Failed to load member profile");
    } finally {
      setSelectedMemberLoading(false);
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

      const res = await fetch(
        `${API_BASE}/api/workspace/members/${selectedMemberId}/${config.endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config.body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to add ${type}`);
      }

      setSelectedMemberProfile(data.member);
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

      const res = await fetch(
        `${API_BASE}/api/workspace/members/${selectedMemberId}/${config.endpoint}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || config.errorText);
      }

      setSelectedMemberProfile(data.member);

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

  const availableTabs = DEFAULT_TABS;
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

  const selectedDepartment =
    departmentCollection?.[selectedDepartmentKey] || null;

  const activityWeekly = Array.isArray(activityOverview?.weekly)
    ? activityOverview.weekly
    : DEFAULT_WEEKLY_ACTIVITY;

  const activityTopMembers = Array.isArray(activityOverview?.topMembers)
    ? activityOverview.topMembers
    : [];

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

      {selectedMemberId && (
        <>
          <div style={styles.memberDrawerOverlay} onClick={closeMemberDrawer} />
          <div style={styles.memberDrawer}>
            <div style={styles.memberDrawerHeader}>
              <div style={styles.memberDrawerHeaderLeft}>
                <div style={styles.memberDrawerAvatar}>
                  {selectedMemberProfile?.avatar ? (
                    <img
                      src={selectedMemberProfile.avatar}
                      alt={`${selectedMemberProfile.displayName} avatar`}
                      style={styles.memberDrawerAvatarImg}
                    />
                  ) : (
                    getInitials(selectedMemberProfile?.displayName || "Member")
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h2 style={styles.memberDrawerName}>
                    {selectedMemberProfile?.displayName || "Loading member..."}
                  </h2>
                  <p style={styles.memberDrawerUsername}>
                    {selectedMemberProfile?.username
                      ? `@${selectedMemberProfile.username}`
                      : ""}
                  </p>

                  <div style={styles.memberDrawerBadgeRow}>
                    {selectedMemberProfile?.roleLabel && (
                      <span style={styles.memberBadge}>
                        {selectedMemberProfile.roleLabel}
                      </span>
                    )}

                    {selectedMemberProfile?.departmentLabel && (
                      <span style={styles.memberBadgeSoft}>
                        {selectedMemberProfile.departmentLabel}
                      </span>
                    )}

                    <span style={styles.memberBadgeSoft}>
                      Weekly: {" "}
                      {formatMinutes(selectedMemberProfile?.weeklyTotalMinutes || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <button style={styles.closeDrawerButton} onClick={closeMemberDrawer}>
                ✕
              </button>
            </div>

            {selectedMemberError && (
              <div style={{ ...styles.error, marginBottom: 16 }}>
                {selectedMemberError}
              </div>
            )}

            {selectedMemberLoading && !selectedMemberProfile ? (
              <div style={styles.loading}>Loading member profile...</div>
            ) : selectedMemberProfile ? (
              <div style={styles.memberDrawerGrid}>
                <div style={styles.drawerSection}>
                  <p style={styles.label}>Profile</p>

                  <div style={styles.drawerStatGrid}>
                    <div style={styles.drawerStatCard}>
                      <span style={styles.drawerStatLabel}>Warnings</span>
                      <strong style={styles.drawerStatValue}>
                        {selectedMemberProfile.warnings?.length || 0}
                      </strong>
                    </div>

                    <div style={styles.drawerStatCard}>
                      <span style={styles.drawerStatLabel}>Suspensions</span>
                      <strong style={styles.drawerStatValue}>
                        {selectedMemberProfile.suspensions?.length || 0}
                      </strong>
                    </div>

                    <div style={styles.drawerStatCard}>
                      <span style={styles.drawerStatLabel}>Notes</span>
                      <strong style={styles.drawerStatValue}>
                        {selectedMemberProfile.notes?.length || 0}
                      </strong>
                    </div>

                    <div style={styles.drawerStatCard}>
                      <span style={styles.drawerStatLabel}>Weekly Total</span>
                      <strong style={styles.drawerStatValue}>
                        {formatMinutes(selectedMemberProfile.weeklyTotalMinutes || 0)}
                      </strong>
                    </div>
                  </div>
                </div>

                {canViewActivity && (
                  <div style={styles.drawerSection}>
                    <p style={styles.label}>Weekly Activity</p>

                    <div style={styles.weeklyBars}>
                      {(selectedMemberProfile.weeklyActivity || DEFAULT_WEEKLY_ACTIVITY).map(
                        (day) => {
                          const barHeight = clamp(
                            Number(day.minutes || 0) * 1.8,
                            10,
                            110
                          );

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
                              <span style={styles.dayValue}>{day.minutes}m</span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                <div style={styles.drawerSection}>
                  <p style={styles.label}>Add Warning</p>

                  <textarea
                    value={warningInput}
                    onChange={(e) => setWarningInput(e.target.value)}
                    placeholder="Enter a warning reason..."
                    style={styles.drawerTextarea}
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

                  <div style={styles.drawerList}>
                    {selectedMemberProfile.warnings?.length > 0 ? (
                      selectedMemberProfile.warnings.map((item) => (
                        <div key={item.id} style={styles.drawerListItem}>
                          <div style={styles.drawerListItemTop}>
                            <strong style={styles.drawerListTitle}>Warning</strong>

                            {canWarn && (
                              <button
                                style={styles.deleteItemButton}
                                onClick={() => deleteMemberItem("warning", item.id)}
                                disabled={deletingItemId === item.id}
                              >
                                {deletingItemId === item.id ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>

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

                  <div style={styles.drawerList}>
                    {selectedMemberProfile.suspensions?.length > 0 ? (
                      selectedMemberProfile.suspensions.map((item) => (
                        <div key={item.id} style={styles.drawerListItem}>
                          <div style={styles.drawerListItemTop}>
                            <strong style={styles.drawerListTitle}>Suspension</strong>

                            {canSuspend && (
                              <button
                                style={styles.deleteItemButton}
                                onClick={() =>
                                  deleteMemberItem("suspension", item.id)
                                }
                                disabled={deletingItemId === item.id}
                              >
                                {deletingItemId === item.id ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>

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

                  <div style={styles.drawerList}>
                    {selectedMemberProfile.notes?.length > 0 ? (
                      selectedMemberProfile.notes.map((item) => (
                        <div key={item.id} style={styles.drawerListItem}>
                          <div style={styles.drawerListItemTop}>
                            <strong style={styles.drawerListTitle}>Note</strong>

                            {canAddNotes && (
                              <button
                                style={styles.deleteItemButton}
                                onClick={() => deleteMemberItem("note", item.id)}
                                disabled={deletingItemId === item.id}
                              >
                                {deletingItemId === item.id ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>

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
            ) : (
              <div style={styles.emptyState}>Unable to load this member.</div>
            )}
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
                    <p style={styles.accountRole}>
                      Department: {workspaceAccess?.viewer?.departmentLabel || "No Department"}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <p style={styles.label}>Activity</p>
                <h2 style={styles.stat}>{formatMinutes(activitySummary.totalMinutes)}</h2>
                <p style={styles.sub}>
                  Tracked weekly activity across synced directory members.
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
                  This panel now supports member profile records, activity totals,
                  warnings, suspensions, notes, and department-based permissions.
                </p>
              </div>

              <div style={styles.bottomCard}>
                <p style={styles.label}>Quick Numbers</p>
                <div style={styles.quickInfoGrid}>
                  <div style={styles.quickInfoPill}>
                    <span>Active Members</span>
                    <strong>{activitySummary.activeMembers}</strong>
                  </div>

                  <div style={styles.quickInfoPill}>
                    <span>Avg Weekly</span>
                    <strong>{formatMinutes(activitySummary.averageMinutes)}</strong>
                  </div>

                  <div style={styles.quickInfoPill}>
                    <span>On Track</span>
                    <strong>{activitySummary.quotaRate}%</strong>
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

            {activityError && <div style={styles.error}>{activityError}</div>}

            {activityLoading ? (
              <div style={styles.loading}>Loading activity overview...</div>
            ) : (
              <>
                <div style={styles.activityTopGrid}>
                  <div style={styles.statCardEnhanced}>
                    <span style={styles.enhancedStatLabel}>Total Tracked</span>
                    <strong style={styles.enhancedStatValue}>
                      {formatMinutes(activitySummary.totalMinutes)}
                    </strong>
                    <small style={styles.enhancedStatSub}>
                      All synced members this week
                    </small>
                  </div>

                  <div style={styles.statCardEnhanced}>
                    <span style={styles.enhancedStatLabel}>Active Members</span>
                    <strong style={styles.enhancedStatValue}>
                      {activitySummary.activeMembers}
                    </strong>
                    <small style={styles.enhancedStatSub}>
                      Members with logged activity
                    </small>
                  </div>

                  <div style={styles.statCardEnhanced}>
                    <span style={styles.enhancedStatLabel}>Weekly Average</span>
                    <strong style={styles.enhancedStatValue}>
                      {formatMinutes(activitySummary.averageMinutes)}
                    </strong>
                    <small style={styles.enhancedStatSub}>
                      Average per synced member
                    </small>
                  </div>

                  <div style={styles.statCardEnhanced}>
                    <span style={styles.enhancedStatLabel}>Quota Completion</span>
                    <strong style={styles.enhancedStatValue}>
                      {activitySummary.quotaRate}%
                    </strong>
                    <small style={styles.enhancedStatSub}>
                      Members at {activitySummary.targetMinutes}m+
                    </small>
                  </div>
                </div>

                <div style={styles.activityBodyGrid}>
                  <div style={styles.activityChartCard}>
                    <p style={styles.label}>Weekly Trend</p>
                    <h3 style={styles.sectionTitle}>Group activity this week</h3>

                    <div style={styles.activityChartBars}>
                      {activityWeekly.map((day) => {
                        const barHeight = clamp(Number(day.minutes || 0) * 0.8, 18, 170);

                        return (
                          <div key={day.label} style={styles.activityChartBarItem}>
                            <span style={styles.activityChartValue}>
                              {day.minutes}m
                            </span>
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
                      {activityTopMembers.length > 0 ? (
                        activityTopMembers.map((member, index) => (
                          <div
                            key={member.userId}
                            style={styles.topListItem}
                            onClick={() => loadMemberProfile(member.userId)}
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
                                <strong style={styles.topName}>
                                  {member.displayName}
                                </strong>
                                <p style={styles.topMeta}>
                                  @{member.username} •{" "}
                                  {member.roleLabel || member.roleName || "Member"}
                                </p>
                              </div>
                            </div>

                            <div style={styles.topTime}>
                              {formatMinutes(member.weeklyTotalMinutes)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={styles.emptyState}>No activity data yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
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
                  {membersLoading ? "..." : filteredMembers.length}
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
            ) : filteredMembers.length > 0 ? (
              <div style={styles.membersGrid}>
                {filteredMembers.map((member) => (
                  <div
                    key={member.userId}
                    style={styles.memberCardClickable}
                    onClick={() => loadMemberProfile(member.userId)}
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

                        {member.departmentLabel && (
                          <span style={styles.memberBadgeSoft}>
                            {member.departmentLabel}
                          </span>
                        )}

                        {member.isConnectedUser && (
                          <span style={styles.memberBadgeSoft}>
                            Connected Account
                          </span>
                        )}

                        <span style={styles.memberBadgeSoft}>
                          {formatMinutes(member.weeklyTotalMinutes || 0)} this week
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
                This section is ready for trainings, host claims, attendance,
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
                Manage department access, moderation tools, sessions, and future website permissions.
              </p>
            </div>

            {settingsError && <div style={styles.error}>{settingsError}</div>}
            {settingsLoading && (
              <div style={styles.loading}>Loading workspace settings...</div>
            )}

            <div style={styles.settingsGrid}>
              <div style={styles.settingsCard}>
                <p style={styles.label}>Department Permissions</p>

                <div style={styles.settingsList}>
                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Warnings system</strong>
                      <p style={styles.settingSub}>
                        Current access for your assigned department.
                      </p>
                    </div>
                    <div style={canWarn ? styles.toggleOn : styles.toggleOff}>
                      {canWarn ? "Allowed" : "No Access"}
                    </div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Suspension records</strong>
                      <p style={styles.settingSub}>
                        Current access for your assigned department.
                      </p>
                    </div>
                    <div style={canSuspend ? styles.toggleOn : styles.toggleOff}>
                      {canSuspend ? "Allowed" : "No Access"}
                    </div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Private staff notes</strong>
                      <p style={styles.settingSub}>
                        Current access for your assigned department.
                      </p>
                    </div>
                    <div style={canAddNotes ? styles.toggleOn : styles.toggleOff}>
                      {canAddNotes ? "Allowed" : "No Access"}
                    </div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Activity visibility</strong>
                      <p style={styles.settingSub}>
                        View weekly activity and summaries.
                      </p>
                    </div>
                    <div style={canViewActivity ? styles.toggleOn : styles.toggleOff}>
                      {canViewActivity ? "Allowed" : "No Access"}
                    </div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Website controls</strong>
                      <p style={styles.settingSub}>
                        Reserved for future communications tools.
                      </p>
                    </div>
                    <div style={canManageWebsite ? styles.toggleOn : styles.toggleOff}>
                      {canManageWebsite ? "Allowed" : "Soon"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.settingsCard}>
                <p style={styles.label}>Department Manager</p>

                <div style={styles.settingsList}>
                  <div style={styles.settingRowColumn}>
                    <strong style={styles.settingTitle}>Department</strong>
                    <select
                      value={selectedDepartmentKey}
                      onChange={(e) => setSelectedDepartmentKey(e.target.value)}
                      style={styles.departmentSelect}
                      disabled={!canManageSettings}
                    >
                      {Object.values(departmentCollection || {}).map((department) => (
                        <option key={department.key} value={department.key}>
                          {department.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.settingRowColumn}>
                    <strong style={styles.settingTitle}>Add member</strong>
                    <select
                      value={selectedDepartmentMemberId}
                      onChange={(e) => setSelectedDepartmentMemberId(e.target.value)}
                      style={styles.departmentSelect}
                      disabled={!canManageSettings}
                    >
                      <option value="">Select a member...</option>
                      {members.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.displayName} (@{member.username})
                        </option>
                      ))}
                    </select>
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
                      <div style={styles.departmentPermissionsCard}>
                        <strong style={styles.sectionTitle}>
                          {selectedDepartment.label}
                        </strong>

                        <div style={styles.permissionBadgeRow}>
                          <span
                            style={
                              selectedDepartment.permissions?.canWarn
                                ? styles.permissionBadgeOn
                                : styles.permissionBadgeOff
                            }
                          >
                            Warn
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canSuspend
                                ? styles.permissionBadgeOn
                                : styles.permissionBadgeOff
                            }
                          >
                            Suspend
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canAddNotes
                                ? styles.permissionBadgeOn
                                : styles.permissionBadgeOff
                            }
                          >
                            Notes
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canViewActivity
                                ? styles.permissionBadgeOn
                                : styles.permissionBadgeOff
                            }
                          >
                            View Activity
                          </span>
                          <span
                            style={
                              selectedDepartment.permissions?.canManageWebsite
                                ? styles.permissionBadgeOn
                                : styles.permissionBadgeOff
                            }
                          >
                            Website
                          </span>
                        </div>
                      </div>

                      <div style={styles.departmentMemberList}>
                        {Array.isArray(selectedDepartment.members) &&
                        selectedDepartment.members.length > 0 ? (
                          selectedDepartment.members.map((member) => (
                            <div key={member.userId} style={styles.departmentMemberRow}>
                              <div style={styles.departmentMemberLeft}>
                                <div style={styles.departmentMemberAvatar}>
                                  {member.avatar ? (
                                    <img
                                      src={member.avatar}
                                      alt={member.displayName}
                                      style={styles.departmentMemberAvatarImg}
                                    />
                                  ) : (
                                    getInitials(member.displayName || "M")
                                  )}
                                </div>

                                <div>
                                  <strong style={styles.departmentMemberName}>
                                    {member.displayName}
                                  </strong>
                                  <p style={styles.departmentMemberMeta}>
                                    @{member.username} •{" "}
                                    {member.roleLabel || member.roleName || "Member"}
                                  </p>
                                </div>
                              </div>

                              {canManageSettings && (
                                <button
                                  style={styles.deleteItemButton}
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
                          <div style={styles.drawerEmpty}>
                            No members in this department yet.
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
                      <strong style={styles.settingTitle}>Department</strong>
                      <p style={styles.settingSub}>
                        Your currently assigned internal team.
                      </p>
                    </div>
                    <div style={styles.toggleOff}>
                      {workspaceAccess?.viewer?.departmentLabel || "No Department"}
                    </div>
                  </div>

                  <div style={styles.settingRow}>
                    <div>
                      <strong style={styles.settingTitle}>Activity quotas</strong>
                      <p style={styles.settingSub}>
                        Weekly target currently set to{" "}
                        {activitySummary.targetMinutes || 30} minutes.
                      </p>
                    </div>
                    <div style={styles.toggleOn}>
                      {activitySummary.targetMinutes || 30}m
                    </div>
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
