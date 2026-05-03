import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";

const MT_BASE = "https://fuzehouse.marianatek.com";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: account } = await service
    .from("mariana_tek_accounts")
    .select("access_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return NextResponse.json({ credits: [], memberships: [] });
  }

  const accessToken = await decrypt(account.access_token);

  const [creditsRes, membershipsRes] = await Promise.all([
    fetch(`${MT_BASE}/api/customer/v1/me/credits?is_active=True&page_size=20`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch(`${MT_BASE}/api/customer/v1/me/memberships?page_size=20`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);

  const creditsData = creditsRes.ok ? await creditsRes.json() : null;
  const membershipsData = membershipsRes.ok ? await membershipsRes.json() : null;

  const credits = creditsData?.results ?? [];
  const memberships = membershipsData?.results ?? [];

  // Log raw first result so we can see the actual field names
  if (credits.length > 0) console.log("[mt-credits] raw first credit:", JSON.stringify(credits[0]));
  if (memberships.length > 0) console.log("[mt-memberships] raw first membership:", JSON.stringify(memberships[0]));

  return NextResponse.json({ credits, memberships });
}
