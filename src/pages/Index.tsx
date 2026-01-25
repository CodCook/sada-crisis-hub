import { useState, useCallback } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LiveSignalsFeed, Signal } from "@/components/dashboard/LiveSignalsFeed";
import { MapPlaceholder } from "@/components/dashboard/MapPlaceholder";
import { LayerControl } from "@/components/dashboard/LayerControl";
import { FusionEngineWidget } from "@/components/dashboard/FusionEngineWidget";
import { ActionModal } from "@/components/dashboard/ActionModal";

// Initial cluster data
const initialClusters = [
  { id: "1", status: "critical" as const, x: 35, y: 30, label: "Al-Riyadh Block 4" },
  { id: "2", status: "critical" as const, x: 58, y: 45, label: "Bahri District 7" },
  { id: "3", status: "warning" as const, x: 25, y: 55, label: "Omdurman West" },
  { id: "4", status: "warning" as const, x: 70, y: 35, label: "Khartoum North 3" },
  { id: "5", status: "safe" as const, x: 45, y: 65, label: "Soba Industrial" },
  { id: "6", status: "safe" as const, x: 80, y: 60, label: "Airport Zone" },
  { id: "7", status: "warning" as const, x: 15, y: 40, label: "Karari Sector" },
  { id: "8", status: "safe" as const, x: 65, y: 75, label: "New Khartoum" },
];

// Initial signals
const initialSignals: Signal[] = [
  { id: "1", time: "10:42 AM", type: "BROKEN", location: "Al-Riyadh Block 4", source: "SMS" },
  { id: "2", time: "10:38 AM", type: "DIRTY", location: "Bahri District 7", source: "SENSOR" },
  { id: "3", time: "10:35 AM", type: "OUTAGE", location: "Omdurman West", source: "SATELLITE" },
  { id: "4", time: "10:30 AM", type: "RESTORED", location: "Soba Industrial", source: "FIELD" },
  { id: "5", time: "10:25 AM", type: "BROKEN", location: "Khartoum North 3", source: "SMS" },
  { id: "6", time: "10:20 AM", type: "DIRTY", location: "Karari Sector", source: "SMS" },
];

// Sample locations for simulation
const sampleLocations = [
  "Al-Sahafa Block 2",
  "Burri District",
  "Arkawit Sector 5",
  "Jabra Industrial",
  "Al-Amarat Block 1",
  "Riyadh Extension",
  "Kalakla South",
  "Shambat Area",
];

const clusterDataMap: Record<string, { location: string; block: string; severity: string; reports: number; lastReport: string }> = {
  "1": { location: "Al-Riyadh", block: "Block 4", severity: "CRITICAL", reports: 52, lastReport: "2 min ago" },
  "2": { location: "Bahri", block: "District 7", severity: "CRITICAL", reports: 38, lastReport: "5 min ago" },
  "3": { location: "Omdurman", block: "West Sector", severity: "HIGH", reports: 24, lastReport: "12 min ago" },
  "4": { location: "Khartoum North", block: "Sector 3", severity: "MEDIUM", reports: 15, lastReport: "20 min ago" },
};

export default function Index() {
  const [clusters] = useState(initialClusters);
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [layers, setLayers] = useState({
    satellite: true,
    smsReports: true,
    waterPipelines: false,
  });

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
      source: sources[Math.floor(Math.random() * sources.length)],
    };

    setSignals(prev => [newSignal, ...prev].slice(0, 20));
    toast.success("New report received", {
      description: `${newSignal.type} at ${newSignal.location}`,
    });
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
  const confidenceScore = selectedCluster === "1" ? 92 : selectedCluster === "2" ? 87 : 65;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
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
          <MapPlaceholder 
            clusters={clusters}
            selectedCluster={selectedCluster}
            onClusterClick={handleClusterClick}
            layers={layers}
          />

          {/* Layer Control - Bottom Left */}
          <div className="absolute bottom-20 left-4 z-20">
            <LayerControl 
              layers={layers}
              onToggle={handleLayerToggle}
            />
          </div>

          {/* Fusion Engine Widget - Top Right */}
          <div className="absolute top-4 right-4 z-20">
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
    </div>
  );
}
