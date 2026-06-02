import Link from "next/link";
import { BookOpenText, FilePenLine, Layers3, Sparkles } from "lucide-react";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-shell">
      <aside className="auth-pitch" aria-hidden="true">
        <Link href="/" className="brand auth-brand">
          <span className="brand-mark">
            <BookOpenText size={19} />
          </span>
          <span className="brand-text">Pith</span>
        </Link>
        <div className="auth-pitch-body">
          <p className="eyebrow">Study packs</p>
          <h1>Turn blog links into rendered study notes.</h1>
          <p className="lede">
            Pith collects long-form posts, drafts structured editable notes, and
            exports a designed PDF you can keep.
          </p>
          <ul className="auth-feature-list">
            <li>
              <span className="auth-feature-icon">
                <Layers3 size={16} />
              </span>
              <div>
                <strong>Link packs</strong>
                <span>Group several sources around one learning goal.</span>
              </div>
            </li>
            <li>
              <span className="auth-feature-icon">
                <Sparkles size={16} />
              </span>
              <div>
                <strong>Generated drafts</strong>
                <span>AI-assisted notes with citations and diagrams.</span>
              </div>
            </li>
            <li>
              <span className="auth-feature-icon">
                <FilePenLine size={16} />
              </span>
              <div>
                <strong>Editable canvas</strong>
                <span>Refine blocks before exporting a polished PDF.</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>
      <main className="auth-stage">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
