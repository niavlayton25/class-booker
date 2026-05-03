import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { decrypt, encrypt } from "@/lib/crypto";
import { Resend } from "resend";

const MT_BASE = "https://fuzehouse.marianatek.com";
const SCHEDULE_API = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/schedules/fuze-house`;

// Find next week's session matching the same class title, day of week, and hour
async function findNextOccurrence(
  classTitle: string,
  classStartsAt: string
): Promise<{ id: string; startsAt: string; bookingStartsAt: string } | null> {
  try {
    const res = await fetch(SCHEDULE_API, { cache: "no-store" });
    if (!res.ok) return null;
    const classes = await res.json();

    const original = new Date(classStartsAt);
    const originalDay = original.getUTCDay();
    const originalHour = original.getUTCHours();
    const originalMinute = original.getUTCMinutes();

    // Find future sessions with the same title, day of week, and time
    const match = classes.find((cls: { id: string; title: string; startsAt: string | null; bookingStartsAt: string | null }) => {
      if (cls.title !== classTitle || !cls.startsAt || !cls.bookingStartsAt) return false;
      const d = new Date(cls.startsAt);
      return (
        d > original &&
        d.getUTCDay() === originalDay &&
        d.getUTCHours() === originalHour &&
        d.getUTCMinutes() === originalMinute
      );
    });

    if (!match) return null;
    return { id: match.id, startsAt: match.startsAt, bookingStartsAt: match.bookingStartsAt };
  } catch {
    return null;
  }
}

async function refreshMTToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
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

async function sendBookingConfirmation(
  userId: string,
  classTitle: string,
  classStartsAt: string | null
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = createServiceClient();
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user?.email) return;

    const classTime = classStartsAt
      ? new Date(classStartsAt).toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })
      : "TBD";

    await resend.emails.send({
      from: "PilatesPal <noreply@pilatespal.app>",
      to: user.email,
      subject: `✓ Booked: ${classTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #E91E8C;">You're booked! 🎉</h2>
          <p style="font-size: 16px; color: #1a1a1a;">
            <strong>${classTitle}</strong><br/>
            ${classTime}
          </p>
          <p style="color: #888; font-size: 14px;">
            PilatesPal auto-booked this class for you the moment the booking window opened.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://pilatespal.vercel.app"}/favorites"
             style="display: inline-block; margin-top: 16px; background: #E91E8C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View your favorites →
          </a>
        </div>
      `,
    });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

async function fetchPaymentOption(
  accessToken: string,
  classSessionId: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${MT_BASE}/api/customer/v1/classes/${classSessionId}/payment_options`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const options: Array<{ id: string; payment_method_type?: string; payment_method?: { type?: string; credits_remaining?: number } }> = data.results ?? data;
    if (!Array.isArray(options) || options.length === 0) return null;

    console.log("[payment_options] available for", classSessionId, JSON.stringify(options.map(o => ({ id: o.id, type: o.payment_method_type ?? o.payment_method?.type }))));

    // Prefer pass/credit options over credit card so we use the user's class pack
    const passOption = options.find((o) => {
      const type = o.payment_method_type ?? o.payment_method?.type ?? "";
      return /pass|credit|package|membership/i.test(type);
    });

    const chosen = (passOption ?? options[0]).id ?? null;
    console.log("[payment_options] chosen:", chosen, passOption ? "(pass)" : "(fallback to first)");
    return chosen;
  } catch {
    return null;
  }
}

