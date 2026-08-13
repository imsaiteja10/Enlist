import { Candidate } from "@/types";

const names: [string, string][] = [
  ["Aditya", "Kulkarni"], ["Sneha", "Patil"], ["Vikram", "Reddy"], ["Ishita", "Sharma"],
  ["Rahul", "Verma"], ["Nandini", "Gowda"], ["Yash", "Malhotra"], ["Divya", "Menon"],
  ["Karan", "Chatterjee"], ["Pooja", "Bhatt"], ["Siddharth", "Rao"], ["Tanvi", "Joshi"],
  ["Aman", "Kapoor"], ["Riya", "Desai"], ["Harsh", "Trivedi"], ["Neha", "Pillai"],
  ["Gaurav", "Bansal"], ["Sanya", "Khanna"], ["Devansh", "Choudhary"], ["Kavya", "Iyengar"],
];

const statusCycle = [
  "unassigned", "assigned", "awaiting_response", "interview_scheduled",
  "accepted", "rejected", "into_consideration", "missed_interview", "didnt_join",
];

const assignees = ["u-1", "u-2", "u-3", "u-4"];

function buildCandidates(batchId: string, count: number, startIdx: number): Candidate[] {
  return Array.from({ length: count }).map((_, i) => {
    const [first, last] = names[(startIdx + i) % names.length];
    const statusKey = statusCycle[(startIdx + i) % statusCycle.length];
    const isUnassigned = statusKey === "unassigned";
    const needsReason = ["accepted", "rejected", "into_consideration", "missed_interview", "didnt_join"].includes(statusKey);
    return {
      id: `${batchId}-c-${i + 1}`,
      batchId,
      assignedTo: isUnassigned ? null : assignees[(startIdx + i) % assignees.length],
      statusKey,
      fields: {
        first_name: first,
        last_name: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        mobile: `98${String(10000000 + (startIdx + i) * 137).slice(0, 8)}`,
        college: ["NIT Trichy", "BITS Pilani", "VIT Vellore", "IIIT Hyderabad", "PES University"][(startIdx + i) % 5],
        course: ["Computer Science", "Electronics", "Mechanical", "Information Tech"][(startIdx + i) % 4],
        city: ["Bengaluru", "Hyderabad", "Chennai", "Pune", "Mumbai"][(startIdx + i) % 5],
      },
      reason: needsReason ? "Strong communication skills, good fit for the team." : undefined,
      createdBy: "u-1",
      createdAt: "2026-07-21T09:00:00Z",
      updatedAt: "2026-08-01T09:00:00Z",
    };
  });
}

export const mockCandidates: Candidate[] = [
  ...buildCandidates("b-3", 20, 0),
  ...buildCandidates("b-2", 14, 5),
  ...buildCandidates("b-1", 10, 11),
];
