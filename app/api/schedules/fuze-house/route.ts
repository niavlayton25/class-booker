import { NextResponse } from "next/server";

type MarianaClass = {
  id: string;
  start_datetime?: string;
  booking_start_datetime?: string;
  available_spot_count?: number;
  capacity?: number;
  class_type?: {
    name?: string;
    duration_formatted?: string;
  };
  classroom?: {
    name?: string;
  };
  classroom_name?: string;
  instructors?: Array<{
    name?: string;
  }>;
};

export async function GET() {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 21);

  const minDate = today.toLocaleDateString("en-CA");
  const maxDate = futureDate.toLocaleDateString("en-CA");

  const res = await fetch(
    `https://fuzehouse.marianatek.com/api/customer/v1/classes?min_start_date=${minDate}&max_start_date=${maxDate}&page_size=500&location=48817&region=48608`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream request failed: ${res.status}` },
      { status: 500 }
    );
  }

  const data = await res.json();

  const classes = (data.results ?? []).map((item: MarianaClass) => ({
    id: item.id,
    title: item.class_type?.name ?? "Untitled class",
    startsAt: item.start_datetime ?? null,
    bookingStartsAt: item.booking_start_datetime ?? null,
    duration: item.class_type?.duration_formatted ?? null,
    instructor: item.instructors?.[0]?.name ?? null,
    room: item.classroom?.name ?? item.classroom_name ?? null,
    availableSpots: item.available_spot_count ?? null,
    capacity: item.capacity ?? null,
  }));

  return NextResponse.json(classes);
}