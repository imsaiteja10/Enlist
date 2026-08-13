import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Candidate, User } from "@/types";

const completedStatuses = ["accepted", "rejected", "into_consideration", "missed_interview", "didnt_join"];

export function InterviewerProgressTable({
  interviewers,
  candidates,
}: {
  interviewers: User[];
  candidates: Candidate[];
}) {
  return (
    <Table>
      <THead>
        <Th>Interviewer</Th>
        <Th>Assigned</Th>
        <Th>Completed</Th>
        <Th>Pending</Th>
      </THead>
      <TBody>
        {interviewers.map((u) => {
          const assigned = candidates.filter((c) => c.assignedTo === u.id);
          const completed = assigned.filter((c) => completedStatuses.includes(c.statusKey));
          return (
            <Tr key={u.id}>
              <Td>
                {u.firstName} {u.lastName}
              </Td>
              <Td>{assigned.length}</Td>
              <Td>{completed.length}</Td>
              <Td>{assigned.length - completed.length}</Td>
            </Tr>
          );
        })}
      </TBody>
    </Table>
  );
}
