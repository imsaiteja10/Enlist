"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NewBatchModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New batch">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Batch name"
          id="batch-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Batch 4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create batch
          </Button>
        </div>
      </form>
    </Modal>
  );
}
