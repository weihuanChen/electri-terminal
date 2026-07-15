export const LLM_GENERATION_TIMEOUT_MS = 240_000;
export const LLM_GENERATION_MAX_ATTEMPTS = 2;

const DEFAULT_RETRY_DELAY_MS = 1_000;

export function isRetryableProviderStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

export function isRetryableProviderError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "AbortError" ||
    error.name === "TimeoutError" ||
    error.name === "TypeError" ||
    /aborted|network|socket|timeout|timed out|fetch failed/i.test(error.message)
  );
}

type ProviderFetchOptions = {
  attempts?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
};

export async function fetchWithProviderRetry(
  request: (signal: AbortSignal) => Promise<Response>,
  options: ProviderFetchOptions = {},
) {
  const attempts = options.attempts ?? LLM_GENERATION_MAX_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const timeoutMs = options.timeoutMs ?? LLM_GENERATION_TIMEOUT_MS;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error("provider_attempt_count_invalid");
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await request(AbortSignal.timeout(timeoutMs));
      if (
        attempt < attempts &&
        !response.ok &&
        isRetryableProviderStatus(response.status)
      ) {
        await response.body?.cancel().catch(() => undefined);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt >= attempts || !isRetryableProviderError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error("provider_retry_exhausted");
}
