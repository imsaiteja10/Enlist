import { mockCurrentUser } from "@/lib/mock/mockUsers";
import { initials } from "@/lib/utils/status";

export function Topbar() {
  const user = mockCurrentUser;

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-stone-200 bg-white px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent">
          {initials(user.firstName, user.lastName)}
        </div>
        <div className="leading-tight">
          <p className="text-sm text-stone-700">
            {user.firstName} {user.lastName}
          </p>
        </div>
        <button className="ml-3 text-sm text-stone-400 hover:text-stone-600">
          Sign out
        </button>
      </div>
    </header>
  );
}
