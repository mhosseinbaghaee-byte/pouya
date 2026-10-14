import React, { type RefObject } from "react";
import { Mic, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LANGUAGES, SCENARIOS, type Level, type LangCode } from "@/lib/topics";
import { PouyaFaceButton } from "./pouya-face-button";

type Msg = { role: "user" | "assistant"; content: string; image?: string };

const chipClass =
  "rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs text-cream backdrop-blur hover:bg-white/25";

function Bubble(props: { role: "user" | "assistant"; text: string; live?: boolean }) {
  const mine = props.role === "user";
  return (
    <div
      className={cn(
        "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-7 shadow-sm",
        mine ? "ms-auto bg-white text-ink" : "me-auto bg-white/20 text-cream",
        props.live && "opacity-80",
      )}
    >
      <div className="whitespace-pre-wrap">{props.text}</div>
    </div>
  );
}

export function LivePane({
  messages,
  typed,
  busy,
  draft,
  setDraft,
  level,
  setLevel,
  voiceOn,
  setVoiceOn,
  lang,
  setLang,
  listening,
  scrollerRef,
  onSend,
  onScenario,
  onMic,
  onNew,
  onSave,
  onTypingFocus,
  onVoiceCall,
}: {
  messages: Msg[];
  typed: string;
  busy: boolean;
  draft: string;
  setDraft: (v: string) => void;
  level: Level;
  setLevel: (v: Level) => void;
  voiceOn: boolean;
  setVoiceOn: (v: boolean) => void;
  lang: LangCode;
  setLang: (v: LangCode) => void;
  listening: boolean;
  scrollerRef: RefObject<HTMLDivElement | null>;
  onSend: (t: string) => void;
  onScenario: (prompt: string) => void;
  onMic: () => void;
  onNew: () => void;
  onSave: () => void;
  onTypingFocus?: (focused: boolean) => void;
  onVoiceCall?: () => void;
}) {
  const empty = messages.length === 0 && !typed;
  const currentLang = LANGUAGES.find((l) => l.code === lang);
  void level;
  void setLevel;
  void voiceOn;
  void setVoiceOn;
  void onSave;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex flex-wrap items-center gap-2 px-3 pt-2 sm:px-5">
        <Button type="button" size="sm" variant="outline" onClick={onNew} className="rounded-full border-white/30 bg-white/15 text-cream">
          گفتگوی تازه
        </Button>
      </div>
      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5">
        {empty ? (
          <div className="mx-auto flex max-w-xl flex-col gap-5 pt-4">
            <div className="text-center">
              <h1 className="font-display text-2xl font-medium text-cream sm:text-3xl">گفتگوی زنده · زبان</h1>
              <p className="mt-2 text-sm text-cream/75">زبان را انتخاب کن و حرف بزن.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "h-11 min-h-11 rounded-full border px-3.5 text-sm backdrop-blur-md touch-manipulation",
                    lang === l.code ? "border-white bg-white text-ink" : "border-white/30 bg-white/15 text-cream",
                  )}
                >
                  <span className="me-1.5">{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SCENARIOS.map((s) => (
                <button key={s.id} type="button" onClick={() => onScenario(s.prompt)} className={chipClass}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <p className="text-center text-xs text-cream/70">
              گفتگوی زنده · {currentLang?.flag} {currentLang?.label}
            </p>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} />
            ))}
            {typed ? <Bubble role="assistant" text={typed} live /> : null}
            {busy && !typed ? <div className="text-sm text-cream/80">پویا دارد فکر می‌کند…</div> : null}
          </div>
        )}
      </div>
      <form
        className="pouya-glass-composer mx-3 mb-3 sm:mx-5 sm:mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSend(draft);
        }}
      >
        <Textarea
          value={draft}
          rows={2}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
          onFocus={() => onTypingFocus?.(true)}
          onBlur={() => onTypingFocus?.(false)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(draft);
            }
          }}
          placeholder={listening ? "دارم گوش می‌دهم…" : `به ${currentLang?.native ?? "English"} یا فارسی بنویس…`}
          className="max-h-36 min-h-14 w-full resize-none border-0 bg-transparent px-1 py-1 text-base text-ink shadow-none placeholder:text-fg-subtle focus-visible:ring-0"
          disabled={busy}
        />
        <div className="mt-1 flex items-center gap-2">
          <PouyaFaceButton onClick={onVoiceCall} label="گفتگوی صوتی با پویا" disabled={busy} />
          <Button
            type="button"
            size="icon"
            variant={listening ? "default" : "outline"}
            onClick={onMic}
            disabled={busy}
            aria-label="میکروفون"
            className={cn("rounded-full", listening ? "bg-stage text-cream hover:bg-stage-deep" : "border-border/60 bg-white/70")}
          >
            <Mic className="size-4" />
          </Button>
          <div className="flex-1" />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !draft.trim()}
            aria-label="ارسال"
            className="rounded-full bg-stage text-cream hover:bg-stage-deep"
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
