"use client";

import { useEffect, useState } from "react";
import ConnectAccountFlow from "../components/ConnectAccountFlow";
import AppNav from "../components/AppNav";
import TabBar from "../components/TabBar";

type ConnectionStatus = {
  connected: boolean;
  account: { connected_at: string; token_expires_at: string | null } | null;
};

type MTCredit = {
  id: string;
  name: string;
  credits_remaining: number;
  credits_total: number;
  credits_used: number;
  is_expired: boolean;
  expiration_datetime?: string | null;
};

type MTMembership = {
  id: string;
  membership_type?: { name?: string };
  status?: string;
  next_renewal_date?: string | null;
};

type BookingAttempt = {
  id: string;
  attempted_at: string;
  succeeded: boolean;
  mt_response_status: number | null;
  error_message: string | null;
  auto_book_preferences: {
    class_title: string | null;
    class_starts_at: string | null;
  } | null;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "22px 0 12px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 9,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {children}
    </div>
  );
}

function PlanCard({
  label,
  used,
  total,
  expiresAt,
  renewsAt,
}: {
  label: string;
  used: number;
  total: number;
  expiresAt?: string | null;
  renewsAt?: string | null;
}) {
  const remaining = total - used;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const isLow = remaining <= 1;
  const dateLabel = renewsAt
    ? `Renews ${new Date(renewsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : expiresAt
    ? `Expires ${new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 9,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      {/* Large number */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
        <span
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 36,
            lineHeight: 1,
            color: isLow ? "var(--pink)" : "var(--ink)",
          }}
        >
          {remaining}
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>/ {total}</span>
        <span style={{ fontSize: 12, color: "var(--ink-2)", marginLeft: 2 }}>remaining</span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: "var(--rule)",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: isLow ? "var(--pink)" : "var(--ok)",
          }}
        />
      </div>

      {/* Low credit warning */}
      {isLow && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            background: "var(--pink-soft)",
            border: "1px solid var(--pink-rule)",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ color: "var(--pink)", fontSize: 12 }}>!</span>
          <span style={{ fontSize: 11, color: "var(--pink-ink)" }}>
            {remaining === 0 ? "No credits left" : "Only 1 credit left"} — purchase more in the studio app.
          </span>
        </div>
      )}

      {/* Footer */}
      {dateLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 8,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{dateLabel}</span>
          <a
            href="https://fuzehouse.marianatek.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--ink-2)", textDecoration: "none" }}
          >
            Manage in Fuze ↗
          </a>
        </div>
      )}
    </div>
  );
}

function PlanCardEmpty() {
  return (
    <div
      style={{
        border: "1.5px dashed var(--pink-rule)",
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        background: "var(--pink-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--pink-ink)" }}>
        <span style={{ marginRight: 6 }}>!</span>No active credits or membership
      </div>
      <a
        href="https://fuzehouse.marianatek.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 11, color: "var(--ink-2)", textDecoration: "none", flexShrink: 0 }}
      >
        Open Fuze app ↗
      </a>
    </div>
  );
}

export default function SettingsPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [history, setHistory] = useState<BookingAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [credits, setCredits] = useState<MTCredit[]>([]);
  const [memberships, setMemberships] = useState<MTMembership[]>([]);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/mt-connect")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, account: null }))
      .finally(() => setLoading(false));

    fetch("/api/booking-history")
      .then((r) => r.json())
      .then((data) => setHistory(data.attempts ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));

    fetch("/api/mt-account/credits")
      .then((r) => r.json())
      .then((data) => {
        setCredits(data.credits ?? []);
        setMemberships(data.memberships ?? []);
      })
      .catch(() => {})
      .finally(() => setCreditsLoading(false));
  }, []);

  async function disconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/auth/mt-connect", { method: "DELETE" });
      setStatus({ connected: false, account: null });
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <AppNav />
      <div className="page-container">
      <main className="page-bottom-pad page-main" style={{ padding: "18px 18px 100px" }}>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 24,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            marginBottom: 4,
          }}
        >
          Settings.
        </div>

        {/* Connected studio */}
        <SectionDivider label="Connected studio" />
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: 10,
            padding: 14,
            marginBottom: 4,
          }}
        >
          {loading ? (
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Checking connection...</div>
          ) : status?.connected ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
                  Fuze House Tribeca
                </div>
                {status.account?.connected_at && (
                  <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>
                    Connected{" "}
                    {new Date(status.account.connected_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "var(--ok)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 10, color: "var(--ok)", fontWeight: 500 }}>
                    Connected · refreshes daily
                  </span>
                </div>
              </div>
              <button
                onClick={disconnect}
                disabled={disconnecting}
                style={{
                  height: 24,
                  padding: "0 10px",
                  fontSize: 9.5,
                  border: "1px solid var(--ink-3)",
                  borderRadius: 999,
                  background: "transparent",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  opacity: disconnecting ? 0.5 : 1,
                }}
                type="button"
              >
                {disconnecting ? "..." : "Disconnect"}
              </button>
            </div>
          ) : (
            <ConnectAccountFlow
              onConnected={() => {
                setStatus({
                  connected: true,
                  account: { connected_at: new Date().toISOString(), token_expires_at: null },
                });
              }}
            />
          )}
        </div>

        {/* Credits & memberships */}
        <SectionDivider label="Passes & memberships" />
        {creditsLoading ? (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Loading...</div>
        ) : credits.length === 0 && memberships.length === 0 ? (
          <PlanCardEmpty />
        ) : (
          <div>
            {memberships.map((m) => (
              <PlanCard
                key={m.id}
                label={m.membership_type?.name ?? "Membership"}
                used={0}
                total={0}
                renewsAt={m.next_renewal_date}
              />
            ))}
            {credits.map((c) => (
              <PlanCard
                key={c.id}
                label={c.name ?? "Class pack"}
                used={c.credits_used}
                total={c.credits_total}
                expiresAt={c.expiration_datetime}
              />
            ))}
          </div>
        )}

        {/* Booking history */}
        <SectionDivider label="Booking history" />
        {historyLoading ? (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>No booking attempts yet.</div>
        ) : (
          <div>
            {history.map((attempt) => {
              const pref = attempt.auto_book_preferences;
              return (
                <Row key={attempt.id}>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
                      {pref?.class_title ?? "Unknown class"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                      {pref?.class_starts_at ? formatDateTime(pref.class_starts_at) : ""}
                      {" · "}
                      Attempted {formatDateTime(attempt.attempted_at)}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {attempt.succeeded ? (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "var(--ok)",
                          background: "#E8F5EE",
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid var(--ok)",
                        }}
                      >
                        ✓ Booked
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "#B0203F",
                          background: "#FBE9EE",
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid #F7C0CF",
                        }}
                      >
                        ✗ Failed{" "}
                        {attempt.mt_response_status ? `(${attempt.mt_response_status})` : ""}
                      </span>
                    )}
                  </div>
                </Row>
              );
            })}
          </div>
        )}

        {/* Account */}
        <SectionDivider label="Account" />
        <Row>
          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>Sign out</div>
          <a
            href="/login"
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              borderBottom: "1px solid var(--ink-3)",
              textDecoration: "none",
            }}
          >
            Sign out ↗
          </a>
        </Row>
      </main>
      </div>
      <TabBar />
    </div>
  );
}
