import Link from "next/link";
import { Batch, Candidate } from "@/types";
import { mockStatuses } from "@/lib/mock/mockStatuses";

export function CurrentBatchCard({
  batch,
  candidates,
}: {
  batch: Batch;
  candidates: Candidate[];
}) {
  const counts = mockStatuses.map((s) => ({
    label: s.label,
    count: candidates.filter((c) => c.statusKey === s.statusKey).length,
  }));

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wide text-stone-400">
          Current batch
        </p>
        <Link
          href={`/batches/${batch.id}`}
          className="text-sm text-accent hover:underline"
        >
          View batch →
        </Link>
      </div>
      <h2 className="font-serif text-2xl text-stone-800">{batch.name}</h2>
      <p className="mt-1 text-sm text-stone-500">
        {candidates.length} candidates
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-x-6 gap-y-3 border-t border-stone-100 pt-5 sm:grid-cols-5">
        {counts.map((c) => (
          <div key={c.label}>
            <dt className="text-xs text-stone-400">{c.label}</dt>
            <dd className="text-lg text-stone-800">{c.count}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
