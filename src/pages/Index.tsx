import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LiveSignalsFeed, Signal } from "@/components/dashboard/LiveSignalsFeed";
import { LeafletMap } from "@/components/dashboard/LeafletMap";
import { LayerControl } from "@/components/dashboard/LayerControl";
import { FusionEngineWidget } from "@/components/dashboard/FusionEngineWidget";
import { ActionModal } from "@/components/dashboard/ActionModal";

// Initial cluster data - positioned relative to Khartoum geography
// The Y-shape confluence: Blue Nile (east) + White Nile (west) meeting at center
const initialClusters = [
  { id: "1", status: "critical" as const, x: 55, y: 25, label: "Bahri Central" }, // North Khartoum [32.53, 15.60]
  { id: "2", status: "warning" as const, x: 30, y: 20, label: "Omdurman Souq" }, // Omdurman [32.48, 15.64]
  { id: "3", status: "safe" as const, x: 60, y: 55, label: "Al-Riyadh Block 4" }, // Al-Riyadh [32.55, 15.55]
  { id: "4", status: "warning" as const, x: 45, y: 40, label: "Khartoum Central" }, // Near confluence
  { id: "5", status: "safe" as const, x: 70, y: 65, label: "Soba Industrial" },
  { id: "6", status: "critical" as const, x: 25, y: 45, label: "Omdurman West" },
  { id: "7", status: "warning" as const, x: 15, y: 35, label: "Karari Sector" },
  { id: "8", status: "safe" as const, x: 75, y: 45, label: "Burri District" },
];

// Initial signals - Khartoum locations
const initialSignals: Signal[] = [
  { id: "1", time: "10:42 AM", type: "BROKEN", location: "Bahri Central", coords: [15.60, 32.53], source: "SMS" },
  { id: "2", time: "10:38 AM", type: "DIRTY", location: "Omdurman Souq", coords: [15.64, 32.48], source: "SENSOR" },
  { id: "3", time: "10:35 AM", type: "OUTAGE", location: "Omdurman West", coords: [15.65, 32.45], source: "SATELLITE" },
  { id: "4", time: "10:30 AM", type: "RESTORED", location: "Al-Riyadh Block 4", coords: [15.55, 32.55], source: "FIELD" },
  { id: "5", time: "10:25 AM", type: "BROKEN", location: "Khartoum Central", coords: [15.58, 32.53], source: "SMS" },
  { id: "6", time: "10:20 AM", type: "DIRTY", location: "Karari Sector", coords: [15.68, 32.47], source: "SMS" },
];

// Sample locations for simulation - Khartoum neighborhoods
const sampleLocations = [
  "Bahri Central",
  "Omdurman Souq",
  "Al-Riyadh Block 4",
  "Burri District",
  "Khartoum Central",
  "Shambat Area",
  "Kalakla South",
  "Jabra Industrial",
];

const clusterDataMap: Record<string, { location: string; block: string; severity: string; reports: number; lastReport: string }> = {
  "1": { location: "Bahri", block: "Central District", severity: "CRITICAL", reports: 52, lastReport: "2 min ago" },
  "2": { location: "Omdurman", block: "Souq Area", severity: "HIGH", reports: 24, lastReport: "12 min ago" },
  "3": { location: "Al-Riyadh", block: "Block 4", severity: "STABLE", reports: 8, lastReport: "45 min ago" },
  "4": { location: "Khartoum", block: "Central", severity: "MEDIUM", reports: 15, lastReport: "20 min ago" },
  "6": { location: "Omdurman", block: "West Sector", severity: "CRITICAL", reports: 38, lastReport: "5 min ago" },
};

