import { type RefObject, useRef, useState } from "react";
import {
  BookOpen,
  History,
  Languages,
  Mic,
  Plus,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { LEVELS, TOPICS, type Level } from "@/lib/topics";
import { saveProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { RichText } from "./rich-text";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";
import type { ChatMode } from "@/lib/ai";
import { PouyaFaceButton } from "./pouya-face-button";

type ChatMsg = { role: "user" | "assistant"; content: string; image?: string };
export type ChatAttachment = { name: string; mime: string; dataUrl: string };
export type HistoryItem = { id: string; title: string; when: string };

const chipClass =
  "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/20 px-3.5 py-2 text-sm text-cream backdrop-blur-sm transition hover:bg-white/30";

function extractPdfTextClient(bytes: Uint8Array): string {
  try {
    const raw = new TextDecoder("latin1").decode(bytes);
    const parts: string[] = [];
    const tj = /\(([^\\()\n]{1,400}(?:\\.[^\\()\n]*)*)\)\s*Tj/g;
    let m: RegExpExecArray | null;
    while ((m = tj.exec(raw))) {
      let s = m[1].replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\([()\\])/g, "$1");
      if (/[\u0600-\u06FFa-zA-Z0-9]/.test(s)) parts.push(s);
      if (parts.length > 4000) break;
    }
    return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 12000);
  } catch {
    return "";
  }
}

function Bubble({
  role,
  text,
  image,
}: {
  role: "user" | "assistant";
  text: string;
  image?: string;
}) {
  const mine = role === "user";
  return (
    <div className={cn("flex max-w-[88%] flex-col", mine ? "ms-auto" : "")}>
      <article
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-normal shadow-sm",
          mine
            ? "bg-stage text-cream"
            : "border border-white/40 bg-white/85 text-ink backdrop-blur-md",
        )}
      >
        {image ? (
          <img
            src={image}
            alt="پیوست"
            className="mb-2 max-h-48 w-auto max-w-full rounded-xl object-contain"
          />
        ) : null}
        {mine ? <p className="text-pretty">{text}</p> : <RichText text={text} />}
      </article>
    </div>
  );
}

