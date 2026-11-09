export type TimedTextResponse = { response: Response; body: string };

/**
 * Keep the abort timer active until the response body has been fully read.
 * Fetch can resolve when headers arrive while response.text() is still pending.
 */
export async function fetchTextWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 5_000,
  fetcher: typeof fetch = fetch,
): Promise<TimedTextResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  try {
    const response = await fetcher(url, { ...init, signal: controller.signal });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}


/**
 * Read binary responses under the same deadline as the request.
 * Used by TTS so a stalled audio body cannot hold a serverless invocation open.
 */
export async function fetchBytesWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 8_000,
  fetcher: typeof fetch = fetch,
): Promise<{ response: Response; body: ArrayBuffer }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  try {
    const response = await fetcher(url, { ...init, signal: controller.signal });
    const body = await response.arrayBuffer();
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}
