"use client";

import { useEffect, useState } from "react";

type Step = "intro" | "login" | "snippet" | "done";

export default function ConnectAccountFlow({ onConnected }: { onConnected: () => void }) {
  const [step, setStep] = useState<Step>("intro");
  const [snippet, setSnippet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);

  useEffect(() => {
    // Generate connect token and build snippet
    fetch("/api/auth/mt-connect-token")
      .then((r) => r.json())
      .then(({ token }) => {
        if (!token) return;
        const origin = window.location.origin;
        setSnippet(
          `const c = document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('mt.cookie.settings.'));\nconst val = JSON.parse(decodeURIComponent(c.split('=').slice(1).join('=')));\nconsole.log('cookie data:', val);\nfetch('${origin}/api/auth/mt-connect', {\n  method: 'POST',\n  headers: {'Content-Type':'application/json','X-Connect-Token':'${token}'},\n  body: JSON.stringify(val.tokenData || val)\n}).then(r => r.json()).then(d => { console.log(d); alert(d.ok ? 'Connected! Go back to PilatesPal.' : 'Error: ' + d.error); });`
        );
      });
  }, []);

  function openPopup() {
    const w = window.open(
      "https://fuzehouse.marianaiframes.com/iframe/",
      "fuze-login",
      "width=480,height=700,left=200,top=100"
    );
    setPopup(w);
    setStep("login");
  }

  async function copySnippet() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function checkConnection() {
    setChecking(true);
    try {
      const res = await fetch("/api/auth/mt-connect");
      const data = await res.json();
      if (data.connected) {
        popup?.close();
        setStep("done");
        setTimeout(onConnected, 1500);
      } else {
        alert("Not connected yet — make sure you ran the snippet in the Fuze House tab.");
      }
    } finally {
      setChecking(false);
    }
  }

  if (step === "intro") {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">
          Connect your Fuze House account so PilatesPal can book classes for you automatically.
        </p>
        <p className="text-sm text-gray-400">
          This takes about 2 minutes and only needs to be done once.
        </p>
        <button
          onClick={openPopup}
          className="w-full bg-pink text-white rounded-xl py-3 font-medium hover:bg-pink-dark transition-colors"
          type="button"
        >
          Connect Fuze House account →
        </button>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3 bg-pink-light rounded-xl border border-pink/20">
          <span className="text-2xl">1️⃣</span>
          <p className="text-sm text-gray-700">
            <strong>Log in to Fuze House</strong> in the popup window that just opened.
            Already logged in? Click Next below.
          </p>
        </div>

        <button
          onClick={() => setStep("snippet")}
          className="w-full bg-pink text-white rounded-xl py-3 font-medium hover:bg-pink-dark transition-colors"
          type="button"
        >
          Next →
        </button>
      </div>
    );
  }

  if (step === "snippet") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-3 bg-pink-light rounded-xl border border-pink/20">
          <span className="text-2xl shrink-0">2️⃣</span>
          <p className="text-sm text-gray-700">
            In the <strong>Fuze House popup</strong>, open the browser console:<br />
            <span className="font-mono bg-white px-1 rounded text-xs">Cmd + Option + J</span> on Mac &nbsp;·&nbsp;
            <span className="font-mono bg-white px-1 rounded text-xs">Ctrl + Shift + J</span> on Windows
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 bg-pink-light rounded-xl border border-pink/20">
          <span className="text-2xl shrink-0">3️⃣</span>
          <div className="text-sm text-gray-700 w-full">
            <p className="mb-2"><strong>Copy this snippet</strong> and paste it into the console, then press Enter:</p>
            <div className="relative">
              <pre className="bg-white border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-32">
                {snippet ?? "Generating..."}
              </pre>
              <button
                onClick={copySnippet}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-pink text-white rounded hover:bg-pink-dark transition-colors"
                type="button"
              >
                {copied ? "Copied! ✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-pink-light rounded-xl border border-pink/20">
          <span className="text-2xl shrink-0">4️⃣</span>
          <p className="text-sm text-gray-700">
            You should see an alert saying <strong>"Connected! Go back to PilatesPal."</strong> — then click the button below.
          </p>
        </div>

        <button
          onClick={checkConnection}
          disabled={checking}
          className="w-full bg-pink text-white rounded-xl py-3 font-medium hover:bg-pink-dark transition-colors disabled:opacity-50"
          type="button"
        >
          {checking ? "Checking..." : "I ran the snippet — confirm connection ✓"}
        </button>
      </div>
    );
  }

  // done
  return (
    <div className="text-center space-y-2 py-4">
      <div className="text-4xl">🎉</div>
      <p className="font-semibold text-green-700">Connected!</p>
      <p className="text-sm text-gray-400">You can now auto-book classes from your Favorites.</p>
    </div>
  );
}
