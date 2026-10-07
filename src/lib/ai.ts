import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { localQuiz, localTutorReply, todayFact, type QuizPayload, type QuizQuestion } from "./library";
import { langById, type Level } from "./topics";
import { assistantSystemExtra } from "./assistants";
import { LESSON_DIAGRAMS, diagramTag, matchDiagram } from "./lesson-diagrams";
import { bankReply } from "./bank-first";
import { brainLookup, brainRemember, isBankWorthyQuestion, isLessonQuestion } from "./pouya-brain";
import {
  findWikiImage,
  looksVisual,
  queryFromPersian,
  resolveWikiTags,
  stripForeignImages,
  wikiMarkdown,
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

const DEFAULT_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
function geminiModels(): string[] {
  const raw = process.env.GEMINI_MODELS;
  const list = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return list.length ? list : DEFAULT_GEMINI_MODELS;
}
function logAi(...args: unknown[]) {
  console.error("[pouya-ai]", ...args);
}

/** تشخیص سؤال قیمت لحظه‌ای ارز/طلای بازار ایران */
function wantsLiveMarket(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return /قیمت|نرخ|چند\s*ه|چنده|چنداست|چند\s*تومن|چند\s*تومان|چند\s*ریال|دلار|یورو|پوند|درهم|تتر|طلا|سکه|انس|bitcoin|btc|usdt|usd|eur|gbp/i.test(
    t,
  );
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
    const gold = by("GOLD_18K_IRR");
    const coin = by("COIN_EMAMI_IRR");
    const usdt = by("USDT_IRR");
    if (usd?.price != null) parts.push(`دلار آزاد ≈ ${fmt(usd.price)} تومان`);
    if (eur?.price != null) parts.push(`یورو آزاد ≈ ${fmt(eur.price)} تومان`);
    if (usdt?.price != null) parts.push(`تتر ≈ ${fmt(usdt.price)} تومان`);
    if (gold?.price != null) parts.push(`طلای ۱۸ عیار ≈ ${fmt(gold.price)} تومان در هر گرم`);
    if (coin?.price != null) parts.push(`سکه امامی ≈ ${fmt(coin.price)} تومان`);
    if (!parts.length) return null;
    const asOf = json.updated_at || "";
    const line =
      `داده زنده بازار آزاد ایران${asOf ? ` (به‌روزرسانی منبع: ${asOf})` : ""}:\n` +
      parts.map((p) => `- ${p}`).join("\n") +
      `\nاین اعداد تقریبی‌اند و ممکن است چند دقیقه تا نیم‌ساعت تأخیر داشته باشند. منبع: iran-market.`;
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
    `تو «پویا» هستی: مربی زنده آموزش برای دانش‌آموزان ایران.\n` +
    `قوانین:\n` +
    `- ${levelLine(level)}\n` +
    `- مغز اصلی تو هوش مصنوعی است: هر سؤال را تحلیل کن و جواب هوشمند بده.\n` +
    `- مستقیم و طبیعی به همان سؤال جواب بده؛ مثل یک معلم باهوش، نه منوی دکمه.\n` +
    `- از لیست‌های کلیشه‌ای و خوش‌آمد اضافی پرهیز کن مگر کاربر فقط سلام کرده باشد.\n` +
    `- مثل ربات کلمات کلیدی نباش.\n` +
    `- هرگز برای سؤال‌های روزمره (قیمت، خبر، واقعیت) نگو «نمی‌توانم اطلاعات به‌روز بدهم». اگر داده زنده در پرامپت هست همان را بگو؛ اگر نیست با استدلال و دانش خودت کمک کن و محدودیت را کوتاه بگو.\n` +
    `- اگر کاربر عکس/شکل/نقشه خواست: هرگز نگو نمی‌توانی تصویر نشان دهی. سیستم خودش عکس می‌آورد. فقط توضیح کوتاه بده و در انتها [wiki:عبارت انگلیسی دقیق] مثل [wiki:Iran location map] بگذار. هرگز [تصویر] ننویس.\n` +
    `- ایمنی کودک: اگر کاربر از آسیب به خود، خودکشی، خشونت خانگی یا سوءاستفاده گفت، همدلی کوتاه کن، کمک گرفتن از بزرگ‌تر/اورژانس را پیشنهاد بده، راهنمایی آسیب‌زا نده. اطلاعات شخصی حساس را نخواه.\n` +
    `- فقط محتوای جنسی ممنوع است.\n` +
    `- در صورت نیاز [diagram:id] از این‌ها: ${DIAGRAM_IDS}\n` +
    `- زبان پاسخ = زبان پیام کاربر.\n` +
    `- اگر بلوک «داده زنده بازار» در همین پیام سیستم هست، برای قیمت دلار/یورو/طلا/سکه همان را مبنا بگذار و هرگز نگو «نمی‌توانم اطلاعات به‌روز بدهم». عدد را واضح بگو و بگو تقریبی و وابسته به بازار آزاد است.\n` +
    textbookStyleRules(level) +
    vision +
    memory +
    (coach ? `\n${coach}` : "");

  if (mode === "live" || mode === "language") {
    return (
      base +
      `\nحالت آموزش زبان زنده (${lang.labelFa} / ${lang.labelEn}):\n` +
      `- جواب اصلی به ${lang.labelEn} باشد.\n` +
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

async function callGemini(messages: ChatMsg[], system: string, image?: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const models = geminiModels();
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];
  if (image) {
    const parsed = parseDataUrl(image);
    if (parsed) parts.push({ inline_data: { mime_type: parsed.mime, data: parsed.b64 } });
  }
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (parts.length) {
    const last = contents[contents.length - 1];
    if (last && last.role === "user") last.parts = [...parts, ...last.parts];
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
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
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
          system = `${system}\n\nداده زنده بازار (فقط کمک به تحلیل AI):\n${snap.line}`;
        }
      }

      // ۱) سلام/تأیید کوتاه → بانک سریع
      const bank = bankReply({ messages, mode, lang: data.lang });
      if (bank) return { ok: true, text: sanitizeStudentMath(bank, level), provider: "bank" };

      const lessonQ = isLessonQuestion(lastUser, mode);

      // ۲) سؤال درسی → اول بانک (مغز) برای جواب سریع
      if (lessonQ) {
        const remembered = brainLookup(lastUser, level, data.assistantId);
        if (remembered?.a) {
          return { ok: true, text: sanitizeStudentMath(remembered.a, level), provider: "bank" };
        }
      }

      // ۳) مسیر اصلی: هوش مصنوعی فکر می‌کند و جواب می‌دهد
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

      // ۴) AI قطع بود → بانک/محلی به‌عنوان پشتیبان
      if (!reply) {
        logAi("ai_all_failed", { order: providerOrder(), last: lastUser.slice(0, 80) });
        const remembered = brainLookup(lastUser, level, data.assistantId);
        if (remembered?.a) {
          return { ok: true, text: sanitizeStudentMath(remembered.a, level), provider: "bank" };
        }
        reply = localTutorReply({ messages, mode, lang: data.lang });
        provider = "bank";
      }

      let text = sanitizeStudentMath(reply, level);
      if (looksVisual(lastUser) && !/\[wiki:/i.test(text)) {
        const q = queryFromPersian(lastUser) || lastUser;
        const tags = resolveWikiTags(q);
        if (tags.length) text = `${text}\n\n${wikiMarkdown(tags[0]!)}`;
      }
      text = stripForeignImages(text);

      // ۵) جواب درسی موفق از AI → بانک را به‌روز کن تا دفعه بعد سریع‌تر باشد
      if (lessonQ && provider && provider !== "bank") {
        try {
          brainRemember(lastUser, text, { level, assistantId: data.assistantId });
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

export const speakPouya = createServerFn({ method: "POST" })
  .validator((input: unknown) => SpeakInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const text = data.text.replace(/[*_`#>-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 900);
      if (!text) return { ok: false as const, error: "empty" };

      const key = (
        process.env.OPENAI_API_KEY ||
        process.env.LIARA_API_KEY ||
        process.env.OPENAI_TTS_KEY ||
        ""
      ).trim();
      if (!key) return { ok: false as const, error: "no_tts_key" };

      const baseUrl = (
        process.env.OPENAI_BASE_URL ||
        process.env.LIARA_BASE_URL ||
        process.env.OPENAI_TTS_BASE_URL ||
        "https://api.openai.com/v1"
      )
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/audio\/speech$/, "");

      const isLiara = /liara\.ir|ai\.liara/i.test(baseUrl);
      const voice = process.env.OPENAI_TTS_VOICE || "onyx";
      const envModel = (process.env.OPENAI_TTS_MODEL || "").trim();

      const models = (
        envModel
          ? [envModel, "openai/tts-1", "google/gemini-3.1-flash-tts-preview", "tts-1"]
          : isLiara
            ? ["openai/tts-1", "google/gemini-3.1-flash-tts-preview", "tts-1"]
            : ["tts-1", "openai/tts-1"]
      ).filter((m, i, arr) => m && arr.indexOf(m) === i);

      async function trySpeech(
        base: string,
        apiKey: string,
        model: string,
      ): Promise<{ ok: true; audio: string; mime: string } | { ok: false; status: number }> {
        if (!apiKey || !base) return { ok: false, status: 0 };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        try {
          const res = await fetch(`${base}/audio/speech`, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, voice, input: text, response_format: "mp3" }),
            signal: controller.signal,
          });
          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            logAi("tts_http", res.status, base, model, errBody.slice(0, 200));
            return { ok: false, status: res.status };
          }
          const buf = Buffer.from(await res.arrayBuffer());
          if (!buf.length) return { ok: false, status: 204 };
          return { ok: true, audio: buf.toString("base64"), mime: "audio/mpeg" };
        } catch (e) {
          logAi("tts_fetch_fail", base, model, e);
          return { ok: false, status: 0 };
        } finally {
          clearTimeout(timeout);
        }
      }

      for (const model of models) {
        const r = await trySpeech(baseUrl, key, model);
        if (r.ok) return { ok: true as const, audio: r.audio, mime: r.mime };
      }

      logAi("tts_all_failed", { baseUrl, models, isLiara });
      return { ok: false as const, error: "tts_unavailable" };
    } catch (e) {
      logAi("tts_fail", e);
      return { ok: false as const, error: "tts_fail" };
    }
  });

export const dailyFact = createServerFn({ method: "POST" })
  .validator((input: unknown) => FactInput.parse(input))
  .handler(async ({ data }) => {
    try {
      return { ok: true as const, text: todayFact() };
    } catch {
      return { ok: false as const, error: "unavailable" };
    }
  });
