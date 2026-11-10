import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  correctionBriefForPrompt,
  deleteVerifiedCorrection,
  findVerifiedCorrection,
  listVerifiedCorrections,
  saveVerifiedCorrection,
} from "./correction-memory.ts";

const store = new Map<string, string>();
let failWrites = false;
(globalThis as any).window = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { if (failWrites) throw new Error("quota exceeded"); store.set(key, value); },
};

describe("verified correction memory", () => {
  beforeEach(() => { store.clear(); failWrites = false; });

  it("persists an approved correction and retrieves an exact normalized repeat", () => {
    assert.equal(saveVerifiedCorrection({
      question: "يك اتم چیست؟",
      originalAnswer: "پاسخ قبلی نادرست",
      feedback: "توضیح اصلاحی",
      correctedAnswer: "اتم از هسته و الکترون‌ها تشکیل شده است.",
      status: "confirmed",
      rationale: "بازبینی علمی نشان داد پاسخ کاربر درست است.",
    }), true);
    assert.equal(findVerifiedCorrection("یک اتم چیست")?.status, "confirmed");
  });

  it("does not apply a correction to a similar but different question", () => {
    saveVerifiedCorrection({
      question: "اتم چیست؟",
      originalAnswer: "الف",
      feedback: "ب",
      correctedAnswer: "ج",
      status: "confirmed",
      rationale: "دلیل",
    });
    assert.equal(findVerifiedCorrection("اتم چگونه شکافته می‌شود؟"), null);
  });

  it("does not create a prompt brief for unrelated questions", () => {
    saveVerifiedCorrection({
      question: "فتوسنتز چیست؟",
      originalAnswer: "الف",
      feedback: "ب",
      correctedAnswer: "ج",
      status: "partially_confirmed",
      rationale: "دلیل",
    });
    assert.equal(correctionBriefForPrompt("تنفس سلولی چیست؟"), "");
    assert.match(correctionBriefForPrompt("فتوسنتز چیست"), /پاسخ اصلاح‌شده/);
  });

  it("keeps the assembled correction brief within the server validator limit", () => {
    saveVerifiedCorrection({
      question: "سؤال بسیار طولانی ".repeat(120),
      originalAnswer: "پاسخ قبلی ".repeat(300),
      feedback: "بازخورد ".repeat(300),
      correctedAnswer: "پاسخ اصلاح‌شده ".repeat(500),
      status: "confirmed",
      rationale: "دلیل ".repeat(300),
    });
    const brief = correctionBriefForPrompt("سؤال بسیار طولانی ".repeat(120));
    assert.ok(brief.length <= 5200);
    assert.match(brief, /پاسخ اصلاح‌شده/);
  });

  it("replaces an older correction for the same normalized question", () => {
    const input = {
      question: "گرانش چیست؟",
      originalAnswer: "الف",
      feedback: "ب",
      correctedAnswer: "ج",
      status: "confirmed" as const,
      rationale: "دلیل",
    };
    saveVerifiedCorrection(input);
    saveVerifiedCorrection({ ...input, correctedAnswer: "د" });
    assert.equal(listVerifiedCorrections().length, 1);
    assert.equal(findVerifiedCorrection(input.question)?.correctedAnswer, "د");
  });

  it("allows a correction to be deleted", () => {
    saveVerifiedCorrection({
      question: "نور چیست؟",
      originalAnswer: "الف",
      feedback: "ب",
      correctedAnswer: "ج",
      status: "confirmed",
      rationale: "دلیل",
    });
    const item = listVerifiedCorrections()[0];
    assert.equal(deleteVerifiedCorrection(item.id), true);
    assert.equal(findVerifiedCorrection("نور چیست؟"), null);
  });

  it("handles malformed storage without crashing", () => {
    store.set("pouya-verified-corrections-v1", "{bad json");
    assert.deepEqual(listVerifiedCorrections(), []);
  });

  it("ignores incomplete records that could break prompt construction", () => {
    store.set("pouya-verified-corrections-v1", JSON.stringify({
      corrections: [{
        id: "bad",
        question: "سؤال معتبر",
        correctedAnswer: "پاسخ",
        status: "confirmed",
      }],
    }));
    assert.deepEqual(listVerifiedCorrections(), []);
  });

  it("does not claim a save succeeded when browser storage is unavailable", () => {
    failWrites = true;
    assert.equal(saveVerifiedCorrection({
      question: "آب چیست؟",
      originalAnswer: "الف",
      feedback: "ب",
      correctedAnswer: "پاسخ اصلاحی معتبر",
      status: "confirmed",
      rationale: "دلیل",
    }), false);
  });

  it("keeps the correction store bounded to forty entries", () => {
    for (let i = 0; i < 45; i++) {
      saveVerifiedCorrection({
        question: `موضوع شماره ${i} چیست؟`,
        originalAnswer: "الف",
        feedback: "ب",
        correctedAnswer: "پاسخ اصلاحی معتبر",
        status: "confirmed",
        rationale: "دلیل",
      });
    }
    assert.equal(listVerifiedCorrections().length, 40);
  });
});