export function ChatPane(props: {
  messages: ChatMsg[];
  typed: boolean | string;
  busy: boolean;
  draft: string;
  setDraft: (v: string) => void;
  level: Level;
  setLevel: (v: Level) => void;
  voiceOn: boolean;
  setVoiceOn: (v: boolean) => void;
  mode: ChatMode;
  listening: boolean;
  scrollerRef: RefObject<HTMLDivElement | null>;
  onSend: (t: string, attachment?: ChatAttachment) => void;
  onLesson: (t: string) => void;
  onDaily: () => void;
  onFact: () => void;
  onMic: () => void;
  onLivePractice: () => void;
  onNew: () => void;
  onSave: () => void;
  onTypingFocus?: (focused: boolean) => void;
  onVoiceCall?: () => void;
  historyItems?: HistoryItem[];
  historyOpen?: boolean;
  setHistoryOpen?: (v: boolean) => void;
  activeSessionId?: string;
  onOpenHistoryItem?: (id: string) => void;
  onDeleteHistoryItem?: (id: string) => void;
}) {
  const {
    messages,
    typed,
    busy,
    draft,
    setDraft,
    level,
    setLevel,
    voiceOn,
    setVoiceOn,
    listening,
    scrollerRef,
    onSend,
    onLesson,
    onDaily,
    onFact,
    onMic,
    onLivePractice,
    onNew,
    onSave,
    onTypingFocus,
    onVoiceCall,
    historyItems = [],
    historyOpen,
    setHistoryOpen,
    activeSessionId,
    onOpenHistoryItem,
    onDeleteHistoryItem,
  } = props;

  const empty = messages.length === 0 && !typed;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState<ChatAttachment | null>(null);
  const typedText = typeof typed === "string" ? typed : "";

  function pickFile(file: File | null | undefined) {
    if (!file) return;
    const okImage = file.type.startsWith("image/");
    const okText = file.type.startsWith("text/") || /\.txt$/i.test(file.name);
    const okPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!okImage && !okText && !okPdf) {
      window.alert("عکس جزوه، فایل متنی یا PDF را بفرست.");
      return;
    }
    const max = okPdf ? 8 * 1024 * 1024 : 4 * 1024 * 1024;
    if (file.size > max) {
      window.alert(okPdf ? "حجم PDF حداکثر ۸ مگابایت باشد." : "حجم فایل حداکثر ۴ مگابایت باشد.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl) return;
      const mime = okPdf ? "application/pdf" : file.type || "application/octet-stream";
      setPending({ name: file.name, mime, dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function submitChat() {
    let text =
      draft.trim() ||
      (pending
        ? `این ${
            pending.mime.startsWith("image/")
              ? "عکس/جزوه"
              : pending.mime === "application/pdf"
                ? "PDF"
                : "فایل"
          } را بررسی کن و توضیح بده.`
        : "");
    if (!text && !pending) return;
    let attachment = pending || undefined;
    if (attachment && (attachment.mime === "application/pdf" || /\.pdf$/i.test(attachment.name))) {
      try {
        const b64 = attachment.dataUrl.split(",")[1] || "";
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const extracted = extractPdfTextClient(bytes);
        if (extracted.trim()) {
          text = `${text}\n\n--- ${attachment.name} ---\n${extracted}`;
        } else {
          text = `${text}\n\n(متن این PDF قابل استخراج نبود؛ اگر می‌توانی متن را کپی کن یا عکس صفحه را بفرست.)`;
        }
      } catch {
        text = `${text}\n\n(خواندن PDF با خطا مواجه شد.)`;
      }
      attachment = undefined;
    }
    onSend(text, attachment);
    setPending(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1 px-3 py-2 sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={!messages.some((m) => m.role === "assistant")}
          className="gap-1 text-cream/90 hover:bg-white/15 hover:text-cream"
        >
          ذخیره
        </Button>
        {setHistoryOpen ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="gap-1 text-cream/90 hover:bg-white/15 hover:text-cream"
          >
            <History className="size-4" />
            تاریخچه
          </Button>
        ) : null}
        <div className="min-w-0 flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNew}
          className="text-cream/90 hover:bg-white/15 hover:text-cream"
        >
          گفتگوی تازه
        </Button>
      </div>

      {historyOpen ? (
        <div className="mx-3 mb-2 rounded-2xl border border-white/20 bg-white/90 p-2 text-sm shadow-sm sm:mx-5">
          {historyItems.length === 0 ? (
            <p className="px-2 py-3 text-fg-muted">هنوز گفتگویی ذخیره نشده.</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {historyItems.map((h) => (
                <li
                  key={h.id}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-1.5",
                    activeSessionId === h.id ? "bg-stage/10" : "hover:bg-black/5",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-start"
                    onClick={() => onOpenHistoryItem?.(h.id)}
                  >
                    <span className="block truncate font-medium text-ink">{h.title}</span>
                    <span className="block text-[11px] text-fg-muted">{h.when}</span>
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1 text-fg-muted hover:bg-black/5 hover:text-red-600"
                    aria-label="حذف"
                    onClick={() => onDeleteHistoryItem?.(h.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5">
        {empty ? (
          <div className="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-5 pt-4 text-center">
            <div className="px-1">
              <h1 className="font-display text-2xl font-medium tracking-tight text-cream drop-shadow-sm sm:text-3xl">
                چی دوست داری یاد بگیری؟
              </h1>
              <p className="mt-2 text-sm text-cream/75">بپرس، درس کوتاه بگیر، یا با صدا حرف بزن.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="سطح پاسخ پویا">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setLevel(l.id);
                    try {
                      saveProfile({ level: l.id });
                    } catch {
                      /* ignore */
                    }
                  }}
                  className={cn(chipClass, level === l.id && "bg-white/40 ring-1 ring-white/50 font-medium")}
                  aria-pressed={level === l.id}
                  title={l.hint}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onLesson(t.prompt)}
                  className={chipClass}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onLivePractice();
                }}
                className={chipClass}
                aria-label="تمرین زبان"
              >
                <Languages className="size-4 shrink-0" /> تمرین زبان
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onDaily();
                }}
                className={chipClass}
                aria-label="مرور روزانه"
              >
                <BookOpen className="size-4 shrink-0" /> مرور روزانه
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onFact();
                }}
                className={chipClass}
                aria-label="دانستنی امروز"
              >
                دانستنی امروز
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-3 pb-2">
            {messages.map((m, i) => (
              <Bubble key={`${m.role}-${i}`} role={m.role} text={m.content} image={m.image} />
            ))}
            {typedText ? <Bubble role="assistant" text={typedText} /> : null}
            {busy && !typedText ? (
              <div className="text-sm text-cream/80">پویا دارد فکر می‌کند…</div>
            ) : null}
          </div>
        )}
      </div>

      <form
        className="pouya-glass-composer mx-3 mb-3 sm:mx-5 sm:mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submitChat();
        }}
      >
        {pending ? (
          <div className="mb-2 flex items-center gap-2 rounded-2xl bg-cream/80 px-2 py-1.5">
            <BookOpen className="size-4 shrink-0 text-stage" />
            <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">{pending.name}</span>
            <button
              type="button"
              className="rounded-full p-1 text-fg-muted hover:bg-black/5"
              onClick={() => setPending(null)}
              aria-label="حذف پیوست"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <Textarea
          value={draft}
          rows={2}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => onTypingFocus?.(true)}
          onBlur={() => onTypingFocus?.(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submitChat();
            }
          }}
          placeholder={listening ? "دارم گوش می‌دهم…" : "بپرس یا عکس جزوه را پیوست کن…"}
          className="max-h-36 min-h-14 w-full resize-none border-0 bg-transparent px-1 py-1 text-base text-ink shadow-none placeholder:text-fg-subtle focus-visible:ring-0"
          disabled={busy}
        />
        <div className="mt-1 flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,text/plain,.txt,application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            aria-label="پیوست"
            className="rounded-full border-border/60 bg-white/70"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={voiceOn ? "default" : "outline"}
            disabled={busy}
            onClick={() => {
              const next = !voiceOn;
              setVoiceOn(next);
              try {
                saveProfile({ voiceOn: next });
              } catch {
                /* ignore */
              }
            }}
            aria-label={voiceOn ? "خاموش کردن سخن‌گو" : "روشن کردن سخن‌گو"}
            className={cn(
              "rounded-full",
              voiceOn ? "bg-stage text-cream hover:bg-stage-deep" : "border-border/60 bg-white/70",
            )}
          >
            {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant={listening ? "default" : "outline"}
            disabled={busy}
            onClick={onMic}
            aria-label="میکروفون"
            className={cn(
              "rounded-full",
              listening ? "bg-red-600 text-white hover:bg-red-700" : "border-border/60 bg-white/70",
            )}
          >
            <Mic className="size-4" />
          </Button>
          <PouyaFaceButton onClick={onVoiceCall} label="گفتگوی صوتی با پویا" disabled={busy} />
          <div className="flex-1" />
          <Button
            type="submit"
            size="icon"
            disabled={busy || (!draft.trim() && !pending)}
            aria-label="ارسال"
            className="rounded-full bg-stage text-cream hover:bg-stage-deep"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
