"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Schedule", href: "/schedule" },
  { label: "My Classes", href: "/my-classes" },
  { label: "Settings", href: "/settings" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div
      className="tab-bar-mobile"
      style={{
        position: "fixed",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 28px)",
        maxWidth: 420,
        height: 54,
        background: "var(--surface)",
        border: "1px solid var(--ink)",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href === "/schedule" && pathname === "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 500,
              padding: "10px 12px",
              borderRadius: 999,
              background: isActive ? "var(--pink)" : "transparent",
              color: isActive ? "#fff" : "var(--ink-3)",
              textDecoration: "none",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
