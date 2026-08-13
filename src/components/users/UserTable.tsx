import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Role, User } from "@/types";
import { formatDate } from "@/lib/utils/status";

export function UserTable({
  users,
  onRoleChange,
}: {
  users: User[];
  onRoleChange: (userId: string, role: Role) => void;
}) {
  return (
    <Table>
      <THead>
        <Th>Name</Th>
        <Th>Email</Th>
        <Th>Role</Th>
        <Th>Joined</Th>
        <Th />
      </THead>
      <TBody>
        {users.map((u) => (
          <Tr key={u.id}>
            <Td className="font-medium text-stone-800">
              {u.firstName} {u.lastName}
            </Td>
            <Td className="text-stone-500">{u.email}</Td>
            <Td>
              {u.role === "pending" ? (
                <span className="text-sm text-amber-600">Pending approval</span>
              ) : (
                <Select
                  value={u.role}
                  onChange={(e) => onRoleChange(u.id, e.target.value as Role)}
                  className="min-w-[9rem]"
                >
                  <option value="superadmin">Super admin</option>
                  <option value="interview_lead">Interview lead</option>
                  <option value="interviewer">Interviewer</option>
                </Select>
              )}
            </Td>
            <Td className="text-stone-500">{formatDate(u.createdAt)}</Td>
            <Td>
              {u.role === "pending" && (
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => onRoleChange(u.id, "interviewer")}>
                    Approve
                  </Button>
                </div>
              )}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}
