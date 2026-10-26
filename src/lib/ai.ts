import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { localQuiz, localTutorReply, todayFact, type QuizPayload, type QuizQuestion } from "./library";
import { langById, type Level } from "./topics";
import { assistantSystemExtra } from "./assistants";
import { LESSON_DIAGRAMS, diagramTag, matchDiagram } from "./lesson-diagrams";
import { bankReply } from "./bank-first";
import { brainLookupShared, brainRememberShared, isBankWorthyQuestion, isLessonQuestion } from "./pouya-brain";
import {
  looksVisual,
  queryFromPersian,
  resolveWikiTags,
  stripForeignImages,
} from "./wiki-image";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(12000),
});

const ChatInput = z.object({
  messages: z.array(MessageSchema).min(1).max(16),
  image: z.string().max(6_500_000).optional(),
  level: z.enum(["kid", "teen", "adult"]).catch("teen"),
  mode: z.enum(["chat", "daily", "lesson", "live", "language"]).catch("chat"),
  lang: z.string().min(1).max(16).optional(),
  assistantId: z.string().min(1).max(40).optional(),
  learningBrief: z.string().max(800).optional(),
});

const QuizInput = z.object({
  topic: z.string().min(1).max(80),
  level: z.enum(["kid", "teen", "adult"]),
});

const SpeakInput = z.object({
  text: z.string().min(1).max(1200),
  lang: z.string().min(2).max(16).optional(),
});

const FactInput = z.object({
  level: z.enum(["kid", "teen", "adult"]),
});

export type ChatMode = "chat" | "daily" | "lesson" | "live" | "language";
export type { QuizQuestion, QuizPayload };

type ChatMsg = { role: "user" | "assistant"; content: string };
type ChatResult = { ok: true; text: string; provider?: string } | { ok: false; error: string };
type ProviderId = "bank" | "openai" | "gemini";

const DEFAULT_GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"];
function geminiModels(): string[] {
  const raw = process.env.GEMINI_MODELS;
  const list = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return list.length ? list : DEFAULT_GEMINI_MODELS;
}
function logAi(...args: unknown[]) {
  console.error("[pouya-ai]", ...args);
}

function isFactRequest(text: string): boolean {
  return /(دانستی|دانستنی|واقعیت علمی|یک موضوع آموزشی روزانه)/.test(text.trim());
}

function wantsLiveMarket(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/(قیمت|نرخ|چند\s*ه|چنده|چنداست|چند\s*تومن|چند\s*تومان|چند\s*ریال)/.test(t)) return true;
  if (
    /(دلار|یورو|پوند|لیر|ین|یوان|درهم|دینار|روبل|فرانک|تتر|بیت\s*کوین|طلا|سکه|انس|usd|eur|gbp|try|jpy|cny|aed|btc|usdt)/i.test(
      t,
    ) && /(چند|قیمت|نرخ|چنده)/.test(t)
  )
    return true;
  return false;
}

type MarketSnap = { line: string; asOf?: string };

async function fetchIranMarketSnap(): Promise<MarketSnap | null> {
  const url =
    "https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/popular.json";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "pouya-tutor/1" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      updated_at?: string;
      data?: Array<{ symbol?: string; price?: number | string; unit?: string; name?: string }>;
    };
    const rows = Array.isArray(json.data) ? json.data : [];
    const by = (sym: string) => rows.find((r) => (r.symbol || "").toUpperCase() === sym);
    const fmt = (n: number | string | undefined) => {
      const v = typeof n === "string" ? Number(n.replace(/,/g, "")) : Number(n);
      if (!Number.isFinite(v)) return null;
      return Math.round(v).toLocaleString("fa-IR");
    };
    const parts: string[] = [];
    const usd = by("USD_IRR_FREE");
    const eur = by("EUR_IRR_FREE");
    const gbp = by("GBP_IRR_FREE");
    const gold = by("GOLD_18K_IRR");
    const coin = by("COIN_EMAMI_IRR");
    const usdt = by("USDT_IRR");
    if (usd?.price != null) parts.push(`دلار آزاد ≈ ${fmt(usd.price)} تومان`);
    if (eur?.price != null) parts.push(`یورو آزاد ≈ ${fmt(eur.price)} تومان`);
    if (gbp?.price != null) parts.push(`پوند ≈ ${fmt(gbp.price)} تومان`);
    if (usdt?.price != null) parts.push(`تتر ≈ ${fmt(usdt.price)} تومان`);
    if (gold?.price != null) parts.push(`طلای ۱۸ عیار ≈ ${fmt(gold.price)} تومان در هر گرم`);
    if (coin?.price != null) parts.push(`سکه امامی ≈ ${fmt(coin.price)} تومان`);
    if (!parts.length) return null;
    const asOf = json.updated_at || "";
    const line =
      `داده زنده بازار آزاد ایران${asOf ? ` (به‌روزرسانی منبع: ${asOf})` : ""}:\n` +
      parts.map((p) => `- ${p}`).join("\n") +
      `\nاین اعداد تقریبی‌اند. برای هر ارز دیگری AI باید با دانش و استدلال خودش جواب بدهد.`;
    return { line, asOf };
  } catch (e) {
    logAi("market_fetch_fail", e);
    return null;
  }
}

