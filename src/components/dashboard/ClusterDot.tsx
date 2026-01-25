import { cn } from "@/lib/utils";

type ClusterStatus = "critical" | "warning" | "safe";

interface ClusterDotProps {
  status: ClusterStatus;
  x: number;
  y: number;
  label?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const statusStyles: Record<ClusterStatus, string> = {
  critical: "cluster-critical",
  warning: "cluster-warning", 
  safe: "cluster-safe",
};

const statusSizes: Record<ClusterStatus, string> = {
  critical: "w-5 h-5",
  warning: "w-4 h-4",
  safe: "w-3 h-3",
};

export function ClusterDot({ status, x, y, label, onClick, isSelected }: ClusterDotProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute rounded-full cursor-pointer transition-all duration-200 z-10",
        "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
        statusStyles[status],
        statusSizes[status],
        isSelected && "ring-2 ring-foreground scale-150"
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
      aria-label={label || `${status} cluster`}
    >
      {label && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-foreground whitespace-nowrap font-mono">
          {label}
        </span>
      )}
    </button>
  );
}
