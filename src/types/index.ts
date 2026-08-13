export type Role = "superadmin" | "interview_lead" | "interviewer" | "pending";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  calConnected: boolean;
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  batchNumber: number;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
}

export type FieldType = "text" | "number" | "textarea" | "dropdown";

export interface FieldDefinition {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: FieldType;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface StatusDefinition {
  id: string;
  label: string;
  statusKey: string;
  requiresReason: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface Candidate {
  id: string;
  batchId: string;
  assignedTo: string | null;
  statusKey: string;
  fields: Record<string, string>;
  reason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
