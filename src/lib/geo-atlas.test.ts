import assert from "node:assert/strict";
import test from "node:test";
import { geoAtlasQueryWithContext, matchGeoAtlas } from "./geo-atlas.ts";

test("a zoom follow-up keeps the most recent country in context", () => {
  const query = geoAtlasQueryWithContext("نقشه نزدیکتر نداری ببینم", "ایتالیا کجاست");
  assert.match(query, /ایتالیا/);
  assert.equal(matchGeoAtlas(query)?.id, "pg-093");
});

test("a new unrelated question does not inherit the previous country", () => {
  const query = geoAtlasQueryWithContext("پایتخت فرانسه چیست؟", "ایتالیا کجاست");
  assert.equal(query, "پایتخت فرانسه چیست؟");
  assert.equal(matchGeoAtlas(query)?.id, "pg-097");
});

test("the Arabian Peninsula query resolves to its own atlas entry", () => {
  assert.equal(
    matchGeoAtlas("نقشه طبیعی شبه جزیره عربستان و کرانه دریای عرب")?.id,
    "pg-100",
  );
});
