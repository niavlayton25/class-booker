import FuzeSchedule from "../components/FuzeSchedule";
import AppNav from "../components/AppNav";
import TabBar from "../components/TabBar";

type StudioClass = {
  id: string;
  title: string;
  startsAt: string | null;
  bookingStartsAt: string | null;
  duration: string | null;
  instructor: string | null;
  room: string | null;
  availableSpots: number | null;
  capacity: number | null;
};

async function getFuzeClasses(): Promise<StudioClass[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/schedules/fuze-house`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load Fuze House classes");
  }

  return res.json();
}

export default async function SchedulePage() {
  const fuzeClasses = await getFuzeClasses();

  return (
    <div className="page-container" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="page-bottom-pad" style={{ padding: "18px 12px 100px" }}>
        <FuzeSchedule classes={fuzeClasses} />
      </main>
      <TabBar />
    </div>
  );
}
