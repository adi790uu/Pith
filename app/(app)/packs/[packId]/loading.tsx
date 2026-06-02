import { Skeleton } from "@/components/skeleton";

export default function PackLoading() {
  return (
    <main className="page">
      <div style={{ marginBottom: 20 }}>
        <Skeleton width={120} height={36} radius={8} />
      </div>

      <section className="page-header">
        <div>
          <Skeleton width={80} height={12} radius={4} style={{ marginBottom: 12 }} />
          <Skeleton width="60%" height={30} radius={6} style={{ marginBottom: 10 }} />
          <Skeleton width="80%" height={14} radius={4} />
        </div>
        <div className="detail-toolbar" style={{ gap: 10 }}>
          <Skeleton width={86} height={24} radius={999} />
          <Skeleton width={120} height={42} radius={8} />
          <Skeleton width={134} height={42} radius={8} />
        </div>
      </section>

      <section className="detail-layout">
        <div className="editor-frame">
          <div className="editor-topline">
            <div>
              <Skeleton width={96} height={12} radius={4} style={{ marginBottom: 10 }} />
              <Skeleton width={220} height={22} radius={5} />
            </div>
            <Skeleton width={84} height={14} radius={4} />
          </div>
          <div className="editor-canvas">
            <Skeleton width="100%" height={6} radius={999} />
            <article className="document-sheet" style={{ marginTop: 28 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="document-block" key={index}>
                  <Skeleton
                    width={120}
                    height={12}
                    radius={4}
                    style={{ marginBottom: 12 }}
                  />
                  <Skeleton
                    width="70%"
                    height={22}
                    radius={5}
                    style={{ marginBottom: 14 }}
                  />
                  <div className="skeleton-stack">
                    <Skeleton width="100%" height={12} radius={4} />
                    <Skeleton width="95%" height={12} radius={4} />
                    <Skeleton width="80%" height={12} radius={4} />
                  </div>
                </div>
              ))}
            </article>
          </div>
        </div>

        <aside className="side-rail">
          <div className="rail-section">
            <Skeleton width={70} height={12} radius={4} style={{ marginBottom: 12 }} />
            <Skeleton width={160} height={22} radius={5} style={{ marginBottom: 18 }} />
            <div className="skeleton-stack">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="skeleton-card" key={index}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "space-between"
                    }}
                  >
                    <Skeleton width="60%" height={14} radius={4} />
                    <Skeleton width={56} height={20} radius={999} />
                  </div>
                  <Skeleton width="85%" height={12} radius={4} />
                </div>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <Skeleton width={90} height={12} radius={4} style={{ marginBottom: 12 }} />
            <Skeleton width={140} height={22} radius={5} style={{ marginBottom: 18 }} />
            <div className="skeleton-stack">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="timeline-item"
                  key={index}
                  style={{ alignItems: "start" }}
                >
                  <Skeleton width={26} height={26} radius={999} />
                  <div className="skeleton-stack" style={{ flex: 1 }}>
                    <Skeleton width="70%" height={14} radius={4} />
                    <Skeleton width="90%" height={11} radius={4} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
