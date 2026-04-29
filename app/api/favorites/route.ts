import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list all favorite class IDs for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ids: [] });

  const { data } = await supabase
    .from("favorites")
    .select("class_id")
    .eq("user_id", user.id);

  return NextResponse.json({ ids: (data ?? []).map((r) => r.class_id) });
}
