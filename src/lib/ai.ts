import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { localQuiz, localTutorReply, todayFact, type QuizPayload, type QuizQuestion } from "./library";
import { langById, type Level } from "./topics";
import { assistantSystemExtra } from "./assistants";
import { LESSON_DIAGRAMS, diagramTag, matchDiagram } from "./lesson-diagrams";
import { bankReply } from "./bank-first";
import { brainLookup, brainRemember, isBankWorthyQuestion } from "./pouya-brain";
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
    `- مستقیم به همان سؤال جواب بده.\n` +
    `- مثل ربات کلمات کلیدی نباش.\n` +
    `- اگر کاربر عکس/شکل/نقشه خواست: هرگز نگو نمی‌توانی تصویر نشان دهی. سیستم خودش عکس می‌آورد. فقط توضیح کوتاه بده و در انتها [wiki:عبارت انگلیسی دقیق] مثل [wiki:Iran location map] بگذار. هرگز [تصویر] ننویس.\n` +
    `- ایمنی کودک: اگر کاربر از آسیب به خود، خودکشی، خشونت خانگی یا سوءاستفاده گفت، همدلی کوتاه کن، کمک گرفتن از بزرگ‌تر/اورژانس را پیشنهاد بده، راهنمایی آسیب‌زا نده. اطلاعات شخصی حساس را نخواه.\n` +
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
      const system = systemPrompt(level, mode, data.lang, data.assistantId, !!data.image, data.learningBrief);

      const bank = bankReply(lastUser, level);
      if (bank) return { ok: true, text: sanitizeStudentMath(bank, level), provider: "bank" };

      if (isBankWorthyQuestion(lastUser)) {
        const remembered = brainLookup(lastUser);
        if (remembered) return { ok: true, text: sanitizeStudentMath(remembered, level), provider: "bank" };
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

      if (!reply) {
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

      if (isBankWorthyQuestion(lastUser) && provider && provider !== "bank") {
        try {
          brainRemember(lastUser, text);
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

      // TTS must NOT reuse Liara chat base URL — most OpenAI-compatible proxies
      // only implement /chat/completions and return 404 for /audio/speech.
      const dedicatedTtsKey =
        process.env.LIARA_TTS_API_KEY ||
        process.env.OPENAI_TTS_KEY ||
        "";
      const chatKey = process.env.LIARA_API_KEY || process.env.OPENAI_API_KEY || "";
      const key = dedicatedTtsKey || chatKey;
      if (!key) return { ok: false as const, error: "no_tts_key" };

      const dedicatedTtsBase = (
        process.env.LIARA_TTS_BASE_URL ||
        process.env.OPENAI_TTS_BASE_URL ||
        ""
      )
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/audio\/speech$/, "");

      // Prefer dedicated TTS base; else official OpenAI when using OPENAI_TTS_KEY.
      const baseUrl =
        dedicatedTtsBase ||
        (dedicatedTtsKey ? "https://api.openai.com/v1" : "") ||
        (
          process.env.LIARA_BASE_URL ||
          process.env.OPENAI_BASE_URL ||
          "https://api.openai.com/v1"
        )
          .trim()
          .replace(/\/+$/, "")
          .replace(/\/audio\/speech$/, "");

      const model = process.env.OPENAI_TTS_MODEL || "tts-1";
      const voice = process.env.OPENAI_TTS_VOICE || "onyx";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let res: Response;
      try {
        res = await fetch(`${baseUrl}/audio/speech`, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            voice,
            input: text,
            response_format: "mp3",
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        logAi("tts_http", res.status, baseUrl, errBody.slice(0, 200));
        if (baseUrl !== "https://api.openai.com/v1" && dedicatedTtsKey) {
          try {
            const res2 = await fetch("https://api.openai.com/v1/audio/speech", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${dedicatedTtsKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ model, voice, input: text, response_format: "mp3" }),
            });
            if (res2.ok) {
              const buf2 = Buffer.from(await res2.arrayBuffer());
              return { ok: true as const, audio: buf2.toString("base64"), mime: "audio/mpeg" };
            }
            logAi("tts_openai_retry", res2.status);
          } catch (e) {
            logAi("tts_openai_retry_fail", e);
          }
        }
        return { ok: false as const, error: `tts_${res.status}` };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return { ok: true as const, audio: buf.toString("base64"), mime: "audio/mpeg" };
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
