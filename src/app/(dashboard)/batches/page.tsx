"use client";

import { useState } from "react";
import { mockBatches } from "@/lib/mock/mockBatches";
import { mockCandidates } from "@/lib/mock/mockCandidates";
import { Batch } from "@/types";
import { BatchTable } from "@/components/batches/BatchTable";
import { NewBatchModal } from "@/components/batches/NewBatchModal";
import { Button } from "@/components/ui/Button";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [modalOpen, setModalOpen] = useState(false);

  function handleCreate(name: string) {
    const newBatch: Batch = {
      id: `b-${Date.now()}`,
      name,
      batchNumber: batches.length + 1,
      isCurrent: false,
      createdBy: "u-0",
      createdAt: new Date().toISOString(),
    };
    setBatches([newBatch, ...batches]);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-stone-800">Batches</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          New batch
        </Button>
      </div>

      <BatchTable batches={batches} candidates={mockCandidates} />

      <NewBatchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
