"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppNav from "../components/AppNav";

const STUDIOS = ["Fuze House Tribeca"];
const FREQUENCIES = ["1–2 classes / week", "3–4 classes / week", "5+ classes / week"];

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 14px",
  fontFamily: "inherit",
  fontSize: 14,
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--rule)",
  borderRadius: 10,
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: 9,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  fontWeight: 600,
  marginBottom: 14,
};

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [studio, setStudio] = useState(STUDIOS[0]);
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = name.trim().split(" ")[0];

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !frequency) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.trim(), studio, frequency },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStep(2);
  }

  async function handleLetsGo() {
    setLoading(true);
    await supabase.auth.updateUser({ data: { onboarding_completed: true } });
    router.push("/schedule");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <AppNav publicView />

      <div
        style={{
          padding: "48px 24px 40px",
          display: "flex",
          flexDirection: "column",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {step === 1 ? (
          <>
            <div style={eyebrowStyle}>Step 1 of 2 · Getting started</div>
            <div
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                marginBottom: 10,
              }}
            >
              Tell us a bit{" "}
              <span style={{ fontStyle: "italic", color: "var(--pink)" }}>about you.</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 32, lineHeight: 1.55 }}>
              Three quick questions so PilatesPal can start working for you.
            </div>

            <form onSubmit={handleContinue} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle} htmlFor="name">Your name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah"
                  style={fieldStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="studio">Home studio</label>
                <div style={{ position: "relative" }}>
                  <select
                    id="studio"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    style={{ ...fieldStyle, paddingRight: 36, cursor: "pointer" }}
                  >
                    {STUDIOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--ink-3)",
                      fontSize: 11,
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="frequency">How often per week?</label>
                <div style={{ position: "relative" }}>
                  <select
                    id="frequency"
                    value={frequency}
                    required
                    onChange={(e) => setFrequency(e.target.value)}
                    style={{ ...fieldStyle, paddingRight: 36, cursor: "pointer", color: frequency ? "var(--ink)" : "var(--ink-4)" }}
                  >
                    <option value="" disabled>Select frequency</option>
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--ink-3)",
                      fontSize: 11,
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              {error && <div style={{ fontSize: 12, color: "#B0203F" }}>{error}</div>}

              <button
                type="submit"
                disabled={loading || !name.trim() || !frequency}
                style={{
                  height: 52,
                  marginTop: 8,
                  background: "var(--ink)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: loading || !name.trim() || !frequency ? "default" : "pointer",
                  opacity: loading || !name.trim() || !frequency ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {loading ? "..." : "Continue →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={eyebrowStyle}>Step 2 of 2 · Welcome</div>
            <div
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 36,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                marginBottom: 10,
              }}
            >
              Welcome,{" "}
              <span style={{ fontStyle: "italic", color: "var(--pink)" }}>{firstName}.</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 40, lineHeight: 1.55 }}>
              Here's what happens next.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 }}>
              {[
                { n: "01", title: "Connect your studio.", sub: "30 seconds. No password leaves your device." },
                { n: "02", title: "Star your favorite classes.", sub: "The ones you already book every week." },
                { n: "03", title: "Let us do the rest.", sub: "Auto-book opens. You show up." },
              ].map(({ n, title, sub }) => (
                <div key={n} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 28,
                      fontStyle: "italic",
                      color: "var(--pink)",
                      lineHeight: 1,
                      flexShrink: 0,
                      width: 40,
                    }}
                  >
                    {n}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleLetsGo}
              disabled={loading}
              style={{
                height: 52,
                background: "var(--ink)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "..." : "Let's go →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
