import { Radio, Plus, AlertTriangle, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

export interface Signal {
  id: string;
  time: string;
  type: "DIRTY" | "BROKEN" | "OUTAGE" | "RESTORED" | "SOS";
  location: string;
  source: "SMS" | "SENSOR" | "SATELLITE" | "FIELD";
  body?: string;
  priority?: number;
  action?: string;
}

interface LiveSignalsFeedProps {
  signals: Signal[]; // initial signals (optional)
  onSimulate: () => void;
}

const typeBadgeStyles: Record<Signal["type"], string> = {
  DIRTY: "bg-crisis-warning/20 text-crisis-warning border-crisis-warning/50",
  BROKEN: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
  OUTAGE: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
  RESTORED: "bg-crisis-safe/20 text-crisis-safe border-crisis-safe/50",
  SOS: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
};

const sourceStyles: Record<Signal["source"], string> = {
  SMS: "text-crisis-warning",
  SENSOR: "text-crisis-info",
  SATELLITE: "text-crisis-safe",
  FIELD: "text-muted-foreground",
};

export function LiveSignalsFeed({ signals: initialSignals, onSimulate }: LiveSignalsFeedProps) {
  const [signals, setSignals] = useState<Signal[]>(initialSignals);

  // Poll backend for new messages every 5 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:8000/messages?limit=20");
        if (!res.ok) return;
        const data = await res.json();
        const enriched = data.map((msg: any, idx: number) => ({
          id: msg.timestamp + idx,
          time: new Date(msg.timestamp).toLocaleTimeString(),
          type: msg.signal_type as any,
          location: msg.body?.includes("#BROKEN") ? "Al-Riyadh Block 4" : "Unknown",
          source: msg.from === "demo" ? "FIELD" : "SMS",
          body: msg.body,
          priority: msg.priority,
          action: msg.action,
        }));
        setSignals((prev) => {
          const existing = new Set(prev.map((s) => s.id));
          const newMsgs = enriched.filter((m) => !existing.has(m.id));
          return [...newMsgs, ...prev].slice(0, 50);
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-5 h-5 text-crisis-safe" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-crisis-safe rounded-full animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Live Signals</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {signals.length} reports • Last 24h
        </p>
      </div>

      {/* Signal List */}
      <ScrollArea className="flex-1 px-3">
        <div className="py-3 space-y-2">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="signal-item p-3 rounded-lg bg-surface-elevated border border-border hover:border-muted-foreground/5 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {signal.time}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${typeBadgeStyles[signal.type]}`}
                >
                  #{signal.type}
                </Badge>
              </div>

              <div className="mt-2 flex items-center gap-2">
                {signal.type === "DIRTY" || signal.type === "BROKEN" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-crisis-warning" />
                ) : signal.type === "RESTORED" ? (
                  <Droplet className="w-3.5 h-3.5 text-crisis-safe" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-crisis-critical" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {signal.location}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span className={`text-xs font-mono ${sourceStyles[signal.source]}`}>
                  via {signal.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Simulate Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onSimulate}
          className="w-full bg-crisis-safe/20 hover:bg-crisis-safe/30 text-crisis-safe border border-crisis-safe/50"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Simulate Incoming Report
        </Button>
      </div>
    </div>
  );
}
