import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encrypt, verifyConnectToken } from "@/lib/crypto";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://fuzehouse.marianaiframes.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Connect-Token",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// POST — receive token from bookmarklet and store it
export async function POST(req: NextRequest) {
  // Support two auth methods:
  // 1. X-Connect-Token header (from bookmarklet/console — cross-origin safe)
  // 2. Supabase session cookie (from same-origin requests)
  let userId: string | null = null;

  const connectToken = req.headers.get("x-connect-token");
  if (connectToken) {
    userId = await verifyConnectToken(connectToken);
    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired connect token" }, { status: 401, headers: CORS_HEADERS });
    }
  } else {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }
    userId = user.id;
  }

  const supabase = createServiceClient();
  const body = await req.json();
  const { accessToken, refreshToken, expiresIn, tokenType } = body;

  if (!accessToken) {
    return NextResponse.json({ error: "accessToken is required" }, { status: 400, headers: CORS_HEADERS });
  }

  const encryptedAccess = await encrypt(accessToken);
  const encryptedRefresh = refreshToken ? await encrypt(refreshToken) : null;

  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("mariana_tek_accounts")
    .upsert(
      {
        user_id: userId,
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        token_expires_at: expiresAt,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("mt-connect upsert error:", error);
    return NextResponse.json({ error: "Failed to save account" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}

// GET — check connection status
export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const { data } = await supabase
    .from("mariana_tek_accounts")
    .select("id, connected_at, token_expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ connected: !!data, account: data ?? null });
}

// DELETE — disconnect MT account
export async function DELETE() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("mariana_tek_accounts")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
