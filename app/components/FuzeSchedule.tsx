"use client";

import { useEffect, useMemo, useState } from "react";

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

function toNYDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function isSameDay(date1: Date, date2: Date) {
  return toNYDateParts(date1) === toNYDateParts(date2);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function FuzeSchedule({ classes }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setFavoriteIds(data.ids ?? []))
      .catch(() => {});
  }, []);

  async function toggleFavorite(classId: string) {
    const isFav = favoriteIds.includes(classId);
    setFavoriteIds((prev) =>
      isFav ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
    await fetch(`/api/favorites/${encodeURIComponent(classId)}`, {
      method: isFav ? "DELETE" : "POST",
    });
  }

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) =>
      cls.startsAt ? isSameDay(new Date(cls.startsAt), selectedDate) : false
    );
  }, [classes, selectedDate]);

  function goToPreviousWeek() {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  }

  function goToNextWeek() {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  }

  if (!mounted) {
    return (
      <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Loading schedule...</div>
    );
  }

  return (
    <div>
      {/* Studio line */}
      <div
        style={{
          fontSize: 10,
          marginBottom: 8,
          display: "flex",
          gap: 6,
          alignItems: "center",
          color: "var(--ink-3)",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}>Studio</span>
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>Fuze House Tribeca ▾</span>
      </div>

      {/* Page title */}
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 24,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
          marginBottom: 14,
        }}
      >
        This <span style={{ fontStyle: "italic", color: "var(--pink)" }}>week.</span>
      </div>

      {/* Day strip with week nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
        <button
          onClick={goToPreviousWeek}
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: 999,
            border: "1px solid var(--rule)",
            background: "transparent",
            color: "var(--ink-3)",
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ←
        </button>

        <div style={{ display: "flex", gap: 3, flex: 1 }}>
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                style={{
                  flex: 1,
                  minWidth: 36,
                  textAlign: "center",
                  padding: "10px 0",
                  borderRadius: 6,
                  border: `1px solid ${isSelected ? "var(--pink)" : "var(--rule)"}`,
                  background: isSelected ? "var(--pink)" : "var(--surface)",
                  color: isSelected ? "#fff" : "var(--ink)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1 }}>
                  {day.getDate()}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    opacity: 0.75,
                    marginTop: 3,
                  }}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" })}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={goToNextWeek}
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: 999,
            border: "1px solid var(--rule)",
            background: "transparent",
            color: "var(--ink-3)",
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          →
        </button>
      </div>

      {/* Class list */}
      {filteredClasses.length === 0 && (
        <div
          style={{
            padding: "16px 14px",
            borderRadius: 10,
            border: "1px solid var(--rule)",
            color: "var(--ink-3)",
            fontSize: 13,
          }}
        >
          No classes scheduled for this day.
        </div>
      )}

      {filteredClasses.map((cls, i) => {
        const isSaved = favoriteIds.includes(cls.id);
        const isLast = i === filteredClasses.length - 1;
        return (
          <div
            key={cls.id}
            style={{
              padding: "12px 14px",
              borderRadius: isSaved ? 10 : 0,
              border: isSaved ? `1px solid var(--pink-2)` : "none",
              borderBottom: !isSaved && !isLast ? "1px solid var(--rule)" : undefined,
              background: isSaved ? "var(--pink-soft)" : "transparent",
              marginBottom: isSaved ? 6 : 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                {cls.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
                {formatTime(cls.startsAt)} · {cls.instructor ?? "Instructor TBD"} ·{" "}
                {cls.duration ?? ""}
              </div>
              {cls.availableSpots !== null && cls.capacity !== null && (
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>
                  {cls.availableSpots} / {cls.capacity} spots
                </div>
              )}
            </div>
            <button
              onClick={() => toggleFavorite(cls.id)}
              style={{
                fontSize: 22,
                color: isSaved ? "var(--pink)" : "var(--ink-4)",
                background: "none",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
              }}
              aria-label="Toggle favorite"
              type="button"
            >
              {isSaved ? "★" : "☆"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
