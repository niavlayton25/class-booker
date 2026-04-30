"use client";

import { useEffect, useState } from "react";

type Status = "pending" | "booked" | "failed" | "cancelled" | null;

type Preference = {
  status: Status;
  booking_starts_at: string | null;
  recurring: boolean;
} | null;

type Props = {
  classSessionId: string;
  classTitle: string;
  classStartsAt: string | null;
  bookingStartsAt: string | null;
};

function countdownTo(iso: string | null) {
  if (!iso) return null;
  const now = new Date();
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `Auto-books in ${days}d ${hours}h`;
  return `Auto-books in ${hours}h`;
}

export default function AutoBookToggle({
  classSessionId,
  classTitle,
  classStartsAt,
  bookingStartsAt,
}: Props) {
  const [pref, setPref] = useState<Preference>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  async function fetchStatus() {
    const res = await fetch(`/api/auto-book/${encodeURIComponent(classSessionId)}`);
    const data = await res.json();
    setPref(data.preference ?? null);
  }

  useEffect(() => {
    fetchStatus().finally(() => setLoading(false));
  }, [classSessionId]);

  useEffect(() => {
    if (pref?.status !== "pending") return;
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [pref?.status]);

  async function enable() {
    if (!bookingStartsAt) return;
    setWorking(true);
    try {
      const res = await fetch("/api/auto-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSessionId,
          classTitle,
          classStartsAt,
          bookingStartsAt,
          recurring: false,
        }),
      });
      if (res.status === 400) {
        const data = await res.json();
        if (data.error?.includes("No Fuze House account")) {
          window.location.href = "/settings";
          return;
        }
      }
      if (res.ok) {
        const data = await res.json();
        setPref(data.preference);
      }
    } finally {
      setWorking(false);
    }
  }

  async function cancel() {
    setWorking(true);
    try {
      const res = await fetch(
        `/api/auto-book/${encodeURIComponent(classSessionId)}`,
        { method: "DELETE" }
      );
      if (res.ok) setPref((p) => (p ? { ...p, status: "cancelled" } : null));
    } finally {
      setWorking(false);
    }
  }

  if (loading || !bookingStartsAt) return null;

  const status = pref?.status ?? null;
  const isOn = status === "pending" || status === "booked";
  const countdown = status === "pending" ? countdownTo(bookingStartsAt) : null;

  if (status === "failed") {
    return (
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 9,
          color: "#B0203F",
          letterSpacing: "0.04em",
        }}
      >
        Booking failed
      </span>
    );
  }

  if (status === "booked") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 20,
          padding: "0 10px",
          borderRadius: 999,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.04em",
          background: "var(--ok)",
          color: "#fff",
          border: "1px solid var(--ok)",
        }}
      >
        Booked ✓
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        onClick={isOn ? cancel : enable}
        disabled={working}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 24,
          padding: "0 12px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: isOn ? "var(--pink)" : "var(--paper-2)",
          color: isOn ? "#fff" : "var(--ink-3)",
          border: `1px solid ${isOn ? "var(--pink)" : "var(--rule)"}`,
          cursor: working ? "default" : "pointer",
          opacity: working ? 0.6 : 1,
        }}
        type="button"
      >
        {isOn ? "Autobook on" : "Autobook off"}
      </button>
    </div>
  );
}