const DEFAULT_ORDER: ProviderId[] = ["gemini", "openai"];
const DIAGRAM_IDS = LESSON_DIAGRAMS.map((d) => d.id).join(", ");

function levelLine(level: Level) {
  if (level === "kid") return "سطح: خیلی ساده، جمله‌های کوتاه، مثل کتاب ابتدایی/متوسطه اول.";
  if (level === "teen") return "سطح: متوسط / دبیرستان. دقیق، با مثال روزمره و کتاب درسی.";
  return "سطح: بزرگسال یا پیشرفته؛ دقیق و منسجم.";
}

function textbookStyleRules(level: Level) {
  return (
    `سبک کتاب درسی فارسی:\n` +
    `- بدون LaTeX و بدون علامت دلار ($). هرگز $ یا $$ نگذار.\n` +
    `- sin/cos/tan/cot و π مجاز. کسر را ساده بنویس مثل (۱) ÷ (۲).\n` +
    (level === "kid" ? `- خیلی ساده و خودمانی.\n` : `- واضح و مرحله‌ای.\n`)
  );
}

function sanitizeStudentMath(text: string, level: Level): string {
  let t = text;
  t = t.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/gi, "($1) ÷ ($2)");
  t = t.replace(/\\pi\b/gi, "π");
  t = t.replace(/\\times\b/gi, "×");
  t = t.replace(/\\cdot\b/gi, "·");
  t = t.replace(/\$\$([\s\S]*?)\$\$/g, "$1");
  t = t.replace(/\$([^$]+)\$/g, "$1");
  t = t.replace(/\$/g, "");
  t = t.replace(/\\[a-zA-Z]+/g, "");
  t = t.replace(/\\\[|\\\]/g, "");
  t = t.replace(/\\\(|\\\)/g, "");
  t = t.replace(/\{([^{}]*)\}/g, "$1");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

function parseDataUrl(dataUrl: string): { mime: string; b64: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  const mime = m[1].toLowerCase();
  if (!mime.startsWith("image/")) return null;
  return { mime, b64: m[2] };
}

