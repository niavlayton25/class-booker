"use client";

import { useEffect, useState } from "react";
import AutoBookToggle from "./AutoBookToggle";
import { createClient } from "@/lib/supabase/client";

type StudioClass = {
  id: string;
  title: string;
  startsAt: string | null;
  bookingStartsAt: string | null;
  duration: string | null;
  instructor: string | null;
  room: string | null;
  availableSpots: number | null;
  capacity: number | null;
};

type BookingAttempt = {
  id: string;
  attempted_at: string;
  succeeded: boolean;
  mt_response_status: number | null;
  mt_response_body: string | null;
  auto_book_preferences: {
    class_title: string | null;
    class_starts_at: string | null;
    class_session_id: string | null;
  } | null;
};

function bookingFailureMessage(status: number | null, body: string | null): string {
  if (status === 401) return "Re-authenticate in Settings to fix this.";
  if (status === 503) return "Studio booking system was down. Will retry.";
  if (status === 422) {
    const text = (body ?? "").toLowerCase();
    if (text.includes("payment") || text.includes("cost") || text.includes("credit")) {
      return "No class pack found. Check your credits in the Fuze House app.";
    }
    if (text.includes("full") || text.includes("capacity") || text.includes("available")) {
      return "Class was full when booking opened.";
    }
    if (text.includes("already") || text.includes("duplicate")) {
      return "Already booked in this class.";
    }
    if (text.includes("window") || text.includes("not open") || text.includes("too early")) {
      return "Booking window wasn't open yet.";
    }
    return "Booking rejected by studio.";
  }
  return "Booking failed. Try again from Settings.";
}

type Props = {
  classes: StudioClass[];
};

function formatTime(dateString: string | null) {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function timeUntil(dateString: string | null) {
  if (!dateString) return null;
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `in ${days}d ${hours}h`;
  return `in ${hours}h`;
}

export default function FavoritesList({ classes }: Props) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bookedClasses, setBookedClasses] = useState<BookingAttempt[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<BookingAttempt[]>([]);

  useEffect(() => {
    setMounted(true);

    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setFavoriteIds(data.ids ?? []))
      .catch(() => {});

    fetch("/api/booking-history")
      .then((r) => r.json())
      .then((data) => {
        const now = new Date();
        const attempts: BookingAttempt[] = data.attempts ?? [];
        const upcoming = attempts.filter((a) => {
          if (!a.succeeded) return false;
          const classTime = a.auto_book_preferences?.class_starts_at;
          return classTime && new Date(classTime) > now;
        });
        setBookedClasses(upcoming);
        // Most recent failed attempt per class session
        const failedMap = new Map<string, BookingAttempt>();
        for (const a of attempts) {
          if (a.succeeded) continue;
          const sessionId = a.auto_book_preferences?.class_session_id;
          if (sessionId && !failedMap.has(sessionId)) failedMap.set(sessionId, a);
        }
        setFailedAttempts(Array.from(failedMap.values()));
      })
      .catch(() => {});

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function unfavorite(classId: string) {
    setFavoriteIds((prev) => prev.filter((id) => id !== classId));
    await fetch(`/api/favorites/${encodeURIComponent(classId)}`, { method: "DELETE" });
  }

  if (!mounted) {
    return <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Loading...</div>;
  }

  const favorited = classes.filter((cls) => favoriteIds.includes(cls.id));
  const firstName = userEmail ? userEmail.split("@")[0] : null;

  return (
    <div>
      {/* Greeting */}
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 24,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        {firstName ? (
          <>
            Hi <span style={{ fontStyle: "italic", color: "var(--pink)" }}>{firstName}.</span>
          </>
        ) : (
          <>My <span style={{ fontStyle: "italic", color: "var(--pink)" }}>Classes.</span></>
        )}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 8 }}>
        {bookedClasses.length > 0 ? `${bookedClasses.length} coming up · ` : ""}
        {favorited.length} saved.
      </div>

      {/* Coming up */}
      {bookedClasses.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "18px 0 10px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
              }}
            >
              Coming up
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
          </div>

          {bookedClasses.map((attempt) => {
            const pref = attempt.auto_book_preferences;
            const when = timeUntil(pref?.class_starts_at ?? null);
            return (
              <div
                key={attempt.id}
                style={{
                  border: "1px solid var(--ok)",
                  background: "#F4FAF6",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                      {pref?.class_title ?? "Class"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                      {formatDate(pref?.class_starts_at ?? null)} ·{" "}
                      {formatTime(pref?.class_starts_at ?? null)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--ok)",
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      ● Booked{when ? ` · ${when}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Saved · auto-book */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "18px 0 10px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          Saved · auto-book
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
      </div>

      {favorited.length === 0 && (
        <div
          style={{
            padding: "16px 14px",
            borderRadius: 10,
            border: "1px solid var(--rule)",
            color: "var(--ink-3)",
            fontSize: 13,
          }}
        >
          No saved classes yet. Star a class from the Schedule tab.
        </div>
      )}

      {favorited.map((cls, i) => {
        const isLast = i === favorited.length - 1;
        const failedAttempt = failedAttempts.find(
          (a) => a.auto_book_preferences?.class_session_id === cls.id
        );
        return (
          <div
            key={cls.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderBottom: !isLast ? "1px solid var(--rule)" : "none",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                {cls.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                {formatDate(cls.startsAt)} · {formatTime(cls.startsAt)} ·{" "}
                {cls.instructor ?? "Instructor TBD"}
              </div>
              {cls.bookingStartsAt && (() => {
                const now = new Date();
                const target = new Date(cls.bookingStartsAt);
                const diffMs = target.getTime() - now.getTime();
                if (diffMs <= 0) return null;
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const label = days > 0 ? `Auto-books in ${days}d ${hours}h` : `Auto-books in ${hours}h`;
                return (
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "var(--pink)", marginTop: 4 }}>
                    {label}
                  </div>
                );
              })()}
              {failedAttempt && (
                <div style={{ fontSize: 11, color: "#B0203F", marginTop: 4 }}>
                  ✗ {bookingFailureMessage(failedAttempt.mt_response_status, failedAttempt.mt_response_body)}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => unfavorite(cls.id)}
                style={{
                  fontSize: 18,
                  color: "var(--pink)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label="Remove favorite"
                type="button"
              >
                ★
              </button>
              <AutoBookToggle
                classSessionId={cls.id}
                classTitle={cls.title}
                classStartsAt={cls.startsAt}
                bookingStartsAt={cls.bookingStartsAt}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
