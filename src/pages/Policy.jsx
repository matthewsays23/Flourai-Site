import React from "react";

const POLICIES = {
  terms: {
    eyebrow: "Terms of Service",
    title: "Flourai Terms of Service",
    updated: "Last updated: April 20, 2026",
    sections: [
      {
        heading: "Use of Flourai",
        body: "Flourai provides workspace tools for Roblox community management, including member directories, activity tracking, sessions, notes, warnings, and related staff operations. You agree to use Flourai only for lawful, authorized community management purposes.",
      },
      {
        heading: "Roblox account connection",
        body: "Flourai uses Roblox authentication to identify users and verify workspace access. You are responsible for keeping your Roblox account secure and for using the dashboard only with permissions granted to you by your community.",
      },
      {
        heading: "Workspace data",
        body: "Workspace owners and authorized staff are responsible for the information they add to Flourai, including moderation records, notes, and activity data. Do not submit private, harmful, or unnecessary personal information.",
      },
      {
        heading: "Availability and changes",
        body: "Flourai may change, pause, or remove features as the service improves. We try to keep the workspace reliable, but we cannot guarantee uninterrupted access at all times.",
      },
      {
        heading: "Contact",
        body: "Questions about these terms can be handled through the Flourai team or the community owner responsible for the workspace.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Flourai Privacy Policy",
    updated: "Last updated: April 20, 2026",
    sections: [
      {
        heading: "Information we collect",
        body: "Flourai may collect Roblox identifiers, usernames, display names, avatars, group roles, staff department assignments, dashboard session information, moderation records, notes, and activity minutes submitted by connected Roblox systems.",
      },
      {
        heading: "How information is used",
        body: "This information is used to provide workspace access, show member directories, calculate activity summaries, manage staff records, and help authorized leaders operate their Roblox community.",
      },
      {
        heading: "Who can see data",
        body: "Workspace information is shown to authorized Flourai users based on group membership, role, and department permissions. Sensitive controls such as notes, warnings, and suspensions are limited by workspace permissions.",
      },
      {
        heading: "Data security",
        body: "Flourai uses authenticated sessions and permission checks to limit access. Roblox activity intake is protected by a shared secret configured by the workspace owner or backend administrator.",
      },
      {
        heading: "Data updates",
        body: "Member and activity data may update when authorized users refresh the workspace or when Roblox systems send activity events. Workspace owners may request corrections or removals through the Flourai team.",
      },
    ],
  },
};

export default function Policy({ type }) {
  const policy = POLICIES[type] || POLICIES.terms;
  const styles = createStyles();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.brand}>
          Flourai
        </a>
        <a href="/dashboard" style={styles.dashboardLink}>
          Dashboard
        </a>
      </header>

      <main style={styles.shell}>
        <p style={styles.eyebrow}>{policy.eyebrow}</p>
        <h1 style={styles.title}>{policy.title}</h1>
        <p style={styles.updated}>{policy.updated}</p>

        <div style={styles.card}>
          {policy.sections.map((section) => (
            <section key={section.heading} style={styles.section}>
              <h2 style={styles.heading}>{section.heading}</h2>
              <p style={styles.body}>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function createStyles() {
  return {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 8% 12%, rgba(155,214,172,0.22), transparent 20%), linear-gradient(180deg, #fbfdf8 0%, #edf5ee 100%)",
      color: "#1c2f25",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    header: {
      minHeight: 76,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px clamp(18px, 4vw, 40px)",
    },

    brand: {
      color: "#294d38",
      textDecoration: "none",
      fontSize: 24,
      fontWeight: 900,
    },

    dashboardLink: {
      minHeight: 44,
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 14,
      padding: "0 18px",
      background: "rgba(255,255,255,0.78)",
      border: "1px solid rgba(28,47,37,0.08)",
      color: "#1c2f25",
      textDecoration: "none",
      fontWeight: 850,
      boxShadow: "0 16px 34px rgba(40,70,52,0.08)",
    },

    shell: {
      width: "min(920px, calc(100% - 32px))",
      margin: "42px auto 80px",
    },

    eyebrow: {
      margin: 0,
      color: "#7b8f83",
      fontSize: 13,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    },

    title: {
      margin: "14px 0 0",
      fontSize: "clamp(40px, 7vw, 72px)",
      lineHeight: 1,
      letterSpacing: 0,
    },

    updated: {
      margin: "18px 0 0",
      color: "#607268",
      fontWeight: 700,
    },

    card: {
      marginTop: 34,
      borderRadius: 24,
      background: "rgba(255,255,255,0.76)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 26px 65px rgba(40,70,52,0.08)",
      padding: "clamp(22px, 4vw, 34px)",
    },

    section: {
      padding: "22px 0",
      borderBottom: "1px solid rgba(28,47,37,0.1)",
    },

    heading: {
      margin: 0,
      fontSize: 24,
      letterSpacing: 0,
    },

    body: {
      margin: "10px 0 0",
      color: "#607268",
      fontSize: 16,
      lineHeight: 1.75,
    },
  };
}