function systemPrompt(
  level: Level,
  mode: ChatMode,
  langId?: string,
  assistantId?: string,
  hasImage?: boolean,
  learningBrief?: string,
) {
  const lang = langById(langId || "fa");
  const coach = assistantSystemExtra(assistantId);
  const vision = hasImage
    ? `\n- کاربر تصویر فرستاده؛ دقیق ببین و تحلیل کن. نگو فقط شکل هندسی می‌فهمم.`
    : "";
  const memory =
    learningBrief && learningBrief.trim()
      ? `\nحافظه یادگیری:\n${learningBrief.trim()}\n`
      : "";
  const base =
    `تو «پویا» هستی: مربی زنده و کنجکاو برای دانش‌آموزان ایران.\n` +
    `قوانین:\n` +
    `- ${levelLine(level)}\n` +
    `- مغز اصلی تو هوش مصنوعی است: هر چیزی که بچه بپرسد خودت بفهم و جواب بده. منتظر کلیدواژه یا لیست موضوع نباش.\n` +
    `- مستقیم و طبیعی جواب بده؛ مثل معلم باهوش، نه ربات عذرخواه.\n` +
    `- همیشه کمک‌کننده و انسان‌وار جواب بده. اگر کاربر نگران، مریض، ناراحت یا کنجکاو است همدلی کوتاه و راهنمایی مفید بده.\n` +
    `- هرگز نگو به اطلاعات زنده / به‌روز / اینترنت دسترسی نداری. این جمله‌ها ممنوع است.\n` +
    `- هرگز نگو نمی‌دانم، پوشش نمی‌دهم، خارج از تخصصم است، فقط دانش قبلی دارم — مگر برای محتوای جنسی صریح.\n` +
    `- اگر مطمئن نیستی بهترین تخمین و قدم بعدی مفید بده و کوتاه بگو تقریبی است.\n` +
    `- سؤال شخصی (مثل مریضی خانواده) را جدی بگیر: همدلی + توصیه عمومی ایمن + در صورت نیاز پیشنهاد کمک از بزرگ‌تر یا پزشک.\n` +
    `- اگر داده زنده بازار در پرامپت هست از آن استفاده کن؛ وگرنه با دانش و استدلال خودت جواب بده.\n` +
    `- اگر کاربر عکس/شکل/نقشه خواست نگو نمی‌توانی تصویر بدهی. سیستم خودش از بانک اطلس محلی یا شکل آموزشی تصویر می‌گذارد؛ فقط توضیح کوتاه بده و تگ [wiki:...] نگذار مگر اینکه سیستم نتواند تصویر محلی پیدا کند.\n` +
    `- برای سؤال نقشه/جغرافیا هرگز تصویر بی‌ربط نساز و [wiki] نگذار؛ بانک اطلس پویا اولویت دارد.\n` +
    `- ایمنی کودک: آسیب به خود/خودکشی/خشونت → همدلی کوتاه، پیشنهاد کمک از بزرگ‌تر/اورژانس، بدون راهنمایی آسیب‌زا.\n` +
    `- فقط محتوای جنسی ممنوع است.\n` +
    `- در صورت نیاز [diagram:id] از این‌ها: ${DIAGRAM_IDS}\n` +
    `- زبان پاسخ = زبان پیام کاربر.\n` +
    textbookStyleRules(level) +
    vision +
    memory +
    (coach ? `\n${coach}` : "");

  if (mode === "live" || mode === "language") {
    return (
      base +
      `\nحالت آموزش زبان زنده (${lang.label} / ${lang.native}):\n` +
      `- جواب اصلی به ${lang.native} باشد.\n` +
      `- غلط‌های کاربر را مودب اصلاح کن.\n` +
      `- ترجمه‌ی کوتاه فارسی در پرانتز مجاز است.\n`
    );
  }
  if (mode === "lesson") {
    return base + `\nحالت درس: مرحله‌ای، با مثال، کوتاه و قابل فهم.\n`;
  }
  if (mode === "daily") {
    return base + `\nحالت موضوع روزانه: یک موضوع آموزشی جذاب و کوتاه.\n`;
  }
  return base;
}

function providerOrder(): ProviderId[] {
  const raw = process.env.AI_PROVIDER_ORDER || "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is ProviderId => s === "bank" || s === "openai" || s === "gemini");
  return list.length ? list : DEFAULT_ORDER;
}

function looksLikeLameRefusal(text: string): boolean {
  const t = (text || "").trim();
  if (!t) return true;
  const low = t.replace(/\u200c/g, "");
  if (/دسترسی\s*به\s*(اطلاعات|داده)/.test(low) && /(زنده|به\s*روز|اینترنت|لحظ)/.test(low)) return true;
  if (/(نمی\s*توانم|نمیتوانم)/.test(low) && /(اطلاعات|داده\s*زنده|دسترسی|به\s*روز)/.test(low)) return true;
  if (/فقط/.test(low) && /(دانش|اطلاعات)/.test(low) && /(قبلی|از\s*قبل|آموزش)/.test(low)) return true;
  if (/(خارج\s*از\s*(تخصص|دامنه|محدوده)|پوشش\s*نمی|در\s*حیطه\s*من\s*نیست)/.test(low)) return true;
  if (/(متاسفانه|متأسفانه)/.test(low) && /(نمی\s*توانم|نمیتوانم|دسترسی\s*ندارم)/.test(low)) return true;
  if (/I (don't|do not|cannot|can't) (have|access|provide)/i.test(t) && /(real[- ]?time|up[- ]?to[- ]?date|live)/i.test(t))
    return true;
  if (/اتصال\s*مدل\s*کامل\s*در\s*دسترس\s*نیست/.test(low)) return true;
  return false;
}

