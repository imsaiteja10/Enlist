export function statusTone(statusKey: string): "neutral" | "progress" | "positive" | "negative" {
  if (statusKey === "accepted") return "positive";
  if (["rejected", "missed_interview", "didnt_join"].includes(statusKey)) return "negative";
  if (["assigned", "awaiting_response", "interview_scheduled", "into_consideration"].includes(statusKey)) return "progress";
  return "neutral";
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
