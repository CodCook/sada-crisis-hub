import { Activity, Satellite, MessageSquare, Map, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FusionEngineWidgetProps {
  isActive: boolean;
  confidenceScore: number;
  clusterLabel?: string;
}

export function FusionEngineWidget({ isActive, confidenceScore, clusterLabel }: FusionEngineWidgetProps) {
  const getProgressColor = (score: number) => {
    if (score >= 90) return "progress-critical";
    if (score >= 50) return "progress-warning";
    return "progress-safe";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "HIGH PRIORITY";
    if (score >= 70) return "MEDIUM PRIORITY";
    if (score >= 50) return "LOW PRIORITY";
    return "MONITORING";
  };

  if (!isActive) {
    return (
      <div className="glass-panel rounded-lg p-4 w-72 widget-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Fusion Engine</h3>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Select a cluster on the map to view data fusion analysis
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg p-4 w-80 widget-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-crisis-safe" />
          <h3 className="text-sm font-semibold text-foreground">Fusion Engine</h3>
        </div>
        <span className="text-xs font-mono text-crisis-safe">ACTIVE</span>
      </div>

      {clusterLabel && (
        <div className="mb-4 pb-3 border-b border-border">
          <span className="text-xs text-muted-foreground">Selected Zone</span>
          <p className="text-sm font-semibold text-foreground">{clusterLabel}</p>
        </div>
      )}

      {/* Confidence Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Confidence Score</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-crisis-safe" />
            <span className="text-lg font-bold text-foreground">{confidenceScore}%</span>
            <span className="text-[10px] text-crisis-safe font-mono">VERIFIED</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", getProgressColor(confidenceScore))}
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
        <p className={cn(
          "text-[10px] font-mono mt-1.5 text-right",
          confidenceScore >= 90 ? "text-crisis-critical" : 
          confidenceScore >= 50 ? "text-crisis-warning" : "text-crisis-safe"
        )}>
          {getScoreLabel(confidenceScore)}
        </p>
      </div>

      {/* Data Fusion Breakdown */}
      <div className="space-y-2 pt-3 border-t border-border">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Data Fusion Breakdown
        </span>
        
        <div className="flex items-center gap-2 text-xs">
          <Satellite className="w-3.5 h-3.5 text-crisis-critical" />
          <span className="text-foreground">Satellite</span>
          <span className="text-crisis-critical font-mono">(Dark)</span>
        </div>
        
        <div className="flex items-center justify-center text-muted-foreground text-xs">+</div>
        
        <div className="flex items-center gap-2 text-xs">
          <MessageSquare className="w-3.5 h-3.5 text-crisis-warning" />
          <span className="text-foreground">50+ SMS Reports</span>
          <span className="text-crisis-warning font-mono">(Confirmed)</span>
        </div>
        
        <div className="flex items-center justify-center text-muted-foreground text-xs">+</div>
        
        <div className="flex items-center gap-2 text-xs">
          <Map className="w-3.5 h-3.5 text-crisis-info" />
          <span className="text-foreground">Main Pipe Location</span>
          <span className="text-crisis-info font-mono">(Mapped)</span>
        </div>
        
        <div className="flex items-center justify-center text-lg font-bold text-foreground py-2">=</div>
        
        <div className="bg-crisis-critical/10 border border-crisis-critical/30 rounded-md p-2 text-center">
          <span className="text-sm font-bold text-crisis-critical">HIGH PRIORITY ALERT</span>
        </div>
      </div>
    </div>
  );
}
