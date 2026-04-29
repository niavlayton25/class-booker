import AppNav from "../components/AppNav";
import TabBar from "../components/TabBar";

export default function MyClassesLoading() {
  return (
    <div className="page-container" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="page-bottom-pad" style={{ padding: "18px 12px 100px" }}>
        {/* Greeting */}
        <div style={{ height: 28, width: 180, background: "var(--rule)", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, width: 100, background: "var(--rule)", borderRadius: 4, marginBottom: 24 }} />
        {/* Section divider */}
        <div style={{ height: 10, width: 120, background: "var(--rule)", borderRadius: 4, marginBottom: 16 }} />
        {/* Class rows */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ height: 14, width: 160, background: "var(--rule)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 11, width: 120, background: "var(--rule)", borderRadius: 4 }} />
            </div>
            <div style={{ height: 20, width: 36, background: "var(--rule)", borderRadius: 999 }} />
          </div>
        ))}
      </main>
      <TabBar />
    </div>
  );
}
