import { Shield, Signal, Users, Clock, Trash2 } from "lucide-react";

interface DashboardHeaderProps {
  criticalCount: number;
  warningCount: number;
  safeCount: number;
  onClear?: () => void;
}

export function DashboardHeader({ criticalCount, warningCount, safeCount, onClear }: DashboardHeaderProps) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="h-14 bg-surface-glass border-b border-border flex items-center justify-between px-4">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-crisis-safe/20 border border-crisis-safe/40">
          <Shield className="w-5 h-5 text-crisis-safe" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">SADA RE-CONNECT</h1>
          <p className="text-[10px] text-muted-foreground font-mono -mt-0.5">[SUDAN RECONSTRUCTION GRID]</p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-crisis-critical/10 border border-crisis-critical/30">
            <Signal className="w-3.5 h-3.5 text-crisis-critical" />
            <span className="text-sm font-bold text-crisis-critical">{criticalCount}</span>
            <span className="text-[10px] text-crisis-critical/80 uppercase">Critical</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-crisis-warning/10 border border-crisis-warning/30">
            <Signal className="w-3.5 h-3.5 text-crisis-warning" />
            <span className="text-sm font-bold text-crisis-warning">{warningCount}</span>
            <span className="text-[10px] text-crisis-warning/80 uppercase">Warning</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-crisis-safe/10 border border-crisis-safe/30">
            <Signal className="w-3.5 h-3.5 text-crisis-safe" />
            <span className="text-sm font-bold text-crisis-safe">{safeCount}</span>
            <span className="text-[10px] text-crisis-safe/80 uppercase">Stable</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Time */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="text-right">
              <p className="text-sm font-mono text-foreground">{timeString}</p>
              <p className="text-[10px] text-muted-foreground">{dateString}</p>
            </div>
          </div>

          {onClear && (
            <button
              onClick={onClear}
              className="group flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-crisis-critical/10 border border-transparent hover:border-crisis-critical/20 transition-all"
              title="Clear All Data"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-crisis-critical transition-colors" />
              <span className="text-[8px] font-bold text-muted-foreground group-hover:text-crisis-critical uppercase">Reset</span>
            </button>
          )}
        </div>

        {/* Operators */}
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-crisis-info flex items-center justify-center text-[10px] font-bold text-foreground border-2 border-background">
              AK
            </div>
            <div className="w-7 h-7 rounded-full bg-crisis-warning flex items-center justify-center text-[10px] font-bold text-background border-2 border-background">
              SM
            </div>
            <div className="w-7 h-7 rounded-full bg-crisis-safe flex items-center justify-center text-[10px] font-bold text-background border-2 border-background">
              +3
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
