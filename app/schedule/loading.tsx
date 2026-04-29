import AppNav from "../components/AppNav";
import TabBar from "../components/TabBar";

export default function ScheduleLoading() {
  return (
    <div className="page-container" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="page-bottom-pad" style={{ padding: "18px 12px 100px" }}>
        {/* Studio line */}
        <div style={{ height: 12, width: 160, background: "var(--rule)", borderRadius: 4, marginBottom: 12 }} />
        {/* Title */}
        <div style={{ height: 28, width: 140, background: "var(--rule)", borderRadius: 4, marginBottom: 18 }} />
        {/* Day strip */}
        <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 48, background: "var(--rule)", borderRadius: 6 }} />
          ))}
        </div>
        {/* Class rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ height: 14, width: 160, background: "var(--rule)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 11, width: 120, background: "var(--rule)", borderRadius: 4 }} />
            </div>
            <div style={{ height: 22, width: 22, background: "var(--rule)", borderRadius: 999 }} />
          </div>
        ))}
      </main>
      <TabBar />
    </div>
  );
}
