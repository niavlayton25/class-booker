"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function linkClass(href: string) {
    const isActive = pathname === href;
    return `transition-colors ${isActive ? "text-pink font-semibold" : "text-gray-400 hover:text-pink"}`;
  }

  return (
    <nav className="bg-white border-b border-pink-light px-10 py-4 flex items-center gap-8">
      <span className="font-bold tracking-tight mr-4" style={{ fontSize: "40px", fontFamily: "var(--font-playfair)" }}>
        <span className="text-foreground">Pilates</span><span className="text-pink">Pal</span>
      </span>
      <Link href="/" className={linkClass("/")} style={{ fontSize: "20px" }}>Schedule</Link>
      <Link href="/favorites" className={linkClass("/favorites")} style={{ fontSize: "20px" }}>Favorites</Link>

      <div className="ml-auto flex items-center gap-6">
        {user ? (
          <>
            <Link href="/settings" className={linkClass("/settings")} style={{ fontSize: "20px" }}>Settings</Link>
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-pink transition-colors"
              style={{ fontSize: "20px" }}
              type="button"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" className={linkClass("/login")} style={{ fontSize: "20px" }}>Sign in</Link>
        )}
      </div>
    </nav>
  );
}
