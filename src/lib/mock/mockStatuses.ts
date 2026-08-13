import { StatusDefinition } from "@/types";

export const mockStatuses: StatusDefinition[] = [
  { id: "s-1", label: "Unassigned", statusKey: "unassigned", requiresReason: false, displayOrder: 1, isActive: true },
  { id: "s-2", label: "Assigned", statusKey: "assigned", requiresReason: false, displayOrder: 2, isActive: true },
  { id: "s-3", label: "Awaiting response", statusKey: "awaiting_response", requiresReason: false, displayOrder: 3, isActive: true },
  { id: "s-4", label: "Interview scheduled", statusKey: "interview_scheduled", requiresReason: false, displayOrder: 4, isActive: true },
  { id: "s-5", label: "Accepted", statusKey: "accepted", requiresReason: true, displayOrder: 5, isActive: true },
  { id: "s-6", label: "Rejected", statusKey: "rejected", requiresReason: true, displayOrder: 6, isActive: true },
  { id: "s-7", label: "Into consideration", statusKey: "into_consideration", requiresReason: true, displayOrder: 7, isActive: true },
  { id: "s-8", label: "Missed interview", statusKey: "missed_interview", requiresReason: true, displayOrder: 8, isActive: true },
  { id: "s-9", label: "Didn't join", statusKey: "didnt_join", requiresReason: true, displayOrder: 9, isActive: true },
];
