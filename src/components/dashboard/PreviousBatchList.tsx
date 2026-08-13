import Link from "next/link";
import { Batch, Candidate } from "@/types";
import { formatDate } from "@/lib/utils/status";

export function PreviousBatchList({
  batches,
  candidates,
}: {
  batches: Batch[];
  candidates: Candidate[];
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-5 py-3">
        <p className="text-xs uppercase tracking-wide text-stone-400">
          Previous batches
        </p>
      </div>
      <ul className="divide-y divide-stone-100">
        {batches.map((batch) => {
          const count = candidates.filter((c) => c.batchId === batch.id).length;
          return (
            <li key={batch.id}>
              <Link
                href={`/batches/${batch.id}`}
                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-stone-50"
              >
                <span className="text-stone-700">{batch.name}</span>
                <span className="text-stone-400">
                  {count} candidates · {formatDate(batch.createdAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
