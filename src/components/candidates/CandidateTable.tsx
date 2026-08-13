"use client";

import { useState } from "react";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Candidate, StatusDefinition, User } from "@/types";
import { waLink } from "@/lib/utils/whatsapp";
import { StatusReasonModal } from "@/components/candidates/StatusReasonModal";

export function CandidateTable({
  candidates,
  statuses,
  interviewers,
  onAssign,
  onStatusChange,
}: {
  candidates: Candidate[];
  statuses: StatusDefinition[];
  interviewers: User[];
  onAssign: (candidateId: string, userId: string | null) => void;
  onStatusChange: (candidateId: string, statusKey: string, reason?: string) => void;
}) {
  const [pending, setPending] = useState<{
    candidateId: string;
    status: StatusDefinition;
  } | null>(null);

  function handleStatusSelect(candidateId: string, statusKey: string) {
    const status = statuses.find((s) => s.statusKey === statusKey)!;
    if (status.requiresReason) {
      setPending({ candidateId, status });
    } else {
      onStatusChange(candidateId, statusKey);
    }
  }

  if (candidates.length === 0) {
    return <EmptyState message="No candidates match the current filters." />;
  }

  return (
    <>
      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Contact</Th>
          <Th>College</Th>
          <Th>Assigned to</Th>
          <Th>Status</Th>
        </THead>
        <TBody>
          {candidates.map((c) => (
            <Tr key={c.id}>
              <Td className="font-medium text-stone-800">
                {c.fields.first_name} {c.fields.last_name}
              </Td>
              <Td>
                <div className="flex flex-col text-stone-500">
                  <span>{c.fields.email}</span>
                  <a
                    href={waLink(c.fields.mobile ?? "")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {c.fields.mobile}
                  </a>
                </div>
              </Td>
              <Td className="text-stone-500">{c.fields.college}</Td>
              <Td>
                <Select
                  value={c.assignedTo ?? ""}
                  onChange={(e) => onAssign(c.id, e.target.value || null)}
                  className="min-w-[9rem]"
                >
                  <option value="">Unassigned</option>
                  {interviewers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>
                <div className="flex flex-col gap-1">
                  <Select
                    value={c.statusKey}
                    onChange={(e) => handleStatusSelect(c.id, e.target.value)}
                    className="min-w-[10rem]"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.statusKey}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                  {c.reason && (
                    <span className="max-w-[16rem] truncate text-xs text-stone-400" title={c.reason}>
                      {c.reason}
                    </span>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <StatusReasonModal
        open={pending !== null}
        status={pending?.status ?? null}
        onClose={() => setPending(null)}
        onConfirm={(reason) => {
          if (pending) {
            onStatusChange(pending.candidateId, pending.status.statusKey, reason);
            setPending(null);
          }
        }}
      />
    </>
  );
}
