import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Brain,
  GraduationCap,
  Languages,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { askPouya, speakPouya, type ChatMode } from "@/lib/ai";
import { learningBriefForPrompt, noteInteraction } from "@/lib/learning-memory";
import { diagramTag, matchDiagram } from "@/lib/lesson-diagrams";
import { localTutorReply } from "@/lib/library";
import {
  LEVELS,
  langById,
  localeForLangCode,
  type LangCode,
  type Level,
} from "@/lib/topics";
import { saveNote, titleFromBody, type FolderId } from "@/lib/vault";
import {
  deleteChatSession,
  formatSessionDate,
  getChatSession,
  listChatSessions,
  upsertChatSession,
  type ChatSession,
} from "@/lib/chat-history";
import { cn } from "@/lib/utils";
import { PouyaStage, type StageMood } from "./pouya-stage";
import { CoachesPane } from "./coaches-pane";
import { AccountPane } from "./account-pane";
import { loadProfile } from "@/lib/profile";
import { canUseChat, incrementChatUsage, loadSubscription } from "@/lib/subscription";
import type { Assistant } from "@/lib/assistants";
import { ChatPane, LivePane, QuizPane, VaultPane } from "./pouya-panes";
import { PouyaVoiceCall, type VoicePhase } from "./pouya-voice-call";

type Tab = "chat" | "live" | "quiz" | "vault" | "coaches" | "account";
type ChatMsg = { role: "user" | "assistant"; content: string; image?: string };

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => BrowserSpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

const INTRO_KEY = "pouya-intro-seen";

function spokenSlice(text: string) {
  const clean = text
    .replace(/\[diagram:[^\]]+\]/gi, " ")
    .replace(/\[shape:[^\]]+\]/gi, " ")
    .replace(/[#>*`]/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= 900) return clean;
  const cut = clean.slice(0, 900);
  const mark = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("؟"), cut.lastIndexOf("!"), cut.lastIndexOf("?"));
  return mark > 80 ? cut.slice(0, mark + 1) : cut;
}

