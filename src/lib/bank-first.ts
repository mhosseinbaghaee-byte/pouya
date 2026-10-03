import { todayFact } from "./library-data";
import { localTutorReply, isPureGreeting } from "./library-reply";
import { looksVisual } from "./wiki-image";

type Msg = { role: "user" | "assistant"; content: string };

const ACK = ["خوبی", "چطوری", "چه خبر", "مرسی", "ممنون", "باشه", "اوکی", "ok", "okay", "آره", "بله", "نه"];

/**
 * بانک فقط برای موارد خیلی کوتاه (سلام خالص / تأیید) یا دانستی روز.
 * سؤال واقعی (حتی با «سلام» در اول) → null تا مدل AI جواب بدهد.
 */
export function bankReply(opts: {
  messages: Msg[];
  mode: "chat" | "daily" | "lesson" | "live" | "language";
  lang?: string;
}): string | null {
  const { messages, mode } = opts;
  if (mode === "live" || mode === "language" || mode === "lesson" || mode === "daily") return null;

  const last = (messages[messages.length - 1]?.content ?? "").trim();
  if (!last || last.length > 80) return null;

  if (looksVisual(last)) return null;

  if (last.includes("دانستی") || last.includes("غافلگیر")) return todayFact();

  const lower = last.toLowerCase();
  const isAck = ACK.some((a) => lower === a || lower === a + "?" || lower === a + "؟");

  if (isPureGreeting(last) || isAck) {
    return localTutorReply({ messages, mode: "chat", lang: opts.lang });
  }

  // بقیه → مدل (Gemini / لیارا)
  return null;
}
