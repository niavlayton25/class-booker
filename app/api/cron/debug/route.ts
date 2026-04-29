import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: pending, error } = await supabase
    .from("auto_book_preferences")
    .select(`
      id, user_id, class_session_id, class_title, booking_starts_at, status,
      mariana_tek_accounts ( id, token_expires_at )
    `)
    .eq("status", "pending")
    .lte("booking_starts_at", now);

  if (error) return NextResponse.json({ error: error.message });

  // Try decrypting the token for the first preference
  let tokenPreview = null;
  if (pending && pending.length > 0) {
    const account = Array.isArray(pending[0].mariana_tek_accounts)
      ? pending[0].mariana_tek_accounts[0]
      : pending[0].mariana_tek_accounts;

    if (account) {
      const { data: fullAccount } = await supabase
        .from("mariana_tek_accounts")
        .select("access_token")
        .eq("id", account.id)
        .single();

      if (fullAccount) {
        try {
          const token = await decrypt(fullAccount.access_token);
          tokenPreview = token.slice(0, 20) + "...";

          // Try the actual booking API
          const testRes = await fetch("https://fuzehouse.marianatek.com/api/customer/v1/me/reservations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              class_session: { id: pending[0].class_session_id },
              is_booked_for_me: true,
              reservation_type: "standard",
              payment_option: { id: "credit-884384" },
            }),
          });
          const testBody = await testRes.text();
          return NextResponse.json({
            pending,
            tokenPreview,
            bookingStatus: testRes.status,
            bookingResponse: testBody.slice(0, 500),
          });
        } catch (e) {
          return NextResponse.json({ pending, decryptError: String(e) });
        }
      }
    }
  }

  return NextResponse.json({ pending, now });
}
