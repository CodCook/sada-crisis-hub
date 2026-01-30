import { Radio, Plus, AlertTriangle, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

export interface Signal {
  id: string;
  time: string;
  type: "DIRTY" | "BROKEN" | "OUTAGE" | "RESTORED" | "SOS" | "satellite" | "health" | "mobility" | "economic" | "infrastructure" | "security" | "sensor" | "report" | "unknown" | "POWER" | "AID" | "WATER";
  location: string;
  coords: [number, number];
  source: string; // broadened from literal union to string to catch varied sources
  body?: string;
  priority?: number;
  action?: string;
}

interface LiveSignalsFeedProps {
  signals: Signal[]; // initial signals (optional)
  onSignalClick?: (signal: Signal) => void;
  onSimulate?: () => void; // Deprecated but kept for type compat if needed temporarily
}

const typeBadgeStyles: Record<Signal["type"], string> = {
  DIRTY: "bg-crisis-warning/20 text-crisis-warning border-crisis-warning/50",
  BROKEN: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
  OUTAGE: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
  RESTORED: "bg-crisis-safe/20 text-crisis-safe border-crisis-safe/50",
  SOS: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
  AID: "bg-crisis-critical/20 text-crisis-critical border-crisis-critical/50",
  POWER: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  WATER: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  satellite: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  health: "bg-pink-500/20 text-pink-400 border-pink-500/50",
  mobility: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  economic: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  infrastructure: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  security: "bg-red-800/20 text-red-500 border-red-500/50",
  sensor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  report: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  unknown: "bg-muted/20 text-muted-foreground border-muted/50",
};

const sourceStyles: Record<string, string> = {
  SMS: "text-crisis-warning",
  SENSOR: "text-crisis-info",
  SATELLITE: "text-crisis-safe",
  FIELD: "text-muted-foreground",
  "SENTINEL-5P": "text-purple-400",
  "MARKET_SURVEY": "text-yellow-400",
  "GOOGLE_TRAFFIC": "text-blue-400",
  "HOSPITAL_LOGS": "text-pink-400",
  "NETBLOCKS": "text-orange-400",
  "ACLED_FEED": "text-red-400",
  "IOT_WATER": "text-cyan-400",
  "FAO_AQUASTAT": "text-blue-600",
  "HDX_HOT": "text-red-600",
  "GRID_GIS": "text-yellow-600",
};

export function LiveSignalsFeed({ signals, onSignalClick }: LiveSignalsFeedProps) {
  // Signals are now managed by the parent (Index) to ensure map sync

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
              onClick={() => onSignalClick && onSignalClick(signal)}
              className={`signal-item p-3 rounded-lg border transition-all cursor-pointer ${signal.type === "SOS" || signal.type === "AID"
                ? "bg-crisis-critical/10 border-crisis-critical shadow-[0_0_15px_rgba(234,56,76,0.2)] animate-pulse"
                : "bg-surface-elevated border-border hover:border-muted-foreground/5 shadow-sm"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {signal.time}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 font-bold ${(signal.type === "SOS" || signal.type === "AID") ? "bg-crisis-critical text-white" : typeBadgeStyles[signal.type]
                    }`}
                >
                  #{signal.type}
                </Badge>
              </div>

              <div className="mt-2 flex items-center gap-2">
                {(signal.type === "SOS" || signal.type === "AID") ? (
                  <AlertTriangle className="w-4 h-4 text-crisis-critical animate-bounce" />
                ) : (signal.type === "DIRTY" || signal.type === "BROKEN" || signal.type === "POWER" || signal.type === "WATER") ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-crisis-warning" />
                ) : signal.type === "RESTORED" ? (
                  <Droplet className="w-3.5 h-3.5 text-crisis-safe" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-crisis-critical" />
                )}
                <span className={`text-sm font-medium ${(signal.type === "SOS" || signal.type === "AID") ? "text-crisis-critical font-bold" : "text-foreground"}`}>
                  {signal.location}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span className={`text-xs font-mono ${sourceStyles[signal.source] || "text-muted-foreground"}`}>
                  via {signal.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
