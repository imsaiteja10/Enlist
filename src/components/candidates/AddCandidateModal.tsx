"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FieldDefinition } from "@/types";

export function AddCandidateModal({
  open,
  fields,
  onClose,
  onCreate,
}: {
  open: boolean;
  fields: FieldDefinition[];
  onClose: () => void;
  onCreate: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = fields.some((f) => f.isRequired && !values[f.fieldKey]?.trim());
    if (missing) return;
    onCreate(values);
    setValues({});
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add candidate">
      <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
        {fields
          .filter((f) => f.isActive)
          .map((f) => (
            <Input
              key={f.id}
              label={f.label + (f.isRequired ? " *" : "")}
              id={f.fieldKey}
              type={f.fieldType === "number" ? "tel" : "text"}
              value={values[f.fieldKey] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.fieldKey]: e.target.value }))
              }
            />
          ))}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add candidate
          </Button>
        </div>
      </form>
    </Modal>
  );
}
