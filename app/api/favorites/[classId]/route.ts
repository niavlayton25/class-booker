import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST — add a favorite
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  await supabase.from("favorites").upsert(
    { user_id: user.id, class_id: classId },
    { onConflict: "user_id,class_id" }
  );

  return NextResponse.json({ ok: true });
}

// DELETE — remove a favorite
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  await supabase.from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("class_id", classId);

  return NextResponse.json({ ok: true });
}
