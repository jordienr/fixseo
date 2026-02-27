import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-green-500 to-green-600";
  if (score >= 60) return "from-amber-500 to-orange-500";
  return "from-red-500 to-red-600";
}

export function Gauge({
  value,
  size = 160,
  strokeWidth = 12,
  className,
}: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              className={getScoreGradient(value).split(" ")[0]}
            />
            <stop
              offset="100%"
              className={getScoreGradient(value).split(" ")[1]}
            />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl", getScoreColor(value))}>{value}</span>
      </div>
    </div>
  );
}
