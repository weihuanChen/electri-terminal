const runTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const tokenCountFormatter = new Intl.NumberFormat("en-US");

export function formatPromptLabRunTime(timestamp?: number) {
  if (!timestamp) return "—";
  return runTimeFormatter.format(timestamp);
}

export function formatPromptLabTokenCount(tokenCount: number) {
  return tokenCountFormatter.format(tokenCount);
}
