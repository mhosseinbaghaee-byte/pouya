import { Fragment, useEffect, useState, type ReactNode } from "react";
import { LessonDiagramSvg } from "./lesson-diagram-svg";
import { diagramById } from "../lib/lesson-diagrams";
import { FunctionGraph } from "./function-graph";

const WM_UPLOAD = "https://upload.wikimedia.org/";
const WM_SPECIAL = "https://commons.wikimedia.org/wiki/Special:FilePath/";

function isAllowedImageUrl(url: string): boolean {
  const u = url.trim();
  // بانک اطلس محلی پویا + شکل‌های public
  if (u.startsWith("/atlas/") || u.startsWith("/pouya/") || u.startsWith("/images/")) return true;
  // ویکی‌مدیا
  if (u.startsWith(WM_UPLOAD) || u.startsWith(WM_SPECIAL)) return true;
  return false;
}

function ZoomableImage({
  src,
  alt,
  className,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!isAllowedImageUrl(src)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in border-0 bg-transparent p-0 text-start"
        aria-label={`بزرگ‌نمایی: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={onError}
        />
        <span className="mt-0.5 block text-center text-[10px] text-fg-subtle">برای بزرگ‌نمایی لمس کن</span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-3"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <p className="truncate text-sm font-medium text-ink">{alt}</p>
              <button
                type="button"
                className="rounded-full bg-stage px-3 py-1 text-sm text-cream"
                onClick={() => setOpen(false)}
              >
                بستن
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-black/5 p-2">
              <img
                src={src}
                alt={alt}
                className="max-h-[85dvh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function inlineFormat(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
      return (
        <em key={i} className="italic text-fg-muted">
          {p.slice(1, -1)}
        </em>
      );
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-black/5 px-1 text-[0.9em]">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function ShapeSvg({ kind }: { kind: string }) {
  return <LessonDiagramSvg kind={kind} />;
}

function DiagramBlock({ id }: { id: string }) {
  const meta = diagramById(id);
  const gallery = meta?.imageGallery?.filter((g) => g.url && isAllowedImageUrl(g.url)) || [];
  const single = meta?.imageUrl && isAllowedImageUrl(meta.imageUrl) ? meta.imageUrl : undefined;

  if (!meta) {
    return (
      <div className="my-2 rounded-xl border border-border/40 bg-white/60 p-3 text-sm text-fg-muted">
        شکل «{id}» در بانک پیدا نشد.
      </div>
    );
  }

  return (
    <div className="my-2 space-y-2 rounded-xl border border-border/40 bg-white/70 p-3">
      <p className="text-sm font-medium text-ink">{meta.title}</p>
      {gallery.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {gallery.map((g, i) => (
            <div key={i} className="min-w-[8rem] flex-1">
              <ZoomableImage
                src={g.url}
                alt={g.label || meta.title}
                className="max-h-40 w-full rounded-lg object-contain"
              />
              {g.label ? <p className="mt-0.5 text-center text-[11px] text-fg-subtle">{g.label}</p> : null}
            </div>
          ))}
        </div>
      ) : single ? (
        <ZoomableImage
          src={single}
          alt={meta.title}
          className="max-h-52 w-auto max-w-full rounded-lg object-contain"
        />
      ) : (
        <LessonDiagramSvg kind={id} />
      )}
      {meta.caption ? <p className="text-xs leading-relaxed text-fg-muted">{meta.caption}</p> : null}
      {meta.attribution ? (
        <p className="text-[10px] text-fg-subtle">{meta.attribution}</p>
      ) : null}
    </div>
  );
}

export function RichText({ text }: { text: string }) {
  if (!text?.trim()) return null;

  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-2 text-pretty">
      {blocks.map((block, bi) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (/\[diagram:[^\]]+\]|\[graph:[^\]]+\]|\[shape:[^\]]+\]|```shape:[^`]+```/.test(block)) {
          const pieces = block.split(/(\[diagram:[^\]]+\]|\[graph:[^\]]+\]|\[shape:[^\]]+\]|```shape:[^`]+```)/g);
          return (
            <div key={bi} className="space-y-1">
              {pieces.map((p, pi) => {
                const dm = p.match(/^\[diagram:([^\]]*)\]$/i);
                if (dm) {
                  const id = dm[1].trim();
                  return id ? <DiagramBlock key={pi} id={id} /> : null;
                }
                const gm = p.match(/^\[graph:([^\]]+)\]$/i);
                if (gm) return <FunctionGraph key={pi} expr={gm[1]} />;
                const m = p.match(/^\[shape:([^\]]+)\]$/i) || p.match(/^```shape:([^`]+)```$/i);
                if (m) return <ShapeSvg key={pi} kind={m[1]} />;
                if (!p.trim()) return null;
                return (
                  <p key={pi} className="leading-normal">
                    {inlineFormat(p)}
                  </p>
                );
              })}
            </div>
          );
        }

        if (/!\[[^\]]*\]\([^)]+\)/.test(block)) {
          const pieces = block.split(/(!\[[^\]]*\]\([^)]+\))/g);
          return (
            <div key={bi} className="space-y-2">
              {pieces.map((p, pi) => {
                const im = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
                if (im) {
                  if (!isAllowedImageUrl(im[2])) return null;
                  return (
                    <ZoomableImage
                      key={pi}
                      src={im[2]}
                      alt={im[1] || "تصویر آموزشی"}
                      className="my-1 max-h-56 w-auto max-w-full rounded-xl border border-border/40 object-contain"
                    />
                  );
                }
                if (!p.trim()) return null;
                return (
                  <p key={pi} className="leading-normal">
                    {inlineFormat(p)}
                  </p>
                );
              })}
            </div>
          );
        }

        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l) || !l.trim())) {
          return (
            <ul key={bi} className="list-disc space-y-1 ps-5">
              {lines
                .filter((l) => l.trim())
                .map((l, li) => (
                  <li key={li}>{inlineFormat(l.replace(/^\s*[-*•]\s+/, ""))}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="leading-normal whitespace-pre-wrap">
            {inlineFormat(block)}
          </p>
        );
      })}
    </div>
  );
}
