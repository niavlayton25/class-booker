import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { decrypt, encrypt } from "@/lib/crypto";

const MT_BASE = "https://fuzehouse.marianatek.com";

async function refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const res = await fetch(`${MT_BASE}/o/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.MT_CLIENT_ID ?? "",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in ?? 604800,
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: account } = await service
    .from("mariana_tek_accounts")
    .select("id, access_token, refresh_token, token_expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return NextResponse.json({ credits: [], memberships: [] });
  }

  let accessToken = await decrypt(account.access_token);

  // Refresh if expired or expiring within 5 minutes
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : null;
  if (expiresAt && expiresAt - Date.now() < 5 * 60 * 1000 && account.refresh_token) {
    console.log("[credits] token expiring, refreshing...");
    const refreshed = await refreshToken(await decrypt(account.refresh_token));
    if (refreshed) {
      accessToken = refreshed.accessToken;
      await service.from("mariana_tek_accounts").update({
        access_token: await encrypt(refreshed.accessToken),
        refresh_token: await encrypt(refreshed.refreshToken),
        token_expires_at: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
      }).eq("id", account.id);
    }
  }

  const [creditsRes, membershipsRes] = await Promise.all([
    fetch(`${MT_BASE}/api/customer/v1/me/credits?is_active=True&page_size=20`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch(`${MT_BASE}/api/customer/v1/me/memberships?page_size=20`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);

  console.log("[credits] MT status:", creditsRes.status, membershipsRes.status);

  const creditsData = creditsRes.ok ? await creditsRes.json() : null;
  const membershipsData = membershipsRes.ok ? await membershipsRes.json() : null;

  const credits = creditsData?.results ?? [];
  const memberships = membershipsData?.results ?? [];

  if (credits.length > 0) console.log("[credits] raw first:", JSON.stringify(credits[0]));

  return NextResponse.json({ credits, memberships });
}
