export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-stone-300 py-12 text-sm text-stone-500">
      {message}
    </div>
  );
}
