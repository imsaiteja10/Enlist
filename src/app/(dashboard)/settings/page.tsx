"use client";

import { useState } from "react";
import { mockFields } from "@/lib/mock/mockFields";
import { mockStatuses } from "@/lib/mock/mockStatuses";
import { FieldDefinition, StatusDefinition } from "@/types";
import { FieldList } from "@/components/settings/FieldList";
import { StatusList } from "@/components/settings/StatusList";

export default function SettingsPage() {
  const [fields, setFields] = useState<FieldDefinition[]>(mockFields);
  const [statuses, setStatuses] = useState<StatusDefinition[]>(mockStatuses);

  function addField(label: string) {
    setFields((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        label,
        fieldKey: label.toLowerCase().replace(/\s+/g, "_"),
        fieldType: "text",
        isRequired: false,
        displayOrder: prev.length + 1,
        isActive: true,
      },
    ]);
  }

  function addStatus(label: string) {
    setStatuses((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        label,
        statusKey: label.toLowerCase().replace(/\s+/g, "_"),
        requiresReason: false,
        displayOrder: prev.length + 1,
        isActive: true,
      },
    ]);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-serif text-2xl text-stone-800">Settings</h1>

      <FieldList
        fields={fields}
        onAdd={addField}
        onRemove={(id) => setFields((prev) => prev.filter((f) => f.id !== id))}
        onToggleRequired={(id) =>
          setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isRequired: !f.isRequired } : f))
          )
        }
      />

      <StatusList
        statuses={statuses}
        onAdd={addStatus}
        onRemove={(id) => setStatuses((prev) => prev.filter((s) => s.id !== id))}
        onToggleReason={(id) =>
          setStatuses((prev) =>
            prev.map((s) => (s.id === id ? { ...s, requiresReason: !s.requiresReason } : s))
          )
        }
      />
    </div>
  );
}