export function PouyaMainApp() {
  const [tab, setTab] = useState<Tab>("chat");
  const [level, setLevel] = useState<Level>("teen");
  const [voiceOn, setVoiceOn] = useState(true);
  const [mood, setMood] = useState<StageMood>("idle");
  const [mode, setMode] = useState<ChatMode>("chat");
  const [lang, setLang] = useState<LangCode>("en");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const messagesRef = useRef<ChatMsg[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceActiveRef = useRef(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const recRef = useRef<BrowserSpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [assistantId, setAssistantId] = useState<string | undefined>(undefined);
  const [introDone, setIntroDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [voiceCall, setVoiceCall] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");
  const voiceCallRef = useRef(false);
  const callMutedRef = useRef(false);
  const busyRef = useRef(false);
  const voiceOnRef = useRef(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const stick = () => {
      el.scrollTop = el.scrollHeight;
    };
    stick();
    const t0 = window.requestAnimationFrame(stick);
    const t1 = window.setTimeout(stick, 80);
    const t2 = window.setTimeout(stick, 250);
    return () => {
      window.cancelAnimationFrame(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [messages, typed, busy, tab]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    try {
      const prof = loadProfile();
      if (prof.level === "kid" || prof.level === "teen" || prof.level === "adult") setLevel(prof.level);
      setVoiceOn(prof.voiceOn !== false);
      if (prof.preferredAssistantId) setAssistantId(prof.preferredAssistantId);
    } catch {
      /* ignore */
    }
    try {
      if (sessionStorage.getItem(INTRO_KEY) === "1") setIntroDone(true);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  useEffect(() => {
    if (!messages.some((x) => x.role === "assistant")) return;
    if (!messages.some((x) => x.role === "user")) return;
    const saved = upsertChatSession({ id: sessionId, messages });
    if (saved && saved.id !== sessionId) setSessionId(saved.id);
    setHistoryTick((n) => n + 1);
  }, [messages, sessionId]);

  function ensureDiagram(userText: string, reply: string) {
    if (/\[diagram:/i.test(reply)) return reply;
    const d = matchDiagram(userText);
    if (!d) return reply;
    return `${reply}\n\n${diagramTag(d.id)}`;
  }

  async function playVoice(text: string) {
    if (!voiceCallRef.current && !voiceOnRef.current) return;
    const spoken = spokenSlice(text);
    if (!spoken) return;
    const finish = () => {
      voiceActiveRef.current = false;
      setMood("idle");
      if (voiceCallRef.current) setVoicePhase(callMutedRef.current ? "idle" : "listen");
    };
    const hasFa = /[\u0600-\u06FF]/.test(spoken);
    const speakLang = hasFa ? "fa-IR" : langById(lang).locale;
    try {
      const res = await speakPouya({ data: { text: spoken, lang: speakLang } });
      if (res && typeof res === "object" && "ok" in res && res.ok && "audio" in res && res.audio) {
        audioRef.current?.pause();
        window.speechSynthesis?.cancel();
        const url = `data:${(res as { mime?: string }).mime || "audio/mpeg"};base64,${res.audio}`;
        const audio = new Audio(url);
        audioRef.current = audio;
        voiceActiveRef.current = true;
        setMood("talk");
        if (voiceCallRef.current) setVoicePhase("talk");
        await new Promise<void>((resolve) => {
          audio.onended = () => {
            finish();
            resolve();
          };
          audio.onerror = () => {
            finish();
            resolve();
          };
          audio.onpause = () => {
            finish();
            resolve();
          };
          void audio.play().catch(() => {
            finish();
            resolve();
          });
        });
        return;
      }
    } catch {
      voiceActiveRef.current = false;
    }
    try {
      if (!window.speechSynthesis) {
        finish();
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spoken);
      u.lang = speakLang;
      u.rate = 1;
      try {
        const voices = window.speechSynthesis.getVoices?.() || [];
        const want = speakLang.toLowerCase();
        const pick =
          voices.find((v) => v.lang?.toLowerCase() === want) ||
          voices.find((v) => v.lang?.toLowerCase().startsWith(want.slice(0, 2))) ||
          voices.find((v) => /fa|per|iran/i.test(`${v.lang} ${v.name}`)) ||
          voices.find((v) => /ar[-_]?/i.test(v.lang || ""));
        if (pick) {
          u.voice = pick;
          u.lang = pick.lang || speakLang;
        }
      } catch {
        /* ignore */
      }
      voiceActiveRef.current = true;
      setMood("talk");
      if (voiceCallRef.current) setVoicePhase("talk");
      await new Promise<void>((resolve) => {
        u.onend = () => {
          finish();
          resolve();
        };
        u.onerror = () => {
          finish();
          resolve();
        };
        window.speechSynthesis.speak(u);
      });
      return;
    } catch {
      /* ignore */
    }
    finish();
  }

  async function send(
    text: string,
    nextMode: ChatMode = mode,
    nextLang?: LangCode,
    attachment?: { name: string; mime: string; dataUrl: string },
  ) {
    let content = text.trim();
    if (!content && attachment)
      content = `این ${attachment.mime.startsWith("image/") ? "عکس/جزوه" : "فایل"} را بررسی کن.`;
    if ((!content && !attachment) || busy) return;
    try {
      const sub = loadSubscription();
      const gate = canUseChat(sub.planId);
      if (!gate.ok) {
        toast.error("سقف گفتگوی امروز این پلن تمام شده. از حساب، پلن بالاتر را فعال کن.");
        return;
      }
    } catch {
      /* ignore */
    }
    const useLang = nextLang ?? lang;
    setMode(nextMode);
    if (nextLang) setLang(nextLang);
    setDraft("");
    if (nextMode === "live") setTab("live");
    else setTab("chat");
    if (attachment && !attachment.mime.startsWith("image/")) {
      try {
        const b64 = attachment.dataUrl.split(",")[1] || "";
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const decoded = new TextDecoder("utf-8").decode(bytes);
        if (decoded) content = `${content}\n\n--- ${attachment.name} ---\n${decoded.slice(0, 6000)}`;
      } catch {
        /* ignore */
      }
    }
    const userMsg: ChatMsg = {
      role: "user",
      content,
      image: attachment?.mime.startsWith("image/") ? attachment.dataUrl : undefined,
    };
    const history: ChatMsg[] = [...messages, userMsg];
    setMessages(history);
    setBusy(true);
    busyRef.current = true;
    setMood("think");
    audioRef.current?.pause();
    voiceActiveRef.current = false;
    try {
      const res = await askPouya({
        data: {
          messages: history.slice(-12).map((m) => ({ role: m.role, content: m.content })),
          image: attachment?.mime.startsWith("image/") ? attachment.dataUrl : undefined,
          level,
          mode: nextMode,
          lang: nextMode === "live" ? useLang : undefined,
          assistantId,
          learningBrief: learningBriefForPrompt(),
        },
      });
      const reply =
        res && typeof res === "object" && "ok" in res && res.ok && "text" in res && typeof res.text === "string"
          ? res.text
          : localTutorReply({ messages: history.slice(-12), mode: nextMode, lang: useLang });
      const withFig = ensureDiagram(content, reply);
      setMood("talk");
      if (voiceCallRef.current || voiceOnRef.current) void playVoice(withFig);
      setMessages([...history, { role: "assistant", content: withFig }]);
      try {
        noteInteraction({ userText: content, kind: "ask" });
        incrementChatUsage();
      } catch {
        /* ignore */
      }
      setTyped("");
      if (!voiceActiveRef.current) setMood("idle");
    } catch {
      const reply = localTutorReply({ messages: history.slice(-12), mode: nextMode, lang: useLang });
      const withFig = ensureDiagram(content, reply);
      setMood("talk");
      if (voiceCallRef.current || voiceOnRef.current) void playVoice(withFig);
      setMessages([...history, { role: "assistant", content: withFig }]);
      setTyped("");
      if (!voiceActiveRef.current) setMood("idle");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  function newChat() {
    stopMic();
    audioRef.current?.pause();
    voiceActiveRef.current = false;
    setMessages([]);
    setSessionId(undefined);
    setTyped("");
    setMode(tab === "live" ? "live" : "chat");
    setMood("idle");
  }

  function openHistorySession(id: string) {
    const s = getChatSession(id);
    if (!s) return;
    stopMic();
    audioRef.current?.pause();
    setSessionId(s.id);
    setMessages(s.messages.map((x) => ({ role: x.role, content: x.content })));
    setTyped("");
    setTab("chat");
    setMode("chat");
    setMood("idle");
  }

  function removeHistorySession(id: string) {
    deleteChatSession(id);
    if (sessionId === id) {
      setSessionId(undefined);
      setMessages([]);
    }
    setHistoryTick((n) => n + 1);
  }

  const historyItems = (() => {
    void historyTick;
    if (typeof window === "undefined") return [] as { id: string; title: string; when: string }[];
    try {
      return listChatSessions()
        .filter((s: ChatSession) => s && s.id && Array.isArray(s.messages) && s.messages.some((m) => m.role === "user"))
        .map((s: ChatSession) => ({
          id: s.id,
          title: (s.title || "گفتگو").slice(0, 60),
          when: formatSessionDate(s.updatedAt || s.createdAt || ""),
        }));
    } catch {
      return [] as { id: string; title: string; when: string }[];
    }
  })();

  function stopMic() {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }

  function toggleMic(forMode: ChatMode = mode) {
    const SR = getSpeechRecognition();
    if (!SR) {
      toast.error("برای میکروفون از Chrome یا Edge استفاده کن.");
      return;
    }
    if (listening) {
      stopMic();
      setMood("idle");
      return;
    }
    if (busy) return;
    const rec = new SR();
    rec.lang = forMode === "live" ? localeForLangCode(lang) : "fa-IR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const said = (ev.results[0]?.[0]?.transcript || "").trim();
      if (said) void send(said, forMode === "live" ? "live" : "chat");
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      if (!busy && !voiceActiveRef.current) setMood("idle");
    };
    rec.onerror = () => {
      setListening(false);
      recRef.current = null;
      setMood("idle");
    };
    recRef.current = rec;
    setListening(true);
    setMood("listen");
    try {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      rec.start();
    } catch {
      toast.error("میکروفون شروع نشد.");
      stopMic();
      setMood("idle");
    }
  }

  function startCallListen() {
    if (!voiceCallRef.current || callMutedRef.current || busyRef.current) return;
    const SR = getSpeechRecognition();
    if (!SR) return;
    stopMic();
    const rec = new SR();
    rec.lang = "fa-IR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const said = (ev.results[0]?.[0]?.transcript || "").trim();
      if (said) void sendVoice(said);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      if (voiceCallRef.current && !callMutedRef.current && !busyRef.current && !voiceActiveRef.current) {
        window.setTimeout(() => startCallListen(), 280);
      }
    };
    rec.onerror = () => {
      setListening(false);
      recRef.current = null;
      if (voiceCallRef.current) setVoicePhase("idle");
    };
    recRef.current = rec;
    setListening(true);
    setMood("listen");
    setVoicePhase("listen");
    try {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      rec.start();
    } catch {
      stopMic();
      setVoicePhase("idle");
    }
  }

  async function sendVoice(text: string) {
    const content = text.trim();
    if (!content || busyRef.current) return;
    try {
      const sub = loadSubscription();
      const gate = canUseChat(sub.planId);
      if (!gate.ok) {
        toast.error("سقف گفتگوی امروز تمام شده.");
        setVoicePhase("idle");
        return;
      }
    } catch {
      /* ignore */
    }
    stopMic();
    setDraft("");
    const history: ChatMsg[] = [...messagesRef.current, { role: "user", content }];
    setMessages(history);
    setBusy(true);
    busyRef.current = true;
    setMood("think");
    setVoicePhase("think");
    try {
      const res = await askPouya({
        data: {
          messages: history.slice(-12),
          level,
          mode: "chat",
          assistantId,
          learningBrief: learningBriefForPrompt(),
        },
      });
      const reply =
        res && typeof res === "object" && "ok" in res && res.ok && "text" in res && typeof res.text === "string"
          ? res.text
          : localTutorReply({ messages: history.slice(-12), mode: "chat" });
      const withFig = ensureDiagram(content, reply);
      setMessages([...history, { role: "assistant", content: withFig }]);
      try {
        noteInteraction({ userText: content, kind: "ask" });
        incrementChatUsage();
      } catch {
        /* ignore */
      }
      setMood("talk");
      setVoicePhase("talk");
      await playVoice(withFig);
    } catch {
      const reply = localTutorReply({ messages: history.slice(-12), mode: "chat" });
      const withFig = ensureDiagram(content, reply);
      setMessages([...history, { role: "assistant", content: withFig }]);
      await playVoice(withFig);
    } finally {
      setBusy(false);
      busyRef.current = false;
      if (voiceCallRef.current && !callMutedRef.current) startCallListen();
      else if (voiceCallRef.current) setVoicePhase("idle");
    }
  }

  async function openVoiceCall() {
    stopMic();
    voiceCallRef.current = true;
    callMutedRef.current = false;
    setCallMuted(false);
    setVoiceCall(true);
    setVoicePhase("talk");
    const greeting = "سلام، من پویا هستم. هر چیزی که تو ذهنت هست بگو تا کمکت کنم.";
    if (!messagesRef.current.length) {
      setMessages([{ role: "assistant", content: greeting }]);
      await playVoice(greeting);
    }
    if (voiceCallRef.current && !callMutedRef.current) startCallListen();
  }

  function closeVoiceCall() {
    voiceCallRef.current = false;
    callMutedRef.current = false;
    stopMic();
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    voiceActiveRef.current = false;
    busyRef.current = false;
    setBusy(false);
    setVoiceCall(false);
    setCallMuted(false);
    setVoicePhase("idle");
    setMood("idle");
  }

  function toggleCallMute() {
    const next = !callMutedRef.current;
    callMutedRef.current = next;
    setCallMuted(next);
    if (next) {
      stopMic();
      setVoicePhase("idle");
    } else {
      startCallListen();
    }
  }

  function saveLast(folder: FolderId = "knowledge") {
    const lastA = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastA?.content) {
      toast.error("هنوز جوابی برای ذخیره نیست.");
      return;
    }
    try {
      saveNote({ title: titleFromBody(lastA.content), body: lastA.content, folder });
      toast.success("ذخیره شد.");
    } catch {
      toast.error("ذخیره نشد.");
    }
  }

  function openLivePractice() {
    setTab("live");
    setMode("live");
  }

  if (!hydrated) {
    return <div className="p-8 text-center text-sm text-muted-foreground">در حال آماده‌سازی…</div>;
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-2 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PouyaStage mood={mood} />
          <div>
            <div className="text-sm font-semibold">پویا</div>
            <div className="text-xs text-muted-foreground">مربی آموزشی</div>
          </div>
        </div>
      </div>
      <main className="flex min-h-0 flex-1 flex-col">
        {tab === "chat" ? (
          <ChatPane
            messages={messages}
            typed={typed}
            busy={busy}
            draft={draft}
            setDraft={setDraft}
            level={level}
            setLevel={setLevel}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
            mode={mode}
            listening={listening}
            scrollerRef={scrollerRef}
            onSend={(t, a) => void send(t, mode, undefined, a)}
            onLesson={(t) => void send(t, "lesson")}
            onDaily={() => void send("یک موضوع آموزشی روزانه به من بگو", "chat")}
            onFact={() => void send("یک واقعیت علمی جالب بگو", "chat")}
            onMic={() => toggleMic("chat")}
            onLivePractice={openLivePractice}
            onNew={newChat}
            onSave={() => saveLast()}
            onVoiceCall={() => void openVoiceCall()}
            historyItems={historyItems}
            historyOpen={historyOpen}
            setHistoryOpen={setHistoryOpen}
            activeSessionId={sessionId}
            onOpenHistoryItem={openHistorySession}
            onDeleteHistoryItem={removeHistorySession}
          />
        ) : null}
        {tab === "live" ? (
          <LivePane
            messages={messages}
            typed={typed}
            busy={busy}
            draft={draft}
            setDraft={setDraft}
            level={level}
            setLevel={setLevel}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
            lang={lang}
            setLang={setLang}
            listening={listening}
            scrollerRef={scrollerRef}
            onSend={(t) => void send(t, "live", lang)}
            onScenario={(p) => void send(p, "live", lang)}
            onMic={() => toggleMic("live")}
            onNew={newChat}
            onSave={() => saveLast()}
            onVoiceCall={() => void openVoiceCall()}
          />
        ) : null}
        {tab === "quiz" ? <QuizPane level={level} setMood={setMood} /> : null}
        {tab === "vault" ? <VaultPane /> : null}
        {tab === "coaches" ? (
          <CoachesPane
            activeId={assistantId}
            onStart={(a) => {
              setAssistantId(a.id);
              setTab("chat");
            }}
            onAskLesson={(prompt) => {
              setTab("chat");
              void send(prompt, "lesson");
            }}
          />
        ) : null}
        {tab === "account" ? <AccountPane /> : null}
      </main>
      {voiceCall ? (
        <PouyaVoiceCall
          phase={voicePhase}
          muted={callMuted}
          onClose={closeVoiceCall}
          onToggleMute={toggleCallMute}
        />
      ) : null}
    </div>
  );
}
