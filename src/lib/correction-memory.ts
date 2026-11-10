const KEY = "pouya-verified-corrections-v1";
const MAX_CORRECTIONS = 40;

export type VerifiedCorrection = {
  id: string;
  question: string;
  originalAnswer: string;
  feedback: string;
  correctedAnswer: string;
  status: "confirmed" | "partially_confirmed";
  rationale: string;
  verifiedAt: string;
};

type Store = { corrections: VerifiedCorrection[] };

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[؟?!.,،؛:؛(){}"'«»]/g, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa");
}

function read(): Store {
  if (typeof window === "undefined") return { corrections: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { corrections: [] };
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.corrections)) return { corrections: [] };
    return {
      corrections: parsed.corrections.filter((item) =>
        item && typeof item.id === "string" &&
        typeof item.question === "string" &&
        typeof item.originalAnswer === "string" &&
        typeof item.feedback === "string" &&
        typeof item.correctedAnswer === "string" &&
        typeof item.rationale === "string" &&
        (item.status === "confirmed" || item.status === "partially_confirmed")
      ).slice(0, MAX_CORRECTIONS),
    };
  } catch {
    return { corrections: [] };
  }
}

function write(store: Store): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function saveVerifiedCorrection(input: Omit<VerifiedCorrection, "id" | "verifiedAt">): boolean {
  const questionKey = normalize(input.question);
  if (!questionKey || questionKey.length < 4 || !input.correctedAnswer.trim()) return false;
  const store = read();
  const item: VerifiedCorrection = {
    ...input,
    id: `correction-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    verifiedAt: new Date().toISOString(),
  };
  const existing = store.corrections.filter((x) => normalize(x.question) !== questionKey);
  return write({ corrections: [item, ...existing].slice(0, MAX_CORRECTIONS) });
}

export function findVerifiedCorrection(question: string): VerifiedCorrection | null {
  const key = normalize(question);
  if (!key) return null;
  return read().corrections.find((item) => normalize(item.question) === key) || null;
}

export function listVerifiedCorrections(): VerifiedCorrection[] {
  return read().corrections;
}

export function deleteVerifiedCorrection(id: string): boolean {
  const store = read();
  return write({ corrections: store.corrections.filter((item) => item.id !== id) });
}

export function clearVerifiedCorrections(): boolean {
  return write({ corrections: [] });
}

export function correctionBriefForPrompt(question: string): string {
  const item = findVerifiedCorrection(question);
  if (!item) return "";
  return [
    "اصلاح تأییدشده از بازخورد قبلی (فقط برای همین سؤالِ دقیق):",
    `سؤال: ${item.question.slice(0, 600)}`,
    `پاسخ قبلی: ${item.originalAnswer.slice(0, 500)}`,
    `بازخورد: ${item.feedback.slice(0, 600)}`,
    `پاسخ اصلاح‌شده: ${item.correctedAnswer.slice(0, 2600)}`,
    `دلیل تأیید: ${item.rationale.slice(0, 400)}`,
    "این سابقه فقط زمینهٔ کمکی برای همین سؤال است؛ شواهد تازه را مستقل بررسی کن.",
  ].join("\n").slice(0, 5200);
}
