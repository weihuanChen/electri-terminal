# Gemini Batch API boundary for Prompt Lab

## Decision

Gemini Batch is a separate asynchronous execution mode. It does not replace the
interactive Prompt Lab comparison flow, which expects individual result cards to
start updating immediately.

Use interactive `generateContent` for manual model comparison. Use Gemini Batch
only for non-urgent evaluations or future bulk i18n draft generation.

## API flow

1. Build one normal Gemini `GenerateContentRequest` per item, including
   `systemInstruction`, `contents`, generation parameters, and
   `generationConfig.responseJsonSchema`.
2. For batches below 20 MB, submit inline requests to:
   `POST /v1beta/models/{model}:batchGenerateContent`.
3. Persist the returned batch resource `name` before returning from the Convex
   action. Batch creation is not idempotent, so the same local job must never be
   submitted twice.
4. Poll `GET /v1beta/{batchName}` from a scheduled Convex action. Do not keep a
   Node Action open while waiting.
5. Treat `JOB_STATE_SUCCEEDED`, `JOB_STATE_FAILED`, `JOB_STATE_CANCELLED`, and
   `JOB_STATE_EXPIRED` as terminal states. Jobs pending or running for more than
   48 hours may expire.
6. For inline input, map `dest.inlinedResponses` back to Lab results using the
   request metadata key. Each item can independently contain a response or an
   error.
7. For larger batches, upload JSONL through the Gemini File API and process the
   returned JSONL output file instead.

## Prompt Lab data required before enabling Batch

A future Batch implementation should add a dedicated `llmGeminiBatchJobs` table
instead of overloading `llmLabRuns`. It must store:

- local idempotency key and immutable request hash;
- Gemini batch resource name and model ID;
- `pending | running | succeeded | failed | cancelled | expired` state;
- Lab result IDs keyed in the submitted metadata;
- submitted, last-polled, completed, and expiry timestamps;
- provider error and batch statistics.

Only Gemini providers may enter this path. Interactive retry remains a new
single request; batch retry must create a new job only after an explicit admin
action.

## Current implementation boundary

`buildGeminiGenerateContentRequest` produces the same structured request for
interactive and Batch execution. `buildGeminiInlineBatchEntry` adds the stable
metadata key required to correlate an inline response. Batch submission and
polling are intentionally not connected to the real-time Run button until the
job table and idempotency guard exist.
