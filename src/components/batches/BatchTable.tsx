import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Batch, Candidate } from "@/types";
import { formatDate } from "@/lib/utils/status";
import { useRouter } from "next/navigation";

export function BatchTable({
  batches,
  candidates,
}: {
  batches: Batch[];
  candidates: Candidate[];
}) {
  const router = useRouter();

  return (
    <Table>
      <THead>
        <Th>Batch</Th>
        <Th>Candidates</Th>
        <Th>Status</Th>
        <Th>Created</Th>
      </THead>
      <TBody>
        {batches.map((b) => {
          const count = candidates.filter((c) => c.batchId === b.id).length;
          return (
            <Tr key={b.id} onClick={() => router.push(`/batches/${b.id}`)}>
              <Td className="font-medium text-stone-800">{b.name}</Td>
              <Td>{count}</Td>
              <Td>{b.isCurrent ? "Current" : "Previous"}</Td>
              <Td className="text-stone-500">{formatDate(b.createdAt)}</Td>
            </Tr>
          );
        })}
      </TBody>
    </Table>
  );
}
