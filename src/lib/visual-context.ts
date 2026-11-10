/**
 * Keep educational subject context for visual follow-ups across every subject.
 * A new, self-contained topic always takes precedence over older context.
 */
const FOLLOW_UP_VISUAL = /(نشان\s*بده|نشون\s*بده|نمایش\s*بده|بکش|رسم\s*کن|تصویر(?:ش)?|عکس(?:ش)?|شکل(?:ش)?|نمودار(?:ش)?|ساختار(?:ش)?|مدل(?:ش)?|از\s*نزدیک|نزدیک(?:تر)?|بزرگ(?:تر)?|واضح(?:تر)?|جزئیات|زوم|بزرگنمایی|همین|این\s*(?:شکل|تصویر|نمودار)|همون\s*(?:شکل|تصویر|نمودار))/i;
const EXPLICIT_SUBJECT = /(?:ساختار|نمودار|شکل|مدل|تصویر|عکس)\s+(?!ش(?:\s|$)|آن|این|همان|همون|اون)([\p{L}\p{N}]{2,})/u;
const NEW_TOPIC_CUE = /(\b(?:اما|ولی|حالا|موضوع\s*دیگه|سوال\s*بعدی)\b|درباره\s+.{2,}|در\sمورد\s+.{2,})/i;

function normalize(s: string): string {
  return s.toLowerCase().replace(/\u200c/g, "").replace(/[ي]/g, "ی").replace(/[ك]/g, "ک").replace(/\s+/g, " ").trim();
}

export function visualQueryWithContext(
  current: string,
  previousUserMessages: string[] = [],
  currentHasSpecificMatch = false,
): string {
  const now = normalize(current);
  if (!now || currentHasSpecificMatch || EXPLICIT_SUBJECT.test(now) || !FOLLOW_UP_VISUAL.test(now) || NEW_TOPIC_CUE.test(now)) return current;

  // Skip earlier follow-ups so chained requests still resolve to the original subject.
  const priorTopic = [...previousUserMessages]
    .reverse()
    .map((message) => message.trim())
    .find((message) => {
      const normalized = normalize(message);
      return normalized.length >= 3 && !FOLLOW_UP_VISUAL.test(normalized) && !NEW_TOPIC_CUE.test(normalized);
    });

  return priorTopic ? \`\${current}\n\${priorTopic}\` : current;
}
