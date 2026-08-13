import { mockBatches } from "@/lib/mock/mockBatches";
import { mockCandidates } from "@/lib/mock/mockCandidates";
import { mockUsers } from "@/lib/mock/mockUsers";
import { CurrentBatchCard } from "@/components/dashboard/CurrentBatchCard";
import { PreviousBatchList } from "@/components/dashboard/PreviousBatchList";
import { InterviewerProgressTable } from "@/components/dashboard/InterviewerProgressTable";

export default function DashboardPage() {
  const currentBatch = mockBatches.find((b) => b.isCurrent)!;
  const previousBatches = mockBatches.filter((b) => !b.isCurrent);
  const currentCandidates = mockCandidates.filter((c) => c.batchId === currentBatch.id);
  const interviewers = mockUsers.filter((u) => u.role === "interviewer" || u.role === "interview_lead");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="font-serif text-2xl text-stone-800">Dashboard</h1>

      <CurrentBatchCard batch={currentBatch} candidates={currentCandidates} />

      <PreviousBatchList batches={previousBatches} candidates={mockCandidates} />

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-stone-400">
          Interviewer progress · {currentBatch.name}
        </p>
        <InterviewerProgressTable interviewers={interviewers} candidates={currentCandidates} />
      </div>
    </div>
  );
}
