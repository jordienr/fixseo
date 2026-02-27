import { cn } from "@/lib/utils";

interface MetricBlockProps {
  value: number;
  label: string;
  color?: "red" | "amber" | "blue" | "green" | "slate";
  className?: string;
}

export function MetricBlock({
  value,
  label,
  color = "slate",
  className,
}: MetricBlockProps) {
  const colorClasses: Record<string, string> = {
    red: "text-red-500",
    amber: "text-amber-500",
    blue: "text-blue-500",
    green: "text-green-500",
    slate: "text-slate-400",
  };
  
  return (
    <div className={cn("text-center font-mono", className)}>
      <div className={cn("text-2xl text-foreground")}>{value}</div>
      <div className={cn("text-xs uppercase", colorClasses[color])}>{label}</div>
    </div>
  );
}

interface MetricGridProps {
  high: number;
  medium: number;
  low: number;
  className?: string;
}

export function MetricGrid({ high, medium, low, className }: MetricGridProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-6", className)}>
      <MetricBlock value={high} label="High" color="red" />
      <MetricBlock value={medium} label="Medium" color="amber" />
      <MetricBlock value={low} label="Low" color="blue" />
    </div>
  );
}
