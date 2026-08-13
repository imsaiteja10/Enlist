import { Batch } from "@/types";
import { Button } from "@/components/ui/Button";

export function BatchDetailHeader({
  batch,
  onSetCurrent,
}: {
  batch: Batch;
  onSetCurrent: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-serif text-2xl text-stone-800">{batch.name}</h1>
        <p className="text-sm text-stone-500">
          {batch.isCurrent ? "Current batch" : "Previous batch"}
        </p>
      </div>
      {!batch.isCurrent && (
        <Button variant="secondary" onClick={onSetCurrent}>
          Set as current
        </Button>
      )}
    </div>
  );
}