async function callGemini(messages: ChatMsg[], system: string, image?: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    logAi("gemini_no_key");
    return null;
  }
  const models = geminiModels();
  type GemPart = { text?: string; inline_data?: { mime_type: string; data: string } };
  const imageParts: GemPart[] = [];
  if (image) {
    const parsed = parseDataUrl(image);
    if (parsed) imageParts.push({ inline_data: { mime_type: parsed.mime, data: parsed.b64 } });
  }
  const contents: Array<{ role: string; parts: GemPart[] }> = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (imageParts.length) {
    const last = contents[contents.length - 1];
    if (last && last.role === "user") last.parts = [...imageParts, ...last.parts];
  }
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
        }),
      });
      if (!res.ok) {
        logAi("gemini_http", model, res.status);
        continue;
      }
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } };
      };
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      if (text.trim()) return text.trim();
    } catch (e) {
      logAi("gemini_err", model, e);
    }
  }
  return null;
}

async function callOpenAI(messages: ChatMsg[], system: string, image?: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY || process.env.LIARA_API_KEY;
  if (!key) return null;
  const base = (
    process.env.OPENAI_BASE_URL ||
    process.env.LIARA_BASE_URL ||
    "https://api.openai.com/v1"
  )
    .trim()
    .replace(/\/+$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const msgs: Array<{ role: string; content: unknown }> = [{ role: "system", content: system }];
  for (const m of messages) {
    if (m.role === "user" && image && m === messages[messages.length - 1]) {
      const parsed = parseDataUrl(image);
      if (parsed) {
        msgs.push({
          role: "user",
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: image } },
          ],
        });
        continue;
      }
    }
    msgs.push({ role: m.role, content: m.content });
  }
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: msgs, temperature: 0.6 }),
    });
    if (!res.ok) {
      logAi("openai_http", res.status);
      return null;
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content || "";
    return text.trim() || null;
  } catch (e) {
    logAi("openai_err", e);
    return null;
  }
}

/** اولویت اطلس محلی؛ فقط اگر نبود ویکی‌مدیا */
async function attachVisuals(text: string, lastUser: string): Promise<string> {
  let out = text;
  const localDiagram = matchDiagram(lastUser);
  if (localDiagram?.imageUrl) {
    out = out.replace(/!\[[^\]]*\]\([^)]+\)/g, "").replace(/\[wiki:[^\]]+\]/gi, "").trim();
    const imgMd = `![${localDiagram.title}](${localDiagram.imageUrl})`;
    const cap = localDiagram.caption ? `\n*${localDiagram.caption}*` : "";
    out = `${out}\n\n${imgMd}${cap}`;
  } else if (looksVisual(lastUser) && !/\[wiki:/i.test(out) && !/!\[[^\]]*\]\(\/atlas\//i.test(out)) {
    const q = queryFromPersian(lastUser);
    if (q) out = `${out}\n\n[wiki:${q}]`;
  }
  try {
    const resolved = await resolveWikiTags(out);
    out = resolved.text;
  } catch {
    /* ignore wiki */
  }
  return stripForeignImages(out);
}

