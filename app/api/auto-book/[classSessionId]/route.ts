import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE — cancel an auto-book preference
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ classSessionId: string }> }
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classSessionId } = await params;

  const { error } = await supabase
    .from("auto_book_preferences")
    .update({ status: "cancelled" })
    .eq("user_id", user.id)
    .eq("class_session_id", classSessionId)
    .eq("status", "pending");

  if (error) {
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// GET — status for a single class session
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ classSessionId: string }> }
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classSessionId } = await params;

  const { data } = await supabase
    .from("auto_book_preferences")
    .select("status, booking_starts_at, recurring")
    .eq("user_id", user.id)
    .eq("class_session_id", classSessionId)
    .maybeSingle();

  return NextResponse.json({ preference: data ?? null });
}