export default function Index() {
  const [clusters, setClusters] = useState(initialClusters);
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isPowerCrisis, setIsPowerCrisis] = useState(false);
  const [layers, setLayers] = useState({
    satellite: true,
    smsReports: true,
    waterPipelines: true,
  });

  // Global Sync: Poll backend for new messages every 5 seconds
  useEffect(() => {
    let backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";
    if (backendUrl && !backendUrl.startsWith("http")) {
      backendUrl = `https://${backendUrl}`;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${backendUrl}/messages?limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        const enriched = data.map((msg: any, idx: number) => ({
          id: msg.id || (msg.timestamp + idx),
          time: new Date(msg.timestamp).toLocaleTimeString(),
          type: msg.signal_type as any,
          location: msg.location || "Unknown Sector",
          coords: msg.coords || [15.58, 32.53],
          source: msg.from === "demo" ? "FIELD" : "SMS",
          body: msg.body,
          priority: msg.priority,
          action: msg.action,
        }));
        setSignals((prev) => {
          const existing = new Set(prev.map((s) => s.id));
          const newMsgs = enriched.filter((m: any) => !existing.has(m.id));
          if (newMsgs.length === 0) return prev;

          // Trigger toast for new reports
          newMsgs.forEach((m: any) => {
            if (m.type === "SOS" || m.priority > 90) {
              toast.error(`URGENT: ${m.type} at ${m.location}`, {
                description: m.action
              });
            }
          });

          return [...newMsgs, ...prev].slice(0, 50);
        });
      } catch (e) {
        console.error("Polling error:", e);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = clusters.filter(c => c.status === "critical").length;
  const warningCount = clusters.filter(c => c.status === "warning").length;
  const safeCount = clusters.filter(c => c.status === "safe").length;

  const handleLayerToggle = useCallback((layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleClusterClick = useCallback((id: string) => {
    const cluster = clusters.find(c => c.id === id);
    if (cluster?.status === "critical") {
      setSelectedCluster(id);
      setIsModalOpen(true);
    } else {
      setSelectedCluster(id);
    }
  }, [clusters]);

  const handleSimulateReport = useCallback(() => {
    const types: Signal["type"][] = ["DIRTY", "BROKEN", "OUTAGE", "RESTORED"];
    const sources: Signal["source"][] = ["SMS", "SENSOR", "SATELLITE", "FIELD"];

    const newSignal: Signal = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: types[Math.floor(Math.random() * types.length)],
      location: sampleLocations[Math.floor(Math.random() * sampleLocations.length)],
      coords: [15.58, 32.53], // Default static for simulation
      source: sources[Math.floor(Math.random() * sources.length)],
    };

    setSignals(prev => [newSignal, ...prev].slice(0, 20));
    toast.success("New report received", {
      description: `${newSignal.type} at ${newSignal.location}`,
    });
  }, []);

  const handleTriggerPowerCrisis = useCallback(() => {
    setClusters(prev => prev.map(c =>
      c.id === "3" ? { ...c, status: "critical" as const } : c
    ));
    setIsPowerCrisis(true);
    toast.error("INFRASTRUCTURE CRISIS VERIFIED", {
      description: "Confidence Score: 96% | Satellite Layer: Zero-Lumen Zone Detected.",
    });
  }, []);

  const handleTriggerSOS = useCallback(() => {
    setIsSOSActive(true);
    toast.error("HUMANITARIAN ALERT: UNICEF", {
      description: "Bypassing validation filter. Immediate action for Water Contamination.",
    });
    // Auto-clear SOS after 10 seconds for demo reset
    setTimeout(() => setIsSOSActive(false), 10000);
  }, []);

  const handleDispatchElectrical = useCallback(() => {
    toast.success("Electrical Repair Team Dispatched", {
      description: "ETA: 45 minutes • Team Alpha-7 en route",
    });
  }, []);

  const handleDispatchWater = useCallback(() => {
    toast.success("Water Tanker Dispatched", {
      description: "ETA: 30 minutes • 10,000L capacity",
    });
  }, []);

  const selectedClusterData = selectedCluster ? clusterDataMap[selectedCluster] || null : null;
  const confidenceScore = isPowerCrisis && selectedCluster === "3" ? 96 : selectedCluster === "1" ? 92 : selectedCluster === "2" ? 87 : 65;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* SOS Siren Overlay */}
      {isSOSActive && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-red-500/10 animate-pulse border-[20px] border-red-600/30">
          <div className="bg-red-600 text-white p-8 rounded-full shadow-2xl animate-bounce flex flex-col items-center gap-4">
            <span className="text-6xl font-black">SOS</span>
            <span className="text-xl font-bold uppercase tracking-widest">Humanitarian Emergency</span>
          </div>
        </div>
      )}

      {/* Header */}
      <DashboardHeader
        criticalCount={criticalCount}
        warningCount={warningCount}
        safeCount={safeCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Live Signals */}
        <aside className="w-80 flex-shrink-0">
          <LiveSignalsFeed
            signals={signals}
            onSimulate={handleSimulateReport}
          />
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative">
          <LeafletMap
            signals={signals}
            clusters={clusters}
            selectedCluster={selectedCluster}
            onClusterClick={handleClusterClick}
            layers={layers}
          />

          {/* Layer Control - Bottom Left */}
          <div className="absolute bottom-20 left-4 z-[1100]">
            <LayerControl
              layers={layers}
              onToggle={handleLayerToggle}
            />
          </div>

          {/* Fusion Engine Widget - Top Right */}
          <div className="absolute top-4 right-4 z-[1100]">
            <FusionEngineWidget
              isActive={selectedCluster !== null && clusters.find(c => c.id === selectedCluster)?.status === "critical"}
              confidenceScore={confidenceScore}
              clusterLabel={clusters.find(c => c.id === selectedCluster)?.label}
            />
          </div>
        </main>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clusterData={selectedClusterData}
        onDispatchElectrical={handleDispatchElectrical}
        onDispatchWater={handleDispatchWater}
      />

      {/* Hidden Demo Controls */}
      <div className="absolute bottom-4 right-4 z-50 flex gap-2 opacity-5 hover:opacity-100 transition-opacity">
        <button
          onClick={handleTriggerPowerCrisis}
          className="bg-orange-600 text-[8px] p-1 rounded text-white"
        >
          [DEMO] Crisis Lock
        </button>
        <button
          onClick={handleTriggerSOS}
          className="bg-red-600 text-[8px] p-1 rounded text-white"
        >
          [DEMO] SOS Signal
        </button>
      </div>
    </div>
  );
}
