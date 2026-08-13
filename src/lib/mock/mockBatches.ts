import { Batch } from "@/types";

export const mockBatches: Batch[] = [
  { id: "b-3", name: "Batch 3", batchNumber: 3, isCurrent: true, createdBy: "u-0", createdAt: "2026-07-20T09:00:00Z" },
  { id: "b-2", name: "Batch 2", batchNumber: 2, isCurrent: false, createdBy: "u-0", createdAt: "2026-04-02T09:00:00Z" },
  { id: "b-1", name: "Batch 1", batchNumber: 1, isCurrent: false, createdBy: "u-0", createdAt: "2026-01-08T09:00:00Z" },
];
