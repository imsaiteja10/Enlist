"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { mockBatches } from "@/lib/mock/mockBatches";
import { mockCandidates } from "@/lib/mock/mockCandidates";
import { mockUsers } from "@/lib/mock/mockUsers";
import { mockStatuses } from "@/lib/mock/mockStatuses";
import { mockFields } from "@/lib/mock/mockFields";
import { Candidate } from "@/types";
import { BatchDetailHeader } from "@/components/batches/BatchDetailHeader";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { AddCandidateModal } from "@/components/candidates/AddCandidateModal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const batch = mockBatches.find((b) => b.id === params.id);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const interviewers = mockUsers.filter(
    (u) => u.role === "interviewer" || u.role === "interview_lead"
  );

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (c.batchId !== params.id) return false;
      if (statusFilter && c.statusKey !== statusFilter) return false;
      if (assigneeFilter && c.assignedTo !== assigneeFilter) return false;
      return true;
    });
  }, [candidates, params.id, statusFilter, assigneeFilter]);

  if (!batch) notFound();

  function handleAssign(candidateId: string, userId: string | null) {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              assignedTo: userId,
              statusKey: userId && c.statusKey === "unassigned" ? "assigned" : c.statusKey,
            }
          : c
      )
    );
  }

  function handleStatusChange(candidateId: string, statusKey: string, reason?: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, statusKey, reason } : c))
    );
  }

  function handleCreateCandidate(values: Record<string, string>) {
    const newCandidate: Candidate = {
      id: `c-${Date.now()}`,
      batchId: params.id,
      assignedTo: null,
      statusKey: "unassigned",
      fields: values,
      createdBy: "u-0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCandidates((prev) => [newCandidate, ...prev]);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <BatchDetailHeader batch={batch} onSetCurrent={() => {}} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {mockStatuses.map((s) => (
              <option key={s.id} value={s.statusKey}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="">All interviewers</option>
            {interviewers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Import Excel</Button>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            Add candidate
          </Button>
        </div>
      </div>

      <CandidateTable
        candidates={filtered}
        statuses={mockStatuses}
        interviewers={interviewers}
        onAssign={handleAssign}
        onStatusChange={handleStatusChange}
      />

      <AddCandidateModal
        open={addOpen}
        fields={mockFields}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreateCandidate}
      />
    </div>
  );
}
