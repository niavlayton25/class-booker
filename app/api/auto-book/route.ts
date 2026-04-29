import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list user's auto-book preferences
export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("auto_book_preferences")
    .select("*")
    .eq("user_id", user.id)
    .order("booking_starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }

  return NextResponse.json({ preferences: data });
}

// POST — create an auto-book preference
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { classSessionId, classTitle, classStartsAt, bookingStartsAt } = body;

  if (!classSessionId || !bookingStartsAt) {
    return NextResponse.json(
      { error: "classSessionId and bookingStartsAt are required" },
      { status: 400 }
    );
  }

  // Get the user's MT account id
  const { data: mtAccount } = await supabase
    .from("mariana_tek_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mtAccount) {
    return NextResponse.json(
      { error: "No Fuze House account connected. Go to Settings to connect." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("auto_book_preferences")
    .upsert(
      {
        user_id: user.id,
        mt_account_id: mtAccount.id,
        class_session_id: classSessionId,
        class_title: classTitle ?? null,
        class_starts_at: classStartsAt ?? null,
        booking_starts_at: bookingStartsAt,
        status: "pending",
      },
      { onConflict: "user_id,class_session_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("auto-book upsert error:", error);
    return NextResponse.json({ error: "Failed to create preference" }, { status: 500 });
  }

  return NextResponse.json({ preference: data }, { status: 201 });
}
