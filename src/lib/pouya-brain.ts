/**
 * مغز یادگیرنده پویا
 * - کلید = سطح + مربی + سؤال نرمال‌شده (نه تطبیق نرم)
 * - جواب شخصی‌سازی‌شده ذخیره نمی‌شود
 */

export type BrainEntry = {
  q: string;
  a: string;
  level?: string;
  assistantId?: string;
  imageUrl?: string;
  hits: number;
  updatedAt: number;
};

const MAX = 300;
const qa = new Map<string, BrainEntry>();
const imgCache = new Map<string, string>();

export function normalizeQ(s: string): string {
  return s
    .toLowerCase()
    .replace(/\u200c/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[؟?!.،,;:«»"'\s]+/g, " ")
    .trim()
    .slice(0, 200);
}

function cacheKey(question: string, level?: string, assistantId?: string): string {
  return `${level || "teen"}|${assistantId || ""}|${normalizeQ(question)}`;
}

export function isBankWorthyQuestion(q: string): boolean {
  const t = q.trim();
  if (t.length < 4 || t.length > 180) return false;
  // دانستنی/موضوع تصادفی — هر بار تازه
  if (/(دانستی|دانستنی|واقعیت علمی|غافلگیر|موضوع آموزشی روزانه|کد:\s*\d+)/.test(t)) return false;
  // شخصی / احساسی کوتاه کش نشود
  if (/(اسمم|ناراحتم|خوشحالم|دوست دارم|دوست ندارم)/.test(t) && t.length < 40) return false;
  // قیمت لحظه‌ای ارز/طلا کش نشود
  if (/(قیمت|نرخ).*(دلار|یورو|طلا|سکه)|دلار\s*چند|یورو\s*چند/.test(t)) return false;
  return true;
}

/** سؤال درسی/آموزشی — بانک سریع اول، بعد AI و به‌روزرسانی بانک */
export function isLessonQuestion(q: string, mode?: string): boolean {
  if (mode === "lesson" || mode === "daily") return true;
  const t = q.trim();
  if (!t) return false;
  if (/(قیمت|نرخ|دلار|یورو|طلا|سکه|تتر|خبر|هوا|ساعت|تاریخ امروز)/.test(t) && !/(معادله|فرمول|درس|ریاضی)/.test(t)) {
    return false;
  }
  return (
    /(درس|مبحث|فصل|کتاب|ریاضی|فیزیک|شیمی|زیست|عربی|فارسی|انگلیسی|تاریخ|جغرافیا|دینی|کنکور|معادله|فرمول|قضیه|تعریف|حل کن|محاسبه|تمرین|ساده کن|اثبات|چرا|چطور|چگونه|توضیح|یاد بده|آموزش|نمونه سوال)/.test(
      t,
    ) || (t.length >= 20 && !/(سلام|خوبی|چه خبر|مرسی|ممنون)/.test(t))
  );
}

function looksPersonalized(answer: string): boolean {
  return /(جان|عزیزم|اسمت|برای تو|سلام\s+\S+)/.test(answer);
}

export function brainLookup(
  question: string,
  level?: string,
  assistantId?: string,
): BrainEntry | null {
  const key = cacheKey(question, level, assistantId);
  if (!key || normalizeQ(question).length < 3) return null;
  const hit = qa.get(key);
  if (hit) {
    hit.hits += 1;
    return hit;
  }
  return null;
}

export function brainRemember(
  question: string,
  answer: string,
  opts?: { level?: string; assistantId?: string; imageUrl?: string },
): void {
  if (!isBankWorthyQuestion(question)) return;
  if (!answer || answer.length < 40) return;
  if (/اتصال مدل|در دسترس نیست|دانش آماده‌ام|نمی.?توانم.*تصویر/.test(answer)) return;
  if (looksPersonalized(answer)) return;
  const key = cacheKey(question, opts?.level, opts?.assistantId);
  if (!key) return;
  qa.set(key, {
    q: question.trim().slice(0, 200),
    a: answer.slice(0, 4000),
    level: opts?.level,
    assistantId: opts?.assistantId,
    imageUrl: opts?.imageUrl,
    hits: (qa.get(key)?.hits || 0) + 1,
    updatedAt: Date.now(),
  });
  if (qa.size > MAX) {
    let oldest = "";
    let t = Infinity;
    for (const [k, v] of qa) {
      if (v.updatedAt < t) {
        t = v.updatedAt;
        oldest = k;
      }
    }
    if (oldest) qa.delete(oldest);
  }
}

export function imageCacheGet(query: string): string | undefined {
  return imgCache.get(normalizeQ(query));
}

export function imageCacheSet(query: string, url: string): void {
  const k = normalizeQ(query);
  if (k && url) imgCache.set(k, url);
  if (imgCache.size > 200) {
    const first = imgCache.keys().next().value;
    if (first) imgCache.delete(first);
  }
}
