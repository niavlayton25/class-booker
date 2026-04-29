"use client";

import { useEffect, useState } from "react";
import ConnectAccountFlow from "../components/ConnectAccountFlow";
import AppNav from "../components/AppNav";
import TabBar from "../components/TabBar";

type ConnectionStatus = {
  connected: boolean;
  account: { connected_at: string; token_expires_at: string | null } | null;
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

export default function SettingsPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [history, setHistory] = useState<BookingAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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
    <div className="page-container" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="page-bottom-pad" style={{ padding: "18px 18px 100px" }}>
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
      <TabBar />
    </div>
  );
}
