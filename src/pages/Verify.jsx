import React, { useEffect, useMemo, useState } from "react";
import flouraiLogo from "../assets/Text_Logo.png";
import mark from "../assets/home.png";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.flourai.io";

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export default function Verify() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const result = params.get("result") || "";
  const message = params.get("message") || "";

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/verification/status`, {
        credentials: "include",
      });
      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to load verification status.");
      }

      setStatus(data);
    } catch (err) {
      setError(err.message || "Failed to load verification status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#edf6ef";
    document.body.style.fontFamily =
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

    loadStatus();

    return () => {
      document.body.style.margin = "";
      document.body.style.background = "";
      document.body.style.fontFamily = "";
    };
  }, []);

  const startRoblox = () => {
    window.location.href = `${API_BASE}/api/auth/roblox/start?next=/verify`;
  };

  const startDiscord = () => {
    window.location.href = `${API_BASE}/api/verification/discord/start`;
  };

  const verified = Boolean(status?.discord);
  const roblox = status?.roblox;
  const robloxRole = status?.robloxRole;
  const desiredRoleCount = status?.desiredRoleIds?.length || 0;

  return (
    <div style={styles.page}>
      <header style={styles.nav}>
        <button style={styles.brand} onClick={() => (window.location.href = "/")}>
          <img src={mark} alt="" style={styles.brandMark} />
          <span style={styles.brandText}>Flourai</span>
        </button>

        <a href="/dashboard" style={styles.navLink}>
          Workspace
        </a>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.logoPanel}>
            <img src={flouraiLogo} alt="Flourai" style={styles.logo} />
          </div>

          <p style={styles.kicker}>Discord verification</p>
          <h1 style={styles.title}>Verify with Flourai.</h1>
          <p style={styles.subtitle}>
            Connect Roblox and Discord to sync your server nickname and role
            binds from your Flourai group rank.
          </p>

          {result === "success" && (
            <div style={styles.success}>Verification complete. Your Discord roles were updated.</div>
          )}

          {result === "error" && (
            <div style={styles.error}>
              Verification could not finish
              {message ? ` (${message.replaceAll("_", " ")})` : ""}. Please try again or ask
              Leadership to check the bot's role permissions.
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.steps}>
            <article style={styles.step}>
              <span style={roblox ? styles.stepStateDone : styles.stepState}>1</span>
              <div>
                <h2 style={styles.stepTitle}>Roblox account</h2>
                <p style={styles.stepText}>
                  {roblox
                    ? `${roblox.username} is connected.`
                    : "Connect the Roblox account that belongs to your Flourai group profile."}
                </p>
              </div>
            </article>

            <article style={styles.step}>
              <span style={verified ? styles.stepStateDone : styles.stepState}>2</span>
              <div>
                <h2 style={styles.stepTitle}>Discord account</h2>
                <p style={styles.stepText}>
                  {verified
                    ? `${status.discord.username} is bound to this Roblox account.`
                    : "Authorize Discord so Flourai can update your server identity."}
                </p>
              </div>
            </article>

            <article style={styles.step}>
              <span style={verified ? styles.stepStateDone : styles.stepState}>3</span>
              <div>
                <h2 style={styles.stepTitle}>Server roles</h2>
                <p style={styles.stepText}>
                  {robloxRole
                    ? `${robloxRole.roleName} rank ${robloxRole.rank} maps to ${desiredRoleCount} configured role${desiredRoleCount === 1 ? "" : "s"}.`
                    : "No Flourai group role was found for this Roblox account."}
                </p>
              </div>
            </article>
          </div>

          <div style={styles.actionPanel}>
            {loading ? (
              <button style={styles.primaryButton} disabled>
                Loading verification
              </button>
            ) : !roblox ? (
              <button style={styles.primaryButton} onClick={startRoblox}>
                Continue with Roblox
              </button>
            ) : (
              <button style={styles.primaryButton} onClick={startDiscord}>
                {verified ? "Reverify Discord" : "Connect Discord"}
              </button>
            )}

            <button style={styles.secondaryButton} onClick={loadStatus}>
              Refresh Status
            </button>
          </div>

          {verified && (
            <div style={styles.bindCard}>
              <span style={styles.bindLabel}>Current nickname</span>
              <strong style={styles.bindValue}>{status.discord.nickname}</strong>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 8% 14%, rgba(165,213,176,0.26), transparent 20%), linear-gradient(180deg, #fbfdf8 0%, #eef7f1 100%)",
    color: "#1b2e24",
  },
  nav: {
    minHeight: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px clamp(18px, 5vw, 48px)",
  },
  brand: {
    border: 0,
    background: "transparent",
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    color: "#1c2f25",
  },
  brandMark: {
    width: 34,
    height: 34,
    objectFit: "cover",
    borderRadius: 10,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 0,
  },
  navLink: {
    color: "#355c42",
    textDecoration: "none",
    fontWeight: 850,
  },
  main: {
    minHeight: "calc(100vh - 90px)",
    display: "grid",
    placeItems: "center",
    padding: "20px clamp(18px, 5vw, 48px) 72px",
  },
  hero: {
    width: "min(860px, 100%)",
  },
  logoPanel: {
    width: "min(520px, 100%)",
    minHeight: 126,
    display: "flex",
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
  },
  kicker: {
    margin: "0 0 14px",
    color: "#7b8f83",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "clamp(42px, 8vw, 78px)",
    lineHeight: 0.98,
    fontWeight: 950,
    letterSpacing: 0,
  },
  subtitle: {
    maxWidth: 720,
    margin: "22px 0 0",
    color: "#5f6f66",
    fontSize: 19,
    lineHeight: 1.7,
    fontWeight: 520,
  },
  success: {
    marginTop: 24,
    padding: "14px 16px",
    borderRadius: 14,
    background: "#dceee3",
    color: "#244f34",
    fontWeight: 850,
  },
  error: {
    marginTop: 24,
    padding: "14px 16px",
    borderRadius: 14,
    background: "#f9e4e1",
    color: "#78362f",
    fontWeight: 800,
  },
  steps: {
    display: "grid",
    gap: 12,
    marginTop: 30,
  },
  step: {
    display: "grid",
    gridTemplateColumns: "42px 1fr",
    gap: 14,
    alignItems: "start",
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(255,255,255,0.88)",
    boxShadow: "0 18px 38px rgba(40,70,52,0.07)",
  },
  stepState: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#eef5ef",
    color: "#617369",
    fontWeight: 900,
  },
  stepStateDone: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#294d38",
    color: "#ffffff",
    fontWeight: 900,
  },
  stepTitle: {
    margin: 0,
    fontSize: 20,
    letterSpacing: 0,
  },
  stepText: {
    margin: "7px 0 0",
    color: "#617369",
    lineHeight: 1.55,
  },
  actionPanel: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 26,
  },
  primaryButton: {
    minHeight: 54,
    border: 0,
    borderRadius: 14,
    background: "#294d38",
    color: "#ffffff",
    padding: "0 24px",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 900,
    boxShadow: "0 22px 38px rgba(41,77,56,0.2)",
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 14,
    border: "1px solid rgba(28,47,37,0.08)",
    background: "rgba(255,255,255,0.82)",
    color: "#1d3026",
    padding: "0 24px",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 850,
  },
  bindCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: 18,
    background: "rgba(236,246,239,0.92)",
  },
  bindLabel: {
    display: "block",
    color: "#7b8f83",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  bindValue: {
    color: "#1d3026",
    fontSize: 20,
  },
};
