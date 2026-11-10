import assert from "node:assert/strict";
import test from "node:test";
import { ACADEMIC_REASONING_RULES } from "./academic-reasoning.ts";

test("academic protocol requires direct answers before generic explanations", () => {
  assert.match(ACADEMIC_REASONING_RULES, /جواب.*ابتدای پاسخ/);
  assert.match(ACADEMIC_REASONING_RULES, /به تعریف کلی مبحث اکتفا نکن/);
});

test("math, physics, and chemistry have domain-specific verification rules", () => {
  assert.match(ACADEMIC_REASONING_RULES, /قواعد زنجیره‌ای، علامت‌ها، دامنه/);
  assert.match(ACADEMIC_REASONING_RULES, /سازگاری ابعادی/);
  assert.match(ACADEMIC_REASONING_RULES, /موازنه واکنش/);
});

test("protocol requires uncertainty handling and independent verification", () => {
  assert.match(ACADEMIC_REASONING_RULES, /روش مستقل/);
  assert.match(ACADEMIC_REASONING_RULES, /حدس را قطعی جلوه نده/);
  assert.match(ACADEMIC_REASONING_RULES, /فقط یک سؤال روشن‌کننده/);
});

test("protocol preserves scientific accuracy while adapting teaching level", () => {
  assert.match(ACADEMIC_REASONING_RULES, /سطح بیان را با سن دانش‌آموز تنظیم کن/);
  assert.match(ACADEMIC_REASONING_RULES, /ساده‌سازی مجاز است؛ تغییر یا حذف حقیقت علمی مجاز نیست/);
});
