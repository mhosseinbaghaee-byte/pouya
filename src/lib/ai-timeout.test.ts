import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchBytesWithTimeout, fetchTextWithTimeout } from "./ai-timeout";

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
test("isolates timeouts across 100 concurrent requests", async () => {
  const count = 100;
  const slowCount = 20;
  const results = await Promise.allSettled(
    Array.from({ length: count }, (_, index) => {
      const isSlow = index >= count - slowCount;
      const fetcher: typeof fetch = async (_input, init) => {
        if (!isSlow) return new Response("ok");
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("The operation was aborted", "AbortError")),
            { once: true },
          );
        });
      };
      return fetchTextWithTimeout("https://example.test", {}, isSlow ? 10 : 100, fetcher);
    }),
  );

  assert.equal(results.filter((result) => result.status === "fulfilled").length, count - slowCount);
  assert.equal(results.filter((result) => result.status === "rejected").length, slowCount);
});


test("binary response timeout remains active while audio bytes are being read", async () => {
  let aborted = false;
  const fetcher: typeof fetch = async (_input, init) => {
    const response = new Response();
    response.arrayBuffer = () =>
      new Promise<ArrayBuffer>((_resolve, reject) => {
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
    fetchBytesWithTimeout("https://example.test/audio", {}, 20, fetcher),
    { name: "AbortError" },
  );
  assert.equal(aborted, true);
});

test("binary response helper returns bytes and response metadata", async () => {
  const fetcher: typeof fetch = async () =>
    new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": "audio/mpeg" },
    });

  const result = await fetchBytesWithTimeout(
    "https://example.test/audio",
    {},
    100,
    fetcher,
  );
  assert.equal(result.response.headers.get("content-type"), "audio/mpeg");
  assert.deepEqual([...new Uint8Array(result.body)], [1, 2, 3]);
});
