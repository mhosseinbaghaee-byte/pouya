import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCorrectionVerdict } from "./correction-review.ts";

describe("correction verdict parser", () => {
  it("parses a valid confirmed verdict", () => {
    const verdict = parseCorrectionVerdict(JSON.stringify({
      status: "confirmed",
      correctedAnswer: "پاسخ علمی اصلاح‌شده و کامل",
      rationale: "با شواهد و منطق سازگار است",
    }));
    assert.equal(verdict?.status, "confirmed");
  });

  it("accepts JSON wrapped in a markdown code fence and short preamble", () => {
    const verdict = parseCorrectionVerdict('نتیجه:\n```json\n{"status":"rejected","correctedAnswer":"","rationale":"این اصلاح نادرست است"}\n```');
    assert.equal(verdict?.status, "rejected");
  });

  it("downgrades a confirmed verdict with an unusably short correction", () => {
    const verdict = parseCorrectionVerdict(JSON.stringify({
      status: "confirmed",
      correctedAnswer: "غلط",
      rationale: "دلیل",
    }));
    assert.equal(verdict?.status, "uncertain");
    assert.equal(verdict?.correctedAnswer, "");
  });

  it("rejects malformed JSON and unknown statuses", () => {
    assert.equal(parseCorrectionVerdict("{broken"), null);
    assert.equal(parseCorrectionVerdict(JSON.stringify({
      status: "maybe",
      correctedAnswer: "متن کافی برای پاسخ",
      rationale: "دلیل",
    })), null);
  });

  it("returns null when required verdict fields are missing", () => {
    assert.equal(parseCorrectionVerdict(JSON.stringify({
      status: "confirmed",
      correctedAnswer: "متن اصلاحی کامل",
    })), null);
  });
});
