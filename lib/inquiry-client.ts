import type { PublicInquiryPayload } from "@/lib/inquiry";

type InquiryApiError = {
  error?: string;
};

export async function submitPublicInquiry(payload: PublicInquiryPayload | FormData) {
  const isFormData = payload instanceof FormData;
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: isFormData
      ? undefined
      : {
          "Content-Type": "application/json",
        },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  let errorMessage = "Failed to submit inquiry. Please try again.";
  try {
    const data = (await response.json()) as InquiryApiError;
    if (typeof data.error === "string" && data.error.trim().length > 0) {
      errorMessage = data.error;
    }
  } catch {
    // Keep the fallback message when response is not JSON.
  }

  throw new Error(errorMessage);
}
