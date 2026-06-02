"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  FolderPlus,
  Layers3,
  Link2,
  Loader2,
  Plus,
  SquarePen,
  X
} from "lucide-react";
import { createPackAction } from "@/app/(app)/dashboard/actions";
import { getStatusLabel, LinkPack } from "@/lib/domain/packs";

type PackDashboardProps = {
  userName: string;
  initialPacks: LinkPack[];
};

function parseLinks(rawLinks: string): string[] {
  return rawLinks
    .split(/\n|,/)
    .map((link) => link.trim())
    .filter(Boolean);
}

export function PackDashboard({ userName, initialPacks }: PackDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkInputs, setLinkInputs] = useState([""]);
  const [formError, setFormError] = useState<string | null>(null);
  const parsedLinks = useMemo(() => parseLinks(linkInputs.join("\n")), [linkInputs]);

  const stats = useMemo(() => {
    const ready = initialPacks.filter((pack) => pack.status === "ready").length;
    const running = initialPacks.filter((pack) =>
      ["queued", "extracting", "generating"].includes(pack.status)
    ).length;
    const sourceCount = initialPacks.reduce(
      (count, pack) => count + pack.sourceLinks.length,
      0
    );

    return { ready, running, sourceCount };
  }, [initialPacks]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setLinkInputs([""]);
    setFormError(null);
  }

  function closeModal() {
    setIsCreateOpen(false);
    setFormError(null);
  }

  function createPack(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setFormError("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await createPackAction({
        title: trimmedTitle,
        description: description.trim() || undefined,
        urls: parsedLinks
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      resetForm();
      setIsCreateOpen(false);
      router.refresh();
    });
  }

  function updateLinkInput(index: number, value: string) {
    setLinkInputs((current) =>
      current.map((link, linkIndex) => (linkIndex === index ? value : link))
    );
  }

  function addLinkInput() {
    setLinkInputs((current) => [...current, ""]);
  }

  function removeLinkInput(index: number) {
    setLinkInputs((current) => current.filter((_, linkIndex) => linkIndex !== index));
  }

  return (
    <>
    <main className="page page-fade-in">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Study pack workspace</h1>
          <p className="lede">Welcome back, {userName}. Track sources, drafts, and exports.</p>
        </div>
        <button
          className="button"
          type="button"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={17} />
          New pack
        </button>
      </section>

      <section className="workspace-command" aria-label="Workspace stats">
        <div className="command-cell">
          <span className="command-icon">
            <Layers3 size={19} />
          </span>
          <div>
            <strong>{initialPacks.length}</strong>
            <span>Active packs</span>
          </div>
        </div>
        <div className="command-cell">
          <span className="command-icon">
            <Link2 size={19} />
          </span>
          <div>
            <strong>{stats.sourceCount}</strong>
            <span>Sources staged</span>
          </div>
        </div>
        <div className="command-cell">
          <span className="command-icon">
            <Loader2 size={19} />
          </span>
          <div>
            <strong>{stats.running}</strong>
            <span>Jobs running</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="library-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">Library</p>
              <h2>Your link packs</h2>
            </div>
            <span className="badge ready">{stats.ready} ready</span>
          </div>

          {initialPacks.length === 0 ? (
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
            <div className="pack-ledger" role="table" aria-label="Link packs">
              <div className="pack-ledger-head" role="row">
                <span>Pack</span>
                <span>Sources</span>
                <span>Status</span>
                <span aria-hidden="true" />
              </div>
              <div>
                {initialPacks.map((pack) => (
                  <Link href={`/packs/${pack.id}`} className="pack-row" key={pack.id} role="row">
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
      </div>
    </main>

    {isCreateOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className="create-pack-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-pack-title"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
            >
              <X size={17} />
            </button>
          <form className="intake-form" onSubmit={createPack}>
            <div className="intake-form-header">
              <span className="command-icon">
                <SquarePen size={19} />
              </span>
              <div>
                <p className="eyebrow">New pack</p>
                <h2 id="new-pack-title">Create from sources</h2>
                <p className="helper">Name the intent, add links, then decide draft or queue.</p>
              </div>
            </div>

            <div className="field title-field">
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
              <div className="field-label-row">
                <label htmlFor="link-0">Blog links</label>
                <span>{parsedLinks.length} detected</span>
              </div>
              <div className="link-input-list">
                {linkInputs.map((link, index) => (
                  <div className="link-input-row" key={index}>
                    <input
                      id={index === 0 ? "link-0" : undefined}
                      value={link}
                      onChange={(event) => updateLinkInput(index, event.target.value)}
                      placeholder="https://example.com/post"
                      type="url"
                    />
                    {linkInputs.length > 1 ? (
                      <button
                        className="icon-button"
                        type="button"
                        aria-label="Remove link"
                        onClick={() => removeLinkInput(index)}
                      >
                        <X size={16} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <button className="add-link-button" type="button" onClick={addLinkInput}>
                <Plus size={16} />
                Add another link
              </button>
            </div>
            {formError ? (
              <p className="form-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="intake-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setLinkInputs([""])}
                disabled={isPending}
              >
                Clear
              </button>
              <button className="button" type="submit" disabled={isPending}>
                {isPending ? <Loader2 size={17} /> : <Plus size={17} />}
                {isPending
                  ? "Creating…"
                  : parsedLinks.length > 0
                    ? "Create and queue"
                    : "Create draft"}
              </button>
            </div>
          </form>
          </section>
        </div>
    ) : null}
    </>
  );
}
