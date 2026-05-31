import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Circle,
  Download,
  ExternalLink,
  FilePenLine,
  Loader2
} from "lucide-react";
import { getStatusLabel, samplePacks } from "@/lib/domain/packs";

type PackPageProps = {
  params: Promise<{
    packId: string;
  }>;
};

function StepIcon({ status }: { status: string }) {
  if (status === "done") {
    return <Check size={15} />;
  }

  if (status === "running") {
    return <Loader2 size={15} />;
  }

  return <Circle size={14} />;
}

export default async function PackPage({ params }: PackPageProps) {
  const { packId } = await params;
  const pack = samplePacks.find((item) => item.id === packId);

  if (!pack) {
    notFound();
  }

  return (
    <main className="page">
      <div style={{ marginBottom: 20 }}>
        <Link className="button ghost" href="/dashboard">
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </div>

      <section className="page-header">
        <div>
          <p className="eyebrow">Link pack</p>
          <h1>{pack.title}</h1>
          <p className="lede">{pack.description}</p>
        </div>
        <div className="detail-toolbar">
          <span className={`badge ${pack.status}`}>{getStatusLabel(pack.status)}</span>
          <button className="button secondary" type="button">
            <FilePenLine size={17} />
            Edit notes
          </button>
          <button className="button" type="button" disabled={pack.status !== "ready"}>
            <Download size={17} />
            Export PDF
          </button>
        </div>
      </section>

      <section className="detail-layout">
        <div className="editor-frame">
          <div className="editor-topline">
            <div>
              <p className="eyebrow">Editor preview</p>
              <h2 style={{ marginBottom: 0 }}>Structured notes canvas</h2>
            </div>
            <span className="meta">{pack.progress}% complete</span>
          </div>
          <div className="editor-canvas">
            <div className="progress" aria-label={`${pack.progress}% complete`}>
              <span style={{ width: `${pack.progress}%` }} />
            </div>
            <article className="document-sheet" style={{ marginTop: 28 }}>
              <div className="document-block">
                <p className="eyebrow">Generated notes draft</p>
                <h2>Understanding the topic from multiple sources</h2>
                <p>
                  Phase 1 reserves the editor canvas and document structure. In Phase 3,
                  this area will be populated with AI-generated blocks containing concepts,
                  diagrams, examples, image references, and citations.
                </p>
              </div>
              <div className="document-block callout">
                <h3>Planned block controls</h3>
                <p>
                  Users will edit, reorder, regenerate, and remove sections before exporting
                  the final report as a designed PDF.
                </p>
              </div>
              <div className="document-block">
                <h3>Diagram slot</h3>
                <div className="diagram-slab">Mind map and flow diagram preview</div>
              </div>
            </article>
          </div>
        </div>

        <aside className="side-rail">
          <div className="rail-section">
            <p className="eyebrow">Sources</p>
            <h2>{pack.sourceLinks.length} blog links</h2>
            <div className="source-list">
              {pack.sourceLinks.map((source) => (
                <div className="source-item" key={source.id}>
                  <div className="pack-row-top">
                    <h3 className="pack-title">{source.title || source.url}</h3>
                    <span className={`badge ${source.status}`}>{source.status}</span>
                  </div>
                  <a className="source-url" href={source.url} target="_blank" rel="noreferrer">
                    {source.url}
                    <ExternalLink size={13} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <p className="eyebrow">Generation</p>
            <h2>Status trail</h2>
            <div className="timeline">
              {pack.jobSteps.map((step) => (
                <div className="timeline-item" key={step.id}>
                  <span className="timeline-icon">
                    <StepIcon status={step.status} />
                  </span>
                  <div>
                    <h3 className="pack-title">{step.label}</h3>
                    <p className="meta">{step.detail}</p>
                    <span className={`badge ${step.status}`}>{step.status}</span>
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
