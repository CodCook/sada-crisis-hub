import { Map } from "lucide-react";
import { ClusterDot } from "./ClusterDot";

interface Cluster {
  id: string;
  status: "critical" | "warning" | "safe";
  x: number;
  y: number;
  label: string;
}

interface MapPlaceholderProps {
  clusters: Cluster[];
  selectedCluster: string | null;
  onClusterClick: (id: string) => void;
  layers: {
    satellite: boolean;
    smsReports: boolean;
    waterPipelines: boolean;
  };
}

export function MapPlaceholder({ clusters, selectedCluster, onClusterClick, layers }: MapPlaceholderProps) {
  return (
    <div className="relative w-full h-full bg-[#0a0f14] overflow-hidden">
      {/* Khartoum map background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/011/324/668/original/khartoum-sudan-city-map-dark-mode-free-vector.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'hue-rotate(180deg) saturate(0.5)',
        }}
      />
      
      {/* Grid overlay for tactical look */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(217 33% 20%) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(217 33% 20%) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Nile River Y-Shape visualization */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* White Nile - coming from southwest */}
        <path
          d="M 5 80 Q 20 60, 45 45"
          stroke="hsl(200 80% 50%)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          className="animate-pulse"
        />
        {/* Blue Nile - coming from southeast */}
        <path
          d="M 95 70 Q 70 55, 45 45"
          stroke="hsl(210 90% 45%)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          className="animate-pulse"
        />
        {/* Main Nile - flowing north after confluence */}
        <path
          d="M 45 45 Q 50 30, 55 10"
          stroke="hsl(205 85% 48%)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          className="animate-pulse"
        />
        {/* Confluence point glow */}
        <circle
          cx="45"
          cy="45"
          r="3"
          fill="hsl(200 80% 50%)"
          opacity="0.3"
          className="animate-pulse"
        />
      </svg>

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline-overlay" />

      {/* Satellite layer effect */}
      {layers.satellite && (
        <div className="absolute inset-0 bg-gradient-to-br from-crisis-info/5 via-transparent to-crisis-safe/5 pointer-events-none" />
      )}

      {/* Water pipelines layer */}
      {layers.waterPipelines && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 10 50 Q 30 30, 50 50 T 90 50"
            stroke="hsl(var(--crisis-info))"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,2"
            opacity="0.4"
          />
          <path
            d="M 20 20 L 20 80"
            stroke="hsl(var(--crisis-info))"
            strokeWidth="0.3"
            fill="none"
            strokeDasharray="1,1"
            opacity="0.3"
          />
          <path
            d="M 60 10 L 60 60 Q 60 70, 70 70 L 90 70"
            stroke="hsl(var(--crisis-info))"
            strokeWidth="0.4"
            fill="none"
            strokeDasharray="2,2"
            opacity="0.4"
          />
        </svg>
      )}

      {/* SMS Reports heatmap effect */}
      {layers.smsReports && (
        <>
          <div 
            className="absolute w-32 h-32 rounded-full bg-crisis-warning/10 blur-3xl pointer-events-none"
            style={{ left: '35%', top: '25%' }}
          />
          <div 
            className="absolute w-24 h-24 rounded-full bg-crisis-critical/15 blur-2xl pointer-events-none"
            style={{ left: '55%', top: '40%' }}
          />
          <div 
            className="absolute w-20 h-20 rounded-full bg-crisis-warning/10 blur-2xl pointer-events-none"
            style={{ left: '25%', top: '60%' }}
          />
        </>
      )}

      {/* Map label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded bg-surface-glass/80 border border-border">
        <Map className="w-4 h-4 text-crisis-safe" />
        <span className="text-xs font-mono text-muted-foreground">KHARTOUM GRID • 32.5599°E, 15.5007°N</span>
      </div>

      {/* Region label */}
      <div className="absolute top-4 right-1/2 translate-x-1/2 px-4 py-2 rounded bg-surface-glass/80 border border-border">
        <span className="text-sm font-semibold text-foreground">Khartoum • Omdurman • Bahri</span>
        <span className="text-xs text-muted-foreground block text-center font-mono">NILE CONFLUENCE ZONE</span>
      </div>

      {/* Cluster dots */}
      {clusters.map((cluster) => (
        <ClusterDot
          key={cluster.id}
          status={cluster.status}
          x={cluster.x}
          y={cluster.y}
          label={cluster.label}
          isSelected={selectedCluster === cluster.id}
          onClick={() => onClusterClick(cluster.id)}
        />
      ))}

      {/* Scale bar */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="w-24 h-1 bg-foreground/50 rounded-full" />
        <span className="text-[10px] font-mono text-muted-foreground">5 km</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4 px-3 py-2 rounded bg-surface-glass/80 border border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-crisis-critical animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-crisis-warning" />
          <span className="text-[10px] text-muted-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-crisis-safe" />
          <span className="text-[10px] text-muted-foreground">Safe</span>
        </div>
      </div>
    </div>
  );
}
