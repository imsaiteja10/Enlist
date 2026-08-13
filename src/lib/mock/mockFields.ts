import { FieldDefinition } from "@/types";

export const mockFields: FieldDefinition[] = [
  { id: "f-1", label: "First name", fieldKey: "first_name", fieldType: "text", isRequired: true, displayOrder: 1, isActive: true },
  { id: "f-2", label: "Last name", fieldKey: "last_name", fieldType: "text", isRequired: true, displayOrder: 2, isActive: true },
  { id: "f-3", label: "Email", fieldKey: "email", fieldType: "text", isRequired: true, displayOrder: 3, isActive: true },
  { id: "f-4", label: "Mobile number", fieldKey: "mobile", fieldType: "number", isRequired: true, displayOrder: 4, isActive: true },
  { id: "f-5", label: "College name", fieldKey: "college", fieldType: "text", isRequired: true, displayOrder: 5, isActive: true },
  { id: "f-6", label: "Course", fieldKey: "course", fieldType: "text", isRequired: false, displayOrder: 6, isActive: true },
  { id: "f-7", label: "City", fieldKey: "city", fieldType: "text", isRequired: false, displayOrder: 7, isActive: true },
  { id: "f-8", label: "Why join Spartans?", fieldKey: "why_join", fieldType: "textarea", isRequired: false, displayOrder: 8, isActive: true },
];
