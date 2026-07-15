import { describe, expect, it, vi } from "vitest";
import {
  fetchWithProviderRetry,
  isRetryableProviderError,
  isRetryableProviderStatus,
  LLM_GENERATION_TIMEOUT_MS,
} from "./llm-provider-retry";

describe("LLM provider retry policy", () => {
  it("uses a 240 second generation timeout", () => {
    expect(LLM_GENERATION_TIMEOUT_MS).toBe(240_000);
  });

  it("retries one transient HTTP failure", async () => {
    const request = vi
      .fn<(signal: AbortSignal) => Promise<Response>>()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    const response = await fetchWithProviderRetry(request, {
      retryDelayMs: 0,
    });

    expect(response.status).toBe(200);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-transient HTTP failure", async () => {
    const request = vi
      .fn<(signal: AbortSignal) => Promise<Response>>()
      .mockResolvedValue(new Response("unauthorized", { status: 401 }));

    const response = await fetchWithProviderRetry(request, {
      retryDelayMs: 0,
    });

    expect(response.status).toBe(401);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("retries a timeout once and then returns the next response", async () => {
    const timeout = new Error("The operation was aborted due to timeout");
    timeout.name = "TimeoutError";
    const request = vi
      .fn<(signal: AbortSignal) => Promise<Response>>()
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    const response = await fetchWithProviderRetry(request, {
      retryDelayMs: 0,
    });

    expect(response.ok).toBe(true);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("classifies only transient responses and request failures as retryable", () => {
    expect(isRetryableProviderStatus(408)).toBe(true);
    expect(isRetryableProviderStatus(429)).toBe(true);
    expect(isRetryableProviderStatus(500)).toBe(true);
    expect(isRetryableProviderStatus(400)).toBe(false);
    expect(isRetryableProviderError(new TypeError("fetch failed"))).toBe(true);
    expect(isRetryableProviderError(new Error("invalid payload"))).toBe(false);
  });
});