export const askPouya = createServerFn({ method: "POST" })
  .validator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }): Promise<ChatResult> => {
    try {
      const level = data.level;
      const mode = data.mode as ChatMode;
      const messages = data.messages as ChatMsg[];
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      let system = systemPrompt(level, mode, data.lang, data.assistantId, !!data.image, data.learningBrief);
      if (wantsLiveMarket(lastUser)) {
        const snap = await fetchIranMarketSnap();
        if (snap?.line) {
          system = `${system}\n\nداده زنده بازار (کمک به AI، نه جایگزین فکر کردن):\n${snap.line}`;
        }
      }

      const bank = bankReply({ messages, mode, lang: data.lang });
      if (bank) {
        const withVisual = await attachVisuals(sanitizeStudentMath(bank, level), lastUser);
        return { ok: true, text: withVisual, provider: "bank" };
      }

      const factQ = isFactRequest(lastUser);
      const lessonQ = !factQ && (mode === "lesson" || mode === "daily");
      const educational = !factQ && isLessonQuestion(lastUser, mode);

      if (lessonQ) {
        const remembered = await brainLookupShared(lastUser, level, data.assistantId);
        if (remembered?.a) {
          const withVisual = await attachVisuals(sanitizeStudentMath(remembered.a, level), lastUser);
          return { ok: true, text: withVisual, provider: "bank" };
        }
      }

      let reply: string | null = null;
      let provider: ProviderId | undefined;
      for (const p of providerOrder()) {
        if (p === "bank") continue;
        if (p === "gemini") {
          reply = await callGemini(messages, system, data.image);
          if (reply) {
            provider = "gemini";
            break;
          }
        }
        if (p === "openai") {
          reply = await callOpenAI(messages, system, data.image);
          if (reply) {
            provider = "openai";
            break;
          }
        }
      }

      if (reply && looksLikeLameRefusal(reply)) {
        logAi("refusal_retry", reply.slice(0, 120));
        const force =
          system +
          "\n\nدستور فوری: جواب قبلی‌ات شبیه عذرخواهی ربات بود. دوباره فقط یک جواب مفید انسانی بنویس. هرگز نگو دسترسی به اطلاعات زنده نداری. مستقیم به نیاز کاربر پاسخ بده.";
        for (const p of providerOrder()) {
          if (p === "gemini") {
            const retry = await callGemini(messages, force, data.image);
            if (retry && !looksLikeLameRefusal(retry)) {
              reply = retry;
              provider = "gemini";
              break;
            }
          }
          if (p === "openai") {
            const retry = await callOpenAI(messages, force, data.image);
            if (retry && !looksLikeLameRefusal(retry)) {
              reply = retry;
              provider = "openai";
              break;
            }
          }
        }
      }

      if (!reply) {
        logAi("ai_all_failed", {
          order: providerOrder(),
          hasGemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
          hasOpenAI: !!(process.env.OPENAI_API_KEY || process.env.LIARA_API_KEY),
          last: lastUser.slice(0, 80),
        });
        if (factQ) {
          reply = todayFact();
          provider = "bank";
        } else {
          const remembered = await brainLookupShared(lastUser, level, data.assistantId);
          if (remembered?.a) {
            const withVisual = await attachVisuals(sanitizeStudentMath(remembered.a, level), lastUser);
            return { ok: true, text: withVisual, provider: "bank" };
          }
          reply = localTutorReply({ messages, mode, lang: data.lang });
          provider = "bank";
        }
      }

      let text = await attachVisuals(sanitizeStudentMath(reply, level), lastUser);

      if ((lessonQ || educational) && provider && provider !== "bank") {
        try {
          await brainRememberShared(lastUser, text, { level, assistantId: data.assistantId });
        } catch {
          /* ignore */
        }
      }

      return { ok: true, text, provider };
    } catch (e) {
      logAi("ask_fail", e);
      return { ok: false, error: "ask_fail" };
    }
  });

export const makeQuiz = createServerFn({ method: "POST" })
  .validator((input: unknown) => QuizInput.parse(input))
  .handler(async ({ data }) => {
    try {
      return { ok: true as const, quiz: localQuiz(data.topic) };
    } catch {
      return { ok: false as const, error: "quiz_fail" };
    }
  });

export const speakText = createServerFn({ method: "POST" })
  .validator((input: unknown) => SpeakInput.parse(input))
  .handler(async ({ data }) => {
    return { ok: false as const, error: "tts_disabled", text: data.text };
  });

export const dailyFact = createServerFn({ method: "POST" })
  .validator((input: unknown) => FactInput.parse(input))
  .handler(async () => {
    return { ok: true as const, text: todayFact() };
  });
