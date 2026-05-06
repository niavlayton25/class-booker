"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TabBar from "@/app/components/TabBar";
import AppNav from "@/app/components/AppNav";

type BookingAttempt = {
  id: string;
  attempted_at: string;
  succeeded: boolean;
  mt_response_status: number | null;
  mt_response_body: string | null;
  error_message: string | null;
  auto_book_preferences: {
    class_title: string | null;
    class_starts_at: string | null;
    class_session_id: string | null;
  } | null;
};

function failureReasonTag(status: number | null, body: string | null): string {
  if (status === 401) return "! Login expired";
  if (status === 503) return "! Studio down";
  if (status === 422) {
    const text = (body ?? "").toLowerCase();
    if (text.includes("payment") || text.includes("cost") || text.includes("credit")) return "! No class pack";
    if (text.includes("full") || text.includes("capacity") || text.includes("available")) return "! Class full";
    if (text.includes("already") || text.includes("duplicate")) return "! Already booked";
    if (text.includes("window") || text.includes("not open") || text.includes("too early")) return "! Too early";
    return "! Booking rejected";
  }
  return "! Failed";
}

function failureReasonCopy(status: number | null, body: string | null): string {
  if (status === 401) return "Your studio login expired. Head to Settings to reconnect your account.";
  if (status === 503) return "The studio booking system was temporarily unavailable. PilatesPal will retry automatically.";
  if (status === 422) {
    const text = (body ?? "").toLowerCase();
    if (text.includes("payment") || text.includes("cost") || text.includes("credit")) {
      return "No active class pack or membership was found to cover this booking. Purchase credits in the Fuze House app, then come back.";
    }
    if (text.includes("full") || text.includes("capacity") || text.includes("available")) {
      return "The class was already full when the booking window opened. Try starring an earlier class or check back if spots open up.";
    }
    if (text.includes("already") || text.includes("duplicate")) {
      return "You were already registered for this class — no action needed.";
    }
    if (text.includes("window") || text.includes("not open") || text.includes("too early")) {
      return "Booking opened earlier than expected and we attempted too soon. This should resolve on the next cycle.";
    }
    return "The studio rejected the booking request. Check the studio app for any account issues.";
  }
  return "Something went wrong. PilatesPal will retry automatically, or you can try booking manually.";
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

export default function FailureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [attempt, setAttempt] = useState<BookingAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/booking-history/${id}`)
      .then((r) => r.json())
      .then((data) => setAttempt(data.attempt ?? null))
      .catch(() => setAttempt(null))
      .finally(() => setLoading(false));
  }, [id]);

  const pref = attempt?.auto_book_preferences;
  const tag = attempt ? failureReasonTag(attempt.mt_response_status, attempt.mt_response_body) : "";
  const copy = attempt ? failureReasonCopy(attempt.mt_response_status, attempt.mt_response_body) : "";

  return (
    <div style={{ minHeight: "100vh" }}>
      <AppNav />
      <div className="page-container">
        <main className="page-bottom-pad page-main" style={{ padding: "18px 18px 100px" }}>
          {/* Back link */}
          <button
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--ink-3)",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            type="button"
          >
            ‹ My Classes
          </button>

          {loading ? (
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Loading...</div>
          ) : !attempt ? (
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Booking attempt not found.</div>
          ) : (
            <>
              {/* Eyebrow */}
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--pink-ink)",
                  marginBottom: 6,
                }}
              >
                Booking failed
              </div>

              {/* Heading */}
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 24,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                  marginBottom: 4,
                }}
              >
                We couldn&apos;t get you into{" "}
                <span style={{ fontStyle: "italic", textDecoration: "line-through", color: "var(--ink-2)" }}>
                  {pref?.class_title ?? "this class"}
                </span>
                .
              </div>

              {/* Class meta */}
              {pref?.class_starts_at && (
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 20 }}>
                  {formatDateTime(pref.class_starts_at)}
                </div>
              )}

              {/* Reason banner */}
              <div
                style={{
                  background: "var(--pink-soft)",
                  border: "1px solid var(--pink-rule)",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--pink-ink)",
                    background: "var(--surface)",
                    border: "1px solid var(--pink-rule)",
                    borderRadius: 999,
                    padding: "2px 8px",
                    marginBottom: 8,
                  }}
                >
                  {tag}
                </span>
                <div style={{ fontSize: 13, color: "var(--pink-ink)", lineHeight: 1.5 }}>
                  {copy}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <
                  href="/schedule"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    border: "1px solid var(--rule)",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    textAlign: "center",
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  Find similar this week
                </a>

                <a
                  href="https://fuzehouse.marianatek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    border: "1px solid var(--rule)",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    textAlign: "center",
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  Open on studio ↗
                </a>

                <a
                  href="mailto:support@pilatespal.app?subject=Booking%20failure%20report&body=Attempt%20ID%3A%20{id}"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    background: "transparent",
                    color: "var(--ink-3)",
                    border: "none",
                    borderRadius: 999,
                    fontSize: 13,
                    textAlign: "center",
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  Report a bug to PilatesPal
                </a>
              </div>
            </>
          )}
        </main>
      </div>
      <TabBar />
    </div>
  );
}
