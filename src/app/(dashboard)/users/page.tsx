"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mock/mockUsers";
import { Role, User } from "@/types";
import { UserTable } from "@/components/users/UserTable";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  function handleRoleChange(userId: string, role: Role) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }

  const pendingCount = users.filter((u) => u.role === "pending").length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-stone-800">Users</h1>
        {pendingCount > 0 && (
          <p className="mt-1 text-sm text-stone-500">
            {pendingCount} user{pendingCount > 1 ? "s" : ""} awaiting approval
          </p>
        )}
      </div>

      <UserTable users={users} onRoleChange={handleRoleChange} />
    </div>
  );
}
