"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  FileText,
  FolderPlus,
  Layers3,
  Link2,
  Loader2,
  Plus,
  Sparkles
} from "lucide-react";
import { nanoid } from "nanoid";
import {
  getStatusLabel,
  LinkPack,
  phaseOneJobSteps,
  samplePacks,
  SourceLink
} from "@/lib/domain/packs";

type PackDashboardProps = {
  userName: string;
};

function nowIso() {
  return new Date().toISOString();
}

function parseLinks(rawLinks: string): SourceLink[] {
  return rawLinks
    .split(/\n|,/)
    .map((link) => link.trim())
    .filter(Boolean)
    .map((url) => ({
      id: nanoid(),
      url,
      status: "pending",
      addedAt: nowIso()
    }));
}

export function PackDashboard({ userName }: PackDashboardProps) {
  const [packs, setPacks] = useState<LinkPack[]>(samplePacks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState("");

  const stats = useMemo(() => {
    const ready = packs.filter((pack) => pack.status === "ready").length;
    const running = packs.filter((pack) =>
      ["queued", "extracting", "generating"].includes(pack.status)
    ).length;
    const sourceCount = packs.reduce((count, pack) => count + pack.sourceLinks.length, 0);

    return { ready, running, sourceCount };
  }, [packs]);

  function createPack(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedLinks = parseLinks(links);
    const createdAt = nowIso();
    const nextPack: LinkPack = {
      id: `pack-${nanoid(8)}`,
      userId: "dev-user",
      title: title.trim(),
      description: description.trim() || undefined,
      status: parsedLinks.length > 0 ? "queued" : "draft",
      progress: parsedLinks.length > 0 ? 8 : 0,
      sourceLinks: parsedLinks,
      jobSteps: phaseOneJobSteps.map((step, index) => ({
        ...step,
        status: parsedLinks.length > 0 && index === 0 ? "running" : "pending"
      })),
      createdAt,
      updatedAt: createdAt
    };

    setPacks((current) => [nextPack, ...current]);
    setTitle("");
    setDescription("");
    setLinks("");
  }

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Curate sources. Shape the notes. Export the study pack.</h1>
          <p className="lede">
            Welcome, {userName}. Pith starts as a focused desk for collecting blog links
            into structured packs, tracking generation, and preparing the editable document
            that becomes the final PDF.
          </p>
        </div>
      </section>

      <section className="workspace-command" aria-label="Workspace stats">
        <div className="command-cell">
          <Layers3 size={22} />
          <strong>{packs.length}</strong>
          <span>active link packs</span>
        </div>
        <div className="command-cell">
          <Link2 size={22} />
          <strong>{stats.sourceCount}</strong>
          <span>sources staged for extraction</span>
        </div>
        <div className="command-cell">
          <Loader2 size={22} />
          <strong>{stats.running}</strong>
          <span>generation jobs in motion</span>
        </div>
      </section>

      <section className="intake-board">
        <div className="intake-copy">
          <p className="eyebrow">New pack</p>
          <h2>Start with the reading list, then let the document take shape.</h2>
          <p className="helper">
            Capture the learning goal and paste the source links. This becomes the handoff
            point for extraction, synthesis, editing, and export in the next phases.
          </p>
        </div>

        <form className="intake-form" onSubmit={createPack}>
          <div className="field">
            <label htmlFor="title">Pack title</label>
            <input
              id="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="React Server Components deep dive"
            />
          </div>
          <div className="field">
            <label htmlFor="description">Learning goal</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What should these notes help the reader understand?"
            />
          </div>
          <div className="field link-field">
            <label htmlFor="links">Blog links</label>
            <textarea
              id="links"
              value={links}
              onChange={(event) => setLinks(event.target.value)}
              placeholder={"https://example.com/post-one\nhttps://example.com/post-two"}
            />
            <span className="helper">One URL per line, or separate URLs with commas.</span>
          </div>
          <div className="intake-actions">
            <button className="button" type="submit">
              <Plus size={17} />
              Create pack
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="section-title">
          <div>
            <p className="eyebrow">Library</p>
            <h2>Your link packs</h2>
          </div>
          <span className="badge ready">{stats.ready} ready</span>
        </div>

        {packs.length === 0 ? (
          <div className="empty-state">
            <div>
              <FolderPlus size={34} />
              <h2>Create your first link pack</h2>
              <p className="helper">
                Add several blog links to start shaping a comprehensive notes PDF.
              </p>
            </div>
          </div>
        ) : (
          <div className="pack-ledger">
            <div>
              {packs.map((pack) => (
                <Link href={`/packs/${pack.id}`} className="pack-row" key={pack.id}>
                  <div className="pack-main">
                    <h3 className="pack-title">{pack.title}</h3>
                    <p className="pack-description">
                      {pack.description || "No description yet."}
                    </p>
                  </div>
                  <div className="pack-metric">
                    <span>
                      {pack.sourceLinks.length} source
                      {pack.sourceLinks.length === 1 ? "" : "s"}
                    </span>
                    <div className="progress" aria-label={`${pack.progress}% complete`}>
                      <span style={{ width: `${pack.progress}%` }} />
                    </div>
                  </div>
                  <span className={`badge ${pack.status}`}>
                    {getStatusLabel(pack.status)}
                  </span>
                  <div className="row-action" aria-hidden="true">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="phase-strip">
        <div className="phase-item">
          <FileText size={22} />
          <h3 style={{ marginTop: 12 }}>Editable document model</h3>
            <p className="helper">
              Generated notes will be stored as typed blocks so users can edit and reorder them.
            </p>
        </div>
        <div className="phase-item">
          <Sparkles size={22} />
          <h3 style={{ marginTop: 12 }}>Source-first workflow</h3>
            <p className="helper">
              Every pack keeps source URLs visible from the first step for later citations.
            </p>
        </div>
        <div className="phase-item">
          <Loader2 size={22} />
          <h3 style={{ marginTop: 12 }}>Job status ready</h3>
            <p className="helper">
              The UI already models queued, extraction, generation, ready, and failed states.
            </p>
        </div>
      </section>
    </main>
  );
}
