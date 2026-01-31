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
      <div className="p-4 border-b border-sidebar-border bg-sidebar/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-5 h-5 text-[#5288c1]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#5288c1] rounded-full animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">SADA Messenger</h2>
          </div>
          <Badge variant="outline" className="text-[9px] bg-[#2b5278]/20 text-[#5288c1] border-[#5288c1]/30">
            ENCRYPTED
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-crisis-safe" />
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
            {signals.length} Active Nodes • Network: Omdurman-Central
          </p>
        </div>
      </div>

      {/* Signal List */}
      <ScrollArea className="flex-1 px-3">
        <div className="py-4 space-y-4">
          {signals.map((signal) => {
            const isRealSms = signal.source === "REAL SMS";
            const isSimulator = signal.source === "SIMULATOR";
            const isAnySms = isRealSms || isSimulator;
            const isSOS = signal.type === "SOS" || signal.type === "AID";

            return (
              <div
                key={signal.id}
                onClick={() => onSignalClick && onSignalClick(signal)}
                className={`flex flex-col gap-1 transition-all cursor-pointer group`}
              >
                {/* Source Label */}
                <div className="flex items-center gap-1.5 px-1 mb-0.5">
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${sourceStyles[signal.source] || (isRealSms ? "text-[#5288c1]" : isSimulator ? "text-orange-400" : "text-muted-foreground")}`}>
                    {signal.source}
                  </span>
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-[10px] font-mono text-muted-foreground opacity-70">
                    {signal.time}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-3 rounded-2xl border transition-all ${isSOS
                    ? "bg-crisis-critical/10 border-crisis-critical/50 shadow-[0_0_15px_rgba(234,56,76,0.15)]"
                    : isRealSms
                      ? "bg-[#2b5278]/40 border-[#5288c1]/30 shadow-sm" // Telegram-ish Blue for REAL SMS
                      : isSimulator
                        ? "bg-orange-500/10 border-orange-500/30" // Subtle Orange for Simulator
                        : "bg-surface-elevated border-border" // Default for Proxy
                    } ${isAnySms ? "rounded-tl-none ml-1" : "rounded-tr-none mr-1"} group-hover:border-primary/20`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 font-black h-4 ${isSOS
                          ? "bg-crisis-critical text-white border-none"
                          : isRealSms
                            ? "bg-[#5288c1] text-white border-none"
                            : isSimulator
                              ? "bg-orange-500/80 text-white border-none"
                              : typeBadgeStyles[signal.type]
                          }`}
                      >
                        {signal.type}
                      </Badge>
                      <span className={`text-xs font-bold ${isRealSms ? "text-[#5288c1]" : isSimulator ? "text-orange-400" : "text-foreground"}`}>
                        {signal.location}
                      </span>
                    </div>
                    {isSOS ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-crisis-critical animate-pulse" />
                    ) : isRealSms ? (
                      <Radio className="w-3 h-3 text-[#5288c1]/70" />
                    ) : isSimulator ? (
                      <Plus className="w-3 h-3 text-orange-400/70" />
                    ) : (
                      <Plus className="w-3 h-3 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Body Text (The message itself) */}
                  <p className={`text-sm leading-relaxed font-medium ${isRealSms ? "text-white/90" : "text-foreground/90"}`}>
                    {signal.body}
                  </p>

                  <div className="mt-1.5 flex justify-end">
                    <span className="text-[9px] font-mono text-muted-foreground opacity-50 italic">
                      Received: {signal.time}
                    </span>
                  </div>

                  {/* Bubble Tail */}
                  <div className={`absolute top-0 w-2 h-2 ${isAnySms
                    ? "-left-1 border-l border-t border-border bg-surface-elevated rotate-45"
                    : "-right-1 border-r border-t border-border bg-surface-elevated rotate-45"
                    } ${isRealSms ? "bg-[#24374a] border-[#5288c1]/20" : isSimulator ? "bg-[#2a1f1a] border-orange-500/20" : ""} ${isSOS ? "bg-crisis-critical/10 border-crisis-critical/20" : ""}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
