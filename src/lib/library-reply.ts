import { LESSONS, matchLesson, todayFact, localDaily, localLanguage } from "./library-data";

const GREET_WORDS = ["سلام", "درود", "hi", "hello", "hey", "صبح بخیر", "عصر بخیر", "شب بخیر"];

/** فقط سلام خالص (اختیاری + نام) — نه «سلام کوه چیه». */
export function isPureGreeting(text: string): boolean {
  const lower = text.trim().toLowerCase();
  if (!lower) return false;
  let rest = lower;
  let matched = false;
  for (const g of GREET_WORDS) {
    if (
      rest === g ||
      rest.startsWith(g + " ") ||
      rest.startsWith(g + "!") ||
      rest.startsWith(g + "؟") ||
      rest.startsWith(g + "?")
    ) {
      rest = rest.slice(g.length).replace(/^[!؟?\s،,]+/u, "").trim();
      matched = true;
      break;
    }
  }
  if (!matched) return false;
  if (!rest) return true;
  // فقط نام کوتاه بعد از سلام
  if (/^(من\s+)?[\u0600-\u06FFa-zA-Z]{2,20}(\s+(هستم|ام|عزیزم|رفیق))([!؟?\s]*)$/iu.test(rest)) return true;
  return false;
}

export function localTutorReply(opts: {
  messages: { role: "user" | "assistant"; content: string }[];
  mode: "chat" | "daily" | "lesson" | "live" | "language";
  lang?: string;
}): string {
  const lastRaw = opts.messages[opts.messages.length - 1]?.content ?? "";
  const last = lastRaw.trim();
  // ایمنی آفلاین
  if (/(خودمو?\s*بکشم|خودکشی|میخوام\s*بمیرم|کتک\s*میزنه|سوءاستفاده)/.test(last)) {
    return (
      "متأسفم که این حس را داری. تو تنها نیستی.\n\n" +
      "لطفاً با یک بزرگ‌تر مورد اعتماد حرف بزن یا با اورژانس اجتماعی (۱۲۳) تماس بگیر.\n" +
      "من جای انسان واقعی نیستم، اما برای سؤال درسی اینجام."
    );
  }
  const lastLower = last.toLowerCase();
  const prevAssistant = [...opts.messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const userTurns = opts.messages.filter((m) => m.role === "user");

  if (opts.mode === "daily") return localDaily();
  if (opts.mode === "live" || opts.mode === "language") {
    return localLanguage(opts.lang || "fa");
  }

  // سؤالات درباره خود پویا / مدل
  const metaHints = [
    "مدل",
    "هوش مصنوعی",
    "از کجا",
    "کی هستی",
    "کیستی",
    "چه مدلی",
    "api",
    "جی‌پی‌تی",
    "gpt",
    "gemini",
    "claude",
    "grok",
    "گروک",
    "ربات",
    "چت‌بات",
    "چت بات",
  ];
  if (metaHints.some((h) => lastLower.includes(h.toLowerCase()) || last.includes(h))) {
    return (
      "من پویا هستم؛ مربی آموزشی همین اپ.\n\n" +
      "جواب‌هایم از مدل هوش مصنوعی می‌آید (وقتی کلید سرویس وصل باشد). " +
      "من انسان نیستم و حافظه شخصی واقعی ندارم — روی همین گفتگو کمکت می‌کنم.\n\n" +
      "هر سؤالی داری همان را بپرس؛ مستقیم جواب می‌دهم."
    );
  }

  const lesson = matchLesson(last);
  if (lesson) {
    return lesson.answer;
  }

  if (isPureGreeting(last)) {
    return "سلام! من پویام. هر سؤالی داری بپرس — درس، تمرین، یا هر چیزی که تو ذهنت هست.";
  }

  if (userTurns.length <= 1 && last.length < 8) {
    return "بگو دقیقاً چی می‌خوای یاد بگیری یا چه سؤالی داری؟";
  }

  void prevAssistant;
  return (
    "فعلاً اتصال کامل هوش مصنوعی در دسترس نیست، ولی می‌تونم کمکت کنم.\n\n" +
    "سؤال را کمی دقیق‌تر بنویس (مثلاً «معادله درجه دو چیست؟» یا «پایتخت فرانسه کجاست؟») تا جواب بهتری بدهم."
  );
}
