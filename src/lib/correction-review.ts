import { z } from "zod";

export const CorrectionVerdictSchema = z.object({
  status: z.enum(["confirmed", "partially_confirmed", "rejected", "uncertain"]),
  correctedAnswer: z.string().max(8000),
  rationale: z.string().max(1600),
});

export type CorrectionVerdict = z.infer<typeof CorrectionVerdictSchema>;

/** Parse model output defensively; malformed or incomplete output is never trusted. */
export function parseCorrectionVerdict(raw: string): CorrectionVerdict | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  let decoded: unknown;
  try {
    decoded = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
  const parsed = CorrectionVerdictSchema.safeParse(decoded);
  if (!parsed.success) return null;

  const verdict = parsed.data;
  if (
    (verdict.status === "confirmed" || verdict.status === "partially_confirmed") &&
    verdict.correctedAnswer.trim().length < 8
  ) {
    return {
      status: "uncertain",
      correctedAnswer: "",
      rationale: "پاسخ اصلاح‌شده برای ذخیره کافی نبود.",
    };
  }
  return verdict;
}
