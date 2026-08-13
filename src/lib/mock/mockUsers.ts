import { User } from "@/types";

export const mockCurrentUser: User = {
  id: "u-0",
  email: "saiteja@spartans.dev",
  firstName: "Saiteja",
  lastName: "Dandupati",
  role: "superadmin",
  calConnected: false,
  createdAt: "2026-01-05T09:00:00Z",
};

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: "u-1",
    email: "ananya.rao@spartans.dev",
    firstName: "Ananya",
    lastName: "Rao",
    role: "interview_lead",
    calConnected: true,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "u-2",
    email: "kiran.mehta@spartans.dev",
    firstName: "Kiran",
    lastName: "Mehta",
    role: "interviewer",
    calConnected: true,
    createdAt: "2026-01-12T09:00:00Z",
  },
  {
    id: "u-3",
    email: "priya.nair@spartans.dev",
    firstName: "Priya",
    lastName: "Nair",
    role: "interviewer",
    calConnected: false,
    createdAt: "2026-02-02T09:00:00Z",
  },
  {
    id: "u-4",
    email: "arjun.singh@spartans.dev",
    firstName: "Arjun",
    lastName: "Singh",
    role: "interviewer",
    calConnected: true,
    createdAt: "2026-02-14T09:00:00Z",
  },
  {
    id: "u-5",
    email: "meera.iyer@spartans.dev",
    firstName: "Meera",
    lastName: "Iyer",
    role: "pending",
    calConnected: false,
    createdAt: "2026-08-10T09:00:00Z",
  },
  {
    id: "u-6",
    email: "rohan.das@spartans.dev",
    firstName: "Rohan",
    lastName: "Das",
    role: "pending",
    calConnected: false,
    createdAt: "2026-08-12T09:00:00Z",
  },
];
