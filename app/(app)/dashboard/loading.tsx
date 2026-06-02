import { Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <main className="page">
      <section className="dashboard-header">
        <div>
          <Skeleton width={88} height={12} radius={4} style={{ marginBottom: 12 }} />
          <Skeleton width={320} height={28} radius={6} style={{ marginBottom: 10 }} />
          <Skeleton width={420} height={14} radius={4} />
        </div>
        <div>
          <Skeleton width={120} height={42} radius={8} />
        </div>
      </section>

      <section className="workspace-command" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="command-cell" key={index}>
            <Skeleton width={36} height={36} radius={8} />
            <div className="skeleton-stack" style={{ width: "100%" }}>
              <Skeleton width={64} height={18} radius={4} />
              <Skeleton width={110} height={12} radius={4} />
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="library-section">
          <div className="section-title">
            <div>
              <Skeleton width={64} height={12} radius={4} style={{ marginBottom: 10 }} />
              <Skeleton width={180} height={22} radius={5} />
            </div>
            <Skeleton width={72} height={24} radius={999} />
          </div>

          <div className="pack-ledger" aria-hidden="true">
            <div className="pack-ledger-head">
              <span>Pack</span>
              <span>Sources</span>
              <span>Status</span>
              <span aria-hidden="true" />
            </div>
            <div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="pack-row" key={index} style={{ cursor: "default" }}>
                  <div className="pack-main">
                    <Skeleton width="60%" height={16} radius={5} style={{ marginBottom: 8 }} />
                    <Skeleton width="85%" height={12} radius={4} />
                  </div>
                  <div className="pack-metric">
                    <Skeleton width={70} height={12} radius={4} />
                    <Skeleton width="100%" height={6} radius={999} />
                  </div>
                  <Skeleton width={72} height={22} radius={999} />
                  <Skeleton width={16} height={16} radius={4} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
