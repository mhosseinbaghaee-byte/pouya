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
  if (/^(پویا|pouya|جان|عزیزم|رفیق)([!؟?\s]*)$/iu.test(rest)) return true;
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

  if (opts.mode === "daily") return localDaily(opts.messages);
  if (opts.mode === "live" || opts.mode === "language") {
    return localLanguage(opts.lang || "fa", last, opts.messages.length);
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

  const ack = ["خوبی", "خوبی؟", "چطوری", "چطوری؟", "چه خبر", "چه خبر؟", "مرسی", "ممنون", "باشه", "اوکی", "ok", "okay", "آره", "بله", "نه"];
  const isAck = ack.some((a) => lastLower === a || lastLower === a + "?" || lastLower === a + "؟");

  if (isPureGreeting(last)) {
    if (userTurns.length <= 1) {
      return `سلام! من پویام. هر سؤالی داری مستقیم بپرس — مثلاً «کوه چیست؟» یا «گرانش یعنی چه؟»`;
    }
    return `سلام دوباره. موضوع را بگو تا ادامه بدهیم.`;
  }

  if (isAck) {
    return `خوبم، ممنون. آماده‌ام.\n\nسؤالت را مستقیم بنویس — مثلاً «چرخ چیست؟» یا «گرانش یعنی چه؟»`;
  }

  // فقط وقتی مدل قطع است — پشتیبانی بانکی
  const lesson = matchLesson(last);
  if (lesson) {
    const replyText = `${lesson.title}\n\n${lesson.body}`;
    if (replyText === prevAssistant) {
      return `همین موضوع را یک‌بار گفتم. می‌خواهی عمیق‌ترش کنم، مثال روزمره بزنم، یا برویم سراغ موضوع بعدی؟`;
    }
    return replyText;
  }

  if (opts.mode === "lesson") {
    const pick = LESSONS[Math.floor(Date.now() / 86_400_000) % LESSONS.length];
    return `${pick.title}\n\n${pick.body}`;
  }

  if (last.includes("دانستی") || last.includes("واقعیت علمی") || /دانستنی/.test(last)) {
    return todayFact();
  }

  if (last.length >= 2) {
    return (
      `سؤالت را گرفتم: «${last.slice(0, 120)}».\n\n` +
      `الان اتصال مدل کامل در دسترس نیست؛ با دانش آماده‌ام جواب می‌دهم.\n` +
      `اگر منظورت تعریف یا توضیح همان موضوع است، یک‌بار دیگر با جمله کامل بپرس.`
    );
  }

  return `من پویام. موضوع را مشخص بپرس — مثلاً «چرخ چیست؟» یا «گرانش یعنی چه؟»\nاگر میکروفون را بزنی با صدا هم حرف می‌زنیم.`;
}
