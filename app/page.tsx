import Link from "next/link";
import AppNav from "./components/AppNav";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <AppNav publicView />

      {/* HERO */}
      <div className="page-container" style={{ paddingTop: "80px", paddingBottom: "64px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--pink)",
            fontWeight: 600,
            background: "var(--pink-soft)",
            border: "1px solid var(--pink-2)",
            padding: "5px 10px",
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          ★ Private beta · invite only
        </div>
        <h1
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 400,
            fontSize: "clamp(40px, 5.5vw, 80px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            maxWidth: 900,
            margin: "0 auto 24px",
          }}
        >
          Never miss your{" "}
          <span style={{ fontStyle: "italic", color: "var(--pink)" }}>favorite pilates</span>{" "}
          class ever again.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--ink-2)",
            lineHeight: 1.6,
            maxWidth: 520,
            margin: "0 auto 36px",
          }}
        >
          PilatesPal watches your studio&apos;s schedule and books the classes you
          love the moment they open. You just show up.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              padding: "0 32px",
              background: "var(--ink)",
              color: "#fff",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Request access →
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: 13,
              color: "var(--ink-3)",
              textDecoration: "none",
              borderBottom: "1px solid var(--ink-4)",
              paddingBottom: 1,
            }}
          >
            Already in the beta? Sign in
          </Link>
        </div>
      </div>

      {/* PROBLEM FRAMING — full width */}
      <div
        style={{
          background: "var(--paper-2)",
          padding: "36px 24px",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          Built for boutique NYC studios
        </div>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: "clamp(18px, 2.5vw, 26px)",
            lineHeight: 1.4,
            color: "var(--ink)",
            letterSpacing: "-0.005em",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          Booking should be the{" "}
          <span style={{ color: "var(--pink)", fontStyle: "italic" }}>easiest part</span>{" "}
          of going to class. It isn&apos;t.
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="page-container" style={{ paddingTop: "56px", paddingBottom: "56px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          How it works
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
          {[
            {
              n: "01",
              t: "Connect your studio.",
              b: "A 30-second handshake. Your login stays on your device.",
            },
            {
              n: "02",
              t: "Star the classes you love.",
              b: "Pick your regulars. Hot Pilates with Alexa. Sculpt with Olivia.",
            },
            {
              n: "03",
              t: "We do the booking.",
              b: "When the class opens, we book it. You get a confirmation. Done.",
            },
          ].map((s) => (
            <div key={s.n}>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontStyle: "italic",
                  fontSize: 36,
                  color: "var(--pink)",
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 18,
                  color: "var(--ink)",
                  marginBottom: 8,
                }}
              >
                {s.t}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
                {s.b}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCT PREVIEW — full width */}
      <div style={{ background: "var(--paper-2)", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
        <div className="page-container" style={{ paddingTop: "48px", paddingBottom: "48px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            A peek inside
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              background: "var(--paper)",
              padding: "28px 20px",
              border: "1px solid var(--rule)",
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            {/* Mini phone — Schedule */}
            <div
              style={{
                flex: 1,
                background: "var(--paper)",
                borderRadius: 12,
                border: "1px solid var(--ink)",
                padding: 12,
                filter: "blur(2.5px)",
                transform: "rotate(-2deg)",
              }}
            >
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 10, color: "var(--ink)", marginBottom: 8 }}>
                Pilates<span style={{ color: "var(--pink)", fontStyle: "italic" }}>Pal</span>
              </div>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 13, color: "var(--ink)", marginBottom: 6 }}>
                This <i style={{ color: "var(--pink)" }}>week.</i>
              </div>
              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {[27, 28, 29, 30, 1].map((n, i) => (
                  <div key={n} style={{ flex: 1, height: 20, borderRadius: 3, fontSize: 9, textAlign: "center", lineHeight: "20px", background: i === 1 ? "var(--pink)" : "var(--surface)", color: i === 1 ? "#fff" : "var(--ink)", border: `1px solid ${i === 1 ? "var(--pink)" : "var(--rule)"}` }}>{n}</div>
                ))}
              </div>
              {[true, false, false, false].map((saved, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px", borderRadius: 4, background: saved ? "var(--pink-soft)" : "transparent", borderBottom: !saved ? "1px solid var(--rule)" : "none", marginBottom: 3 }}>
                  <div>
                    <div style={{ height: 6, width: 70, background: "var(--ink-2)", borderRadius: 1, marginBottom: 3 }} />
                    <div style={{ height: 5, width: 50, background: "var(--ink-3)", borderRadius: 1 }} />
                  </div>
                  <div style={{ fontSize: 13, color: saved ? "var(--pink)" : "var(--ink-4)" }}>{saved ? "★" : "☆"}</div>
                </div>
              ))}
            </div>

            {/* Mini phone — My Classes */}
            <div
              style={{
                flex: 1,
                background: "var(--paper)",
                borderRadius: 12,
                border: "1px solid var(--ink)",
                padding: 12,
                filter: "blur(2.5px)",
                transform: "rotate(2deg)",
              }}
            >
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 10, color: "var(--ink)", marginBottom: 8 }}>
                Pilates<span style={{ color: "var(--pink)", fontStyle: "italic" }}>Pal</span>
              </div>
              <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 13, color: "var(--ink)", marginBottom: 8 }}>
                Hi <i style={{ color: "var(--pink)" }}>Sarah.</i>
              </div>
              {[0, 1].map((i) => (
                <div key={i} style={{ background: "#F4FAF6", border: "1px solid var(--ok)", borderRadius: 4, padding: 7, marginBottom: 5 }}>
                  <div style={{ height: 6, width: 70, background: "var(--ink-2)", borderRadius: 1, marginBottom: 3 }} />
                  <div style={{ height: 5, width: 50, background: "var(--ink-3)", borderRadius: 1, marginBottom: 4 }} />
                  <div style={{ height: 5, width: 46, background: "var(--ok)", borderRadius: 1 }} />
                </div>
              ))}
            </div>

            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(242,237,233,0) 60%, var(--paper) 100%)" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 14, fontStyle: "italic", fontFamily: "var(--font-fraunces), serif" }}>
            Schedule. Saved classes. Auto-book.
          </div>
        </div>
      </div>

      {/* SECONDARY CTA */}
      <div className="page-container" style={{ paddingTop: "60px", paddingBottom: "60px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: "clamp(22px, 3vw, 36px)",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            marginBottom: 24,
          }}
        >
          Spots in the beta are limited.
        </div>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 52,
            padding: "0 40px",
            background: "var(--ink)",
            color: "#fff",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Request access →
        </Link>
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: "24px 32px",
          borderTop: "1px solid var(--rule)",
          fontSize: 11,
          color: "var(--ink-3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 14, color: "var(--ink)" }}>
          Pilates<span style={{ color: "var(--pink)", fontStyle: "italic" }}>Pal</span>
        </span>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Made in NYC · 2026
        </span>
      </div>
    </div>
  );
}
