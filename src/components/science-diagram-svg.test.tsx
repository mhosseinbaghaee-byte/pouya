import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import { ScienceDiagramSvg } from "./science-diagram-svg";

function render(id: string) {
  return renderToStaticMarkup(createElement(ScienceDiagramSvg, { id }));
}

test("pH diagram marks 1–6 acidic, 7 neutral and 8–14 basic", () => {
  const markup = render("ph-scale");
  const fills = [...markup.matchAll(/<rect[^>]*fill="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(fills.length, 14);
  assert.deepEqual(fills.slice(0, 6), Array(6).fill("#fca5a5"));
  assert.equal(fills[6], "#86efac");
  assert.deepEqual(fills.slice(7), Array(7).fill("#93c5fd"));
});

test("carbon dioxide diagram draws two bonds on each side of carbon", () => {
  const markup = render("co2-molecule");
  assert.equal((markup.match(/<line /g) ?? []).length, 4);
  assert.match(markup, /O = C = O/);
});

test("reflection diagram has a horizontal mirror and vertical normal", () => {
  const markup = render("light-reflection");
  assert.match(markup, /x1="55" y1="150" x2="305" y2="150"/);
  assert.match(markup, /x1="180" y1="48" x2="180" y2="194"/);
});

test("atom diagram labels its four-nucleon nucleus as helium-4", () => {
  const markup = render("atom-structure");
  assert.match(markup, /هلیم-۴/);
  assert.match(markup, /۲ پروتون + ۲ نوترون/);
});
