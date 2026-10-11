import { getSql } from "./db";

/**
 * مغز یادگیرنده پویا
 * - کلید = سطح + مربی + سؤال نرمال‌شده
 * - حافظه محلی + جدول مشترک DB برای کاربران بعدی
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
  if (/(دانستی|دانستنی|واقعیت علمی|غافلگیر|موضوع آموزشی روزانه|کد:\s*\d+)/.test(t)) return false;
  if (/(اسمم|ناراحتم|خوشحالم|دوست دارم|دوست ندارم)/.test(t) && t.length < 40) return false;
  if (/(قیمت|نرخ).*(دلار|یورو|طلا|سکه)|دلار\s*چند|یورو\s*چند/.test(t)) return false;
  return true;
}

export function isLessonQuestion(q: string, mode?: string): boolean {
  if (mode === "lesson" || mode === "daily") return true;
  const t = q.trim();
  if (!t) return false;
  if (/(دانستی|دانستنی|واقعیت علمی|غافلگیر)/.test(t)) return false;
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

/** بازیابی از حافظه مشترک بین کاربران */
export async function brainLookupShared(
  question: string,
  level?: string,
  assistantId?: string,
): Promise<BrainEntry | null> {
  const local = brainLookup(question, level, assistantId);
  if (local) return local;
  const key = cacheKey(question, level, assistantId);
  if (normalizeQ(question).length < 3) return null;
  try {
    const sql = await getSql();
    const rows = await sql.query<{
      question: string;
      answer: string;
      level: string | null;
      hits: number;
    }>("SELECT question, answer, level, hits FROM pouya_shared_brain WHERE q_key = $1 LIMIT 1", [key]);
    const row = rows[0];
    if (!row?.answer) return null;
    try {
      await sql.query("UPDATE pouya_shared_brain SET hits = hits + 1, updated_at = NOW() WHERE q_key = $1", [key]);
    } catch {
      /* ignore */
    }
    brainRemember(question, row.answer, { level, assistantId });
    return {
      q: row.question,
      a: row.answer,
      level: row.level || undefined,
      hits: Number(row.hits) + 1,
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/** ذخیره دانش آموزشی برای کاربران بعدی */
export async function brainRememberShared(
  question: string,
  answer: string,
  opts?: { level?: string; assistantId?: string; imageUrl?: string },
): Promise<void> {
  brainRemember(question, answer, opts);
  if (!isBankWorthyQuestion(question)) return;
  if (!answer || answer.length < 40) return;
  if (/اتصال مدل|در دسترس نیست|دانش آماده‌ام|نمی.?توانم.*تصویر/.test(answer)) return;
  const key = cacheKey(question, opts?.level, opts?.assistantId);
  try {
    const sql = await getSql();
    await sql.query(
      `INSERT INTO pouya_shared_brain (q_key, question, answer, level, hits, updated_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (q_key) DO UPDATE SET
         answer = EXCLUDED.answer,
         hits = pouya_shared_brain.hits + 1,
         updated_at = NOW()`,
      [key, question.trim().slice(0, 200), answer.slice(0, 4000), opts?.level || null],
    );
  } catch {
    /* جدول migrate نشده یا DB در دسترس نیست */
  }
}
