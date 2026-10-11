import { useRef, useState, type RefObject } from "react";
import { BookOpen, History, Mic, Plus, Save, SendHorizontal, Sparkles, Square, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { saveProfile } from "@/lib/profile";
import type { Level } from "@/lib/topics";
import type { ChatMode } from "@/lib/ai";

export type ChatAttachment = { name: string; mime: string; dataUrl: string };

export type HistoryItem = { id: string; title: string; when: string };

type Msg = { role: "user" | "assistant"; content: string; image?: string };

function ActionBar(props: {
  onNew: () => void;
  onSave: () => void;
  canSave: boolean;
  historyOpen?: boolean;
  setHistoryOpen?: (v: boolean) => void;
  historyItems?: HistoryItem[];
  activeSessionId?: string;
  onOpenHistoryItem?: (id: string) => void;
  onDeleteHistoryItem?: (id: string) => void;
}) {
  const {
    onNew,
    onSave,
    canSave,
    historyOpen,
    setHistoryOpen,
    historyItems = [],
    activeSessionId,
    onOpenHistoryItem,
    onDeleteHistoryItem,
  } = props;
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onNew} className="rounded-full border-border/60 bg-white/70">
        گفتگوی تازه
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={!canSave} onClick={onSave} className="rounded-full border-border/60 bg-white/70">
        <Save className="me-1 size-3.5" />
        ذخیره
      </Button>
      {setHistoryOpen ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setHistoryOpen(!historyOpen)}
          className="rounded-full border-border/60 bg-white/70"
        >
          <History className="me-1 size-3.5" />
          تاریخچه
        </Button>
      ) : null}
      {historyOpen ? (
        <div className="w-full rounded-2xl border border-border/50 bg-white/80 p-2 text-sm shadow-sm">
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
                  <button type="button" className="min-w-0 flex-1 text-start" onClick={() => onOpenHistoryItem?.(h.id)}>
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
    </div>
  );
}

export function ChatPane(props: {
  messages: Msg[];
  typed: boolean;
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
    mode,
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
    historyItems,
    historyOpen,
    setHistoryOpen,
    activeSessionId,
    onOpenHistoryItem,
    onDeleteHistoryItem,
  } = props;
  const empty = messages.length === 0 && !typed;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState<ChatAttachment | null>(null);

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

  function submitChat() {
    const text =
      draft.trim() ||
      (pending
        ? `این ${pending.mime.startsWith("image/") ? "عکس/جزوه" : pending.mime === "application/pdf" ? "PDF" : "فایل"} را بررسی کن و توضیح بده.`
        : "");
    if (!text && !pending) return;
    onSend(text, pending || undefined);
    setPending(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ActionBar
        onNew={onNew}
        onSave={onSave}
        canSave={messages.some((m) => m.role === "assistant")}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
        historyItems={historyItems}
        activeSessionId={activeSessionId}
        onOpenHistoryItem={onOpenHistoryItem}
        onDeleteHistoryItem={onDeleteHistoryItem}
      />
      <div ref={scrollerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {empty ? (
          <div className="rounded-3xl border border-border/40 bg-white/70 p-4 text-sm leading-7 text-ink shadow-sm">
            <p className="font-semibold">سلام، من پویام.</p>
            <p className="mt-1 text-fg-muted">بپرس، درس کوتاه بگیر، PDF یا عکس جزوه بفرست، یا دانستنی امروز را ببین.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["ریاضی", "فیزیک", "شیمی", "زیست", "فارسی", "انگلیسی"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-full border border-border/50 bg-cream/80 px-3 py-1 text-xs font-medium text-ink hover:bg-stage/10"
                  onClick={() => onLesson(t)}
                >
                  {t}
                </button>
              ))}
              <button type="button" className="rounded-full border border-border/50 bg-cream/80 px-3 py-1 text-xs font-medium" onClick={onDaily}>
                مرور روزانه
              </button>
              <button type="button" className="rounded-full border border-border/50 bg-cream/80 px-3 py-1 text-xs font-medium" onClick={onFact}>
                دانستنی امروز
              </button>
              <button type="button" className="rounded-full border border-border/50 bg-cream/80 px-3 py-1 text-xs font-medium" onClick={onLivePractice}>
                تمرین زبان
              </button>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={cn(
                "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-7 shadow-sm",
                m.role === "user" ? "ms-auto bg-stage text-cream" : "me-auto bg-white/85 text-ink",
              )}
            >
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="" className="mb-2 max-h-48 rounded-xl object-contain" />
              ) : null}
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))
        )}
        {busy ? (
          <div className="me-auto inline-flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 text-xs text-fg-muted shadow-sm">
            <Sparkles className="size-3.5 animate-pulse" />
            پویا داره فکر می‌کنه…
          </div>
        ) : null}
      </div>

      <div className="mt-2 rounded-3xl border border-border/50 bg-white/80 p-2 shadow-sm">
        {pending ? (
          <div className="mb-2 flex items-center gap-2 rounded-2xl bg-cream/80 px-2 py-1.5">
            <BookOpen className="size-4 shrink-0 text-stage" />
            <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">{pending.name}</span>
            <button type="button" className="rounded-full p-1 text-fg-muted hover:bg-black/5" onClick={() => setPending(null)} aria-label="حذف پیوست">
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
              submitChat();
            }
          }}
          placeholder={listening ? "دارم گوش می‌دهم…" : "بپرس؛ عکس یا PDF جزوه را پیوست کن…"}
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
            aria-label="پیوست فایل یا عکس"
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
            aria-pressed={voiceOn}
            className={cn("rounded-full", voiceOn ? "bg-stage text-cream hover:bg-stage-deep" : "border-border/60 bg-white/70")}
            title="سخن‌گوی پویا"
          >
            <Sparkles className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={listening ? "default" : "outline"}
            disabled={busy}
            onClick={onMic}
            aria-label={listening ? "توقف ضبط" : "صحبت با میکروفون"}
            className={cn("rounded-full", listening ? "bg-red-600 text-white hover:bg-red-700" : "border-border/60 bg-white/70")}
          >
            {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
          </Button>
          {onVoiceCall ? (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onVoiceCall} className="rounded-full border-border/60 bg-white/70">
              تماس صوتی
            </Button>
          ) : null}
          <div className="flex-1" />
          <Button type="button" size="icon" disabled={busy || (!draft.trim() && !pending)} onClick={submitChat} className="rounded-full bg-stage text-cream hover:bg-stage-deep">
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
