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
