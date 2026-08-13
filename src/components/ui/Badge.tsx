const dotColor: Record<string, string> = {
  neutral: "bg-stone-400",
  progress: "bg-amber-500",
  positive: "bg-emerald-600",
  negative: "bg-red-500",
};

interface BadgeProps {
  label: string;
  tone?: keyof typeof dotColor;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[tone]}`} />
      {label}
    </span>
  );
}
