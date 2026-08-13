"use client";

import { useState } from "react";
import { StatusDefinition } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function StatusList({
  statuses,
  onAdd,
  onRemove,
  onToggleReason,
}: {
  statuses: StatusDefinition[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onToggleReason: (id: string) => void;
}) {
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-5 py-3">
        <p className="text-xs uppercase tracking-wide text-stone-400">
          Candidate statuses
        </p>
      </div>
      <ul className="divide-y divide-stone-100">
        {statuses
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((s) => (
            <li key={s.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span className="text-stone-700">{s.label}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleReason(s.id)}
                  className={`text-xs ${s.requiresReason ? "text-accent" : "text-stone-400"}`}
                >
                  {s.requiresReason ? "Reason required" : "No reason"}
                </button>
                <button
                  onClick={() => onRemove(s.id)}
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
          placeholder="New status label"
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Add status
        </Button>
      </form>
    </div>
  );
}
