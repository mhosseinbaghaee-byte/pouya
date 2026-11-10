/**
 * Preserve the active educational subject for visual follow-ups.
 */
const FOLLOW_UP_VISUAL = /(نشان\s*بده|نشون\s*بده|نمایش\s*بده|بکش|رسم\s*کن|از\s*نزدیک|نزدیک(?:تر)?|بزرگ(?:تر)?|واضح(?:تر)?|جزئیات|زوم|بزرگنمایی|همین|این\s*(?:شکل|تصویر|نمودار)|همون\s*(?:شکل|تصویر|نمودار)|با\s+نمودار\s+(?:توضیح|نشون|نشان|بکش|رسم|نمایش))/i;
const EXPLICIT_SUBJECT = /(?:ساختار|نمودار|شکل|مدل|تصویر|عکس)\s+(?!ش(?:\s|$)|آن|این|همان|همون|اون)([\p{L}\p{N}]{2,})/u;
const GENERIC_VISUAL_REQUEST = /^(?:با\s+)?(?:نمودار|شکل|تصویر)(?:\s+(?:توضیح|نشون|نشان|بکش|رسم|نمایش|برام|رو|را))/u;
const NEW_TOPIC_CUE = /(اما|ولی|حالا|موضوع\s*دیگه|سوال\s*بعدی|درباره\s+.{2,}|در\sمورد\s+.{2,})/i;

function normalize(s: string): string {
  return s.toLowerCase().replace(/\u200c/g, "").replace(/[ي]/g, "ی").replace(/[ك]/g, "ک").replace(/\s+/g, " ").trim();
}

function isExplicitSubject(text: string): boolean {
  return EXPLICIT_SUBJECT.test(text) && !GENERIC_VISUAL_REQUEST.test(text);
}

function isVisualFollowUp(text: string): boolean {
  return FOLLOW_UP_VISUAL.test(text) && !isExplicitSubject(text);
}

export function visualQueryWithContext(current: string, previousUserMessages: string[] = [], currentHasSpecificMatch = false): string {
  const now = normalize(current);
  if (!now || currentHasSpecificMatch || isExplicitSubject(now) || !isVisualFollowUp(now) || NEW_TOPIC_CUE.test(now)) return current;
  const priorTopic = [...previousUserMessages].reverse().map(normalize).find((message) => message.length >= 3 && !isVisualFollowUp(message) && !NEW_TOPIC_CUE.test(message));
  return priorTopic ? current + "\n" + priorTopic : current;
}