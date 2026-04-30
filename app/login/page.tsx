"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppNav from "../components/AppNav";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        const onboarded = data.user?.user_metadata?.onboarding_completed;
        router.push(onboarded ? "/schedule" : "/onboarding");
        router.refresh();
      }
    }

    setLoading(false);
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 14px",
    fontFamily: "inherit",
    fontSize: 13,
    color: "var(--ink)",
    background: "var(--surface)",
    border: "1px solid var(--rule)",
    borderRadius: 8,
    outline: "none",
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

  return (
    <div style={{ minHeight: "100vh" }}>
      <AppNav publicView />
      <div
        style={{
          padding: "60px 24px 40px",
          display: "flex",
          flexDirection: "column",
          maxWidth: 480,
          margin: "0 auto",
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
          {mode === "signin" ? "Sign in" : "Create account"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 28,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            marginBottom: 10,
          }}
        >
          {mode === "signin" ? (
            <>
              Welcome <span style={{ fontStyle: "italic", color: "var(--pink)" }}>back.</span>
            </>
          ) : (
            <>
              Tell us a bit{" "}
              <span style={{ fontStyle: "italic", color: "var(--pink)" }}>about you.</span>
            </>
          )}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 28, lineHeight: 1.55 }}
        >
          {mode === "signin"
            ? "Sign in to your PilatesPal account."
            : "We're letting people in slowly. We'll email you when there's a spot."}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldStyle}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#B0203F" }}>{error}</div>
          )}
          {message && (
            <div style={{ fontSize: 12, color: "var(--ok)" }}>{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 50,
              marginTop: 14,
              background: "var(--ink)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : mode === "signin" ? "Sign in →" : "Request access →"}
          </button>
        </form>

        <div
          style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center", marginTop: 18 }}
        >
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
            style={{
              color: "var(--ink)",
              background: "none",
              border: "none",
              borderBottom: "1px solid var(--ink-3)",
              cursor: "pointer",
              fontSize: 11,
              padding: 0,
            } as React.CSSProperties}
            type="button"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
