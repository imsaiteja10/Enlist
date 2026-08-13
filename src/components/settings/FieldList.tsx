"use client";

import { useState } from "react";
import { FieldDefinition } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FieldList({
  fields,
  onAdd,
  onRemove,
  onToggleRequired,
}: {
  fields: FieldDefinition[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onToggleRequired: (id: string) => void;
}) {
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-5 py-3">
        <p className="text-xs uppercase tracking-wide text-stone-400">
          Candidate fields
        </p>
      </div>
      <ul className="divide-y divide-stone-100">
        {fields
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((f) => (
            <li key={f.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <div>
                <span className="text-stone-700">{f.label}</span>
                <span className="ml-2 text-xs text-stone-400">{f.fieldType}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleRequired(f.id)}
                  className={`text-xs ${f.isRequired ? "text-accent" : "text-stone-400"}`}
                >
                  {f.isRequired ? "Required" : "Optional"}
                </button>
                <button
                  onClick={() => onRemove(f.id)}
                  className="text-xs text-stone-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newLabel.trim()) return;
          onAdd(newLabel.trim());
          setNewLabel("");
        }}
        className="flex items-center gap-2 border-t border-stone-100 px-5 py-3"
      >
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New field label"
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Add field
        </Button>
      </form>
    </div>
  );
}
