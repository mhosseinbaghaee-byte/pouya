import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchTextWithTimeout } from "./ai-timeout";

test("fetch timeout remains active while the response body is being read", async () => {
  let aborted = false;
  const fetcher: typeof fetch = async (_input, init) => {
    const response = new Response();
    response.text = () =>
      new Promise<string>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => {
            aborted = true;
            reject(new DOMException("The operation was aborted", "AbortError"));
          },
          { once: true },
        );
      });
    return response;
  };

  await assert.rejects(
    fetchTextWithTimeout("https://example.test", {}, 20, fetcher),
    { name: "AbortError" },
  );
  assert.equal(aborted, true);
});

test("fetch timeout aborts a request that never receives headers", async () => {
  let aborted = false;
  const fetcher: typeof fetch = (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener(
        "abort",
        () => {
          aborted = true;
          reject(new DOMException("The operation was aborted", "AbortError"));
        },
        { once: true },
      );
    });

  await assert.rejects(
    fetchTextWithTimeout("https://example.test", {}, 20, fetcher),
    { name: "AbortError" },
  );
  assert.equal(aborted, true);
});
