import assert from "node:assert/strict";
import test from "node:test";
import { visualQueryWithContext } from "./visual-context.ts";

test("carries chemistry context into a structure follow-up", () => {
  const query = visualQueryWithContext("ساختارش رو نشون بده", ["پیوند یونی چیست؟"]);
  assert.match(query, /پیوند یونی/);
});

test("carries biology context through chained visual follow-ups", () => {
  const query = visualQueryWithContext("از نزدیک‌تر نشون بده", ["قلب چطور کار می‌کند؟", "شکلش رو نشون بده"]);
  assert.match(query, /قلب چطور کار میکند/);
});

test("carries math context into a graph follow-up", () => {
  const query = visualQueryWithContext("با نمودار توضیح بده", ["مشتق تابع چیست؟"]);
  assert.match(query, /مشتق تابع/);
});

test("keeps a substantive graph question as the subject of a later follow-up", () => {
  const query = visualQueryWithContext("شکلش رو نشون بده", ["نمودار مشتق چیست؟"]);
  assert.match(query, /نمودار مشتق چیست/);
});

test("keeps a substantive structure question as the subject of a later follow-up", () => {
  const query = visualQueryWithContext("از نزدیک‌تر نشون بده", ["ساختار قلب چیست؟"]);
  assert.match(query, /ساختار قلب چیست/);
});

test("does not carry context into a new explicit subject", () => {
  const query = visualQueryWithContext("ساختار DNA رو نشون بده", ["ساختار قلب چیست؟"]);
  assert.equal(query, "ساختار DNA رو نشون بده");
});

test("does not carry context into a new non-visual question", () => {
  const query = visualQueryWithContext("پایتخت فرانسه چیست؟", ["ایتالیا کجاست؟"]);
  assert.equal(query, "پایتخت فرانسه چیست؟");
});