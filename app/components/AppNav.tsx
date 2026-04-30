"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const appTabs = [
  { label: "Schedule", href: "/schedule" },
  { label: "My Classes", href: "/my-classes" },
  { label: "Settings", href: "/settings" },
];

export default function AppNav({ publicView = false }: { publicView?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      suppressHydrationWarning
      style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderBottom: "1px solid var(--rule)",
        background: "var(--paper)",
        justifyContent: "space-between",
        position: "sticky",
        top: "0",
        zIndex: 40,
      }}
    >
      <Link
        href={publicView ? "/" : "/schedule"}
        style={{ textDecoration: "none" }}
      >
        <span
          suppressHydrationWarning
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: "36px",
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          Pilates<span suppressHydrationWarning style={{ color: "var(--pink)", fontStyle: "italic" }}>Pal</span>
        </span>
      </Link>

      {/* Desktop nav tabs (hidden on mobile via CSS) */}
      {!publicView && (
        <div
          className="desktop-nav-links"
          style={{ alignItems: "center", gap: 4 }}
        >
          {appTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                  background: isActive ? "var(--pink)" : "transparent",
                  color: isActive ? "#fff" : "var(--ink-3)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      {publicView && (
        <Link
          href="/login"
          style={{
            fontSize: "12px",
            color: "var(--ink-2)",
            fontWeight: 500,
            borderBottom: "1px solid var(--ink-3)",
            paddingBottom: "1px",
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
