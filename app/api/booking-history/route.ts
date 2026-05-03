import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("booking_attempts")
    .select(`
      id,
      attempted_at,
      succeeded,
      mt_response_status,
      mt_response_body,
      error_message,
      auto_book_preferences (
        class_title,
        class_starts_at,
        class_session_id
      )
    `)
    .eq("user_id", user.id)
    .order("attempted_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }

  return NextResponse.json({ attempts: data });
}