async function bookClass(
  accessToken: string,
  classSessionId: string,
): Promise<{ status: number; body: string }> {
  // Fetch available payment options for this specific class session so we can
  // pass the right one. MT returns 422 "payments do not satisfy the cost" when
  // no payment_option is provided for a class that has a non-zero cost.
  const paymentOptionId = await fetchPaymentOption(accessToken, classSessionId);

  const payload: Record<string, unknown> = {
    class_session: { id: classSessionId },
    reservation_type: "standard",
  };

  if (paymentOptionId) {
    payload.payment_option = { id: paymentOptionId };
    console.log("[bookClass] using payment_option:", paymentOptionId);
  } else {
    console.log("[bookClass] no payment option found, proceeding without");
  }

  const res = await fetch(`${MT_BASE}/api/customer/v1/me/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  console.log("[bookClass] status:", res.status, "body:", body.slice(0, 500));
  return { status: res.status, body };
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Fetch all pending preferences whose booking window has opened
  const { data: pending, error } = await supabase
    .from("auto_book_preferences")
    .select(`
      id,
      user_id,
      class_session_id,
      class_title,
      class_starts_at,
      booking_starts_at,
      recurring,
      mt_account_id,
      mariana_tek_accounts (
        id,
        access_token,
        refresh_token,
        token_expires_at,
        payment_option_id
      )
    `)
    .eq("status", "pending")
    .lte("booking_starts_at", now);

  if (error) {
    console.error("cron fetch error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ processed: 0, succeeded: 0, failed: 0 });
  }

  const results = await Promise.all(
    pending.map(async (pref) => {
      const account = Array.isArray(pref.mariana_tek_accounts)
        ? pref.mariana_tek_accounts[0]
        : pref.mariana_tek_accounts;

      if (!account) {
        await supabase
          .from("auto_book_preferences")
          .update({ status: "failed" })
          .eq("id", pref.id);
        return { id: pref.id, succeeded: false, reason: "no_account" };
      }

      let accessToken = await decrypt(account.access_token);

      // Refresh if expiring within 5 minutes
      const expiresAt = account.token_expires_at
        ? new Date(account.token_expires_at).getTime()
        : null;
      const fiveMinutes = 5 * 60 * 1000;
      if (expiresAt && expiresAt - Date.now() < fiveMinutes && account.refresh_token) {
        const refreshed = await refreshMTToken(await decrypt(account.refresh_token));
        if (!refreshed) {
          await supabase
            .from("mariana_tek_accounts")
            .update({ needs_reconnect: true })
            .eq("id", account.id);
          await supabase
            .from("auto_book_preferences")
            .update({ status: "failed" })
            .eq("id", pref.id);
          return { id: pref.id, succeeded: false, reason: "refresh_failed" };
        }
        accessToken = refreshed.accessToken;
        await supabase.from("mariana_tek_accounts").update({
          access_token: await encrypt(refreshed.accessToken),
          refresh_token: await encrypt(refreshed.refreshToken),
          token_expires_at: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
        }).eq("id", account.id);
      }

      const { status, body } = await bookClass(
        accessToken,
        pref.class_session_id,
      );

      const succeeded = status === 201 || status === 409;
      const newStatus = succeeded ? "booked" : status >= 500 ? "pending" : "failed";

      if (newStatus !== "pending") {
        await supabase
          .from("auto_book_preferences")
          .update({ status: newStatus })
          .eq("id", pref.id);
      }

      await supabase.from("booking_attempts").insert({
        preference_id: pref.id,
        user_id: pref.user_id,
        succeeded,
        mt_response_status: status,
        mt_response_body: body.slice(0, 2000),
      });

      // Send confirmation email
      if (succeeded) {
        sendBookingConfirmation(pref.user_id, pref.class_title ?? "Your class", pref.class_starts_at);
      }

      // Re-queue next occurrence for recurring preferences
      if (succeeded && pref.recurring && pref.class_title && pref.class_starts_at) {
        const next = await findNextOccurrence(pref.class_title, pref.class_starts_at);
        if (next) {
          await supabase.from("auto_book_preferences").upsert(
            {
              user_id: pref.user_id,
              mt_account_id: pref.mt_account_id,
              class_session_id: next.id,
              class_title: pref.class_title,
              class_starts_at: next.startsAt,
              booking_starts_at: next.bookingStartsAt,
              status: "pending",
              recurring: true,
            },
            { onConflict: "user_id,class_session_id" }
          );
        }
      }

      return { id: pref.id, succeeded };
    })
  );

  const succeeded = results.filter((r) => r.succeeded).length;
  const failed = results.filter((r) => !r.succeeded).length;

  return NextResponse.json({
    processed: results.length,
    succeeded,
    failed,
  });
}
