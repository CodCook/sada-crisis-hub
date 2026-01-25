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
      
      {/* Nile River Y-Shape visualization with flowing animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          {/* Gradient for White Nile */}
          <linearGradient id="whiteNileGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(190 70% 40%)" />
            <stop offset="100%" stopColor="hsl(200 80% 55%)" />
          </linearGradient>
          
          {/* Gradient for Blue Nile */}
          <linearGradient id="blueNileGradient" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(220 80% 35%)" />
            <stop offset="100%" stopColor="hsl(210 90% 50%)" />
          </linearGradient>
          
          {/* Gradient for Main Nile */}
          <linearGradient id="mainNileGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(205 85% 50%)" />
            <stop offset="100%" stopColor="hsl(200 75% 45%)" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="nileGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Animated flow pattern */}
          <pattern id="flowPattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <rect width="2" height="4" fill="hsl(200 80% 60%)" opacity="0.3">
              <animate attributeName="x" from="0" to="4" dur="0.8s" repeatCount="indefinite" />
            </rect>
          </pattern>
        </defs>
        
        {/* White Nile - river bed (wider, dimmer) */}
        <path
          d="M 5 85 Q 15 70, 25 60 Q 35 50, 45 45"
          stroke="hsl(190 60% 25%)"
          strokeWidth="4"
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
        />
        
        {/* White Nile - main flow */}
        <path
          d="M 5 85 Q 15 70, 25 60 Q 35 50, 45 45"
          stroke="url(#whiteNileGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          filter="url(#nileGlow)"
          strokeLinecap="round"
          className="nile-flow-white"
        />
        
        {/* White Nile - animated particles */}
        <circle r="0.8" fill="hsl(190 80% 70%)" opacity="0.8">
          <animateMotion dur="4s" repeatCount="indefinite" path="M 5 85 Q 15 70, 25 60 Q 35 50, 45 45" />
        </circle>
        <circle r="0.5" fill="hsl(190 70% 60%)" opacity="0.6">
          <animateMotion dur="4s" repeatCount="indefinite" begin="1.3s" path="M 5 85 Q 15 70, 25 60 Q 35 50, 45 45" />
        </circle>
        <circle r="0.6" fill="hsl(190 75% 65%)" opacity="0.7">
          <animateMotion dur="4s" repeatCount="indefinite" begin="2.6s" path="M 5 85 Q 15 70, 25 60 Q 35 50, 45 45" />
        </circle>
        
        {/* Blue Nile - river bed (wider, dimmer) */}
        <path
          d="M 95 75 Q 80 65, 70 55 Q 58 48, 45 45"
          stroke="hsl(220 60% 20%)"
          strokeWidth="4"
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
        />
        
        {/* Blue Nile - main flow */}
        <path
          d="M 95 75 Q 80 65, 70 55 Q 58 48, 45 45"
          stroke="url(#blueNileGradient)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.7"
          filter="url(#nileGlow)"
          strokeLinecap="round"
          className="nile-flow-blue"
        />
        
        {/* Blue Nile - animated particles */}
        <circle r="0.9" fill="hsl(210 85% 65%)" opacity="0.9">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M 95 75 Q 80 65, 70 55 Q 58 48, 45 45" />
        </circle>
        <circle r="0.6" fill="hsl(215 80% 55%)" opacity="0.7">
          <animateMotion dur="3.5s" repeatCount="indefinite" begin="1.2s" path="M 95 75 Q 80 65, 70 55 Q 58 48, 45 45" />
        </circle>
        <circle r="0.7" fill="hsl(210 75% 60%)" opacity="0.8">
          <animateMotion dur="3.5s" repeatCount="indefinite" begin="2.3s" path="M 95 75 Q 80 65, 70 55 Q 58 48, 45 45" />
        </circle>
        
        {/* Main Nile - river bed (wider, dimmer) */}
        <path
          d="M 45 45 Q 48 35, 50 25 Q 52 15, 55 5"
          stroke="hsl(205 50% 20%)"
          strokeWidth="5"
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
        />
        
        {/* Main Nile - main flow */}
        <path
          d="M 45 45 Q 48 35, 50 25 Q 52 15, 55 5"
          stroke="url(#mainNileGradient)"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
          filter="url(#nileGlow)"
          strokeLinecap="round"
          className="nile-flow-main"
        />
        
        {/* Main Nile - animated particles */}
        <circle r="1" fill="hsl(205 80% 65%)" opacity="0.9">
          <animateMotion dur="3s" repeatCount="indefinite" path="M 45 45 Q 48 35, 50 25 Q 52 15, 55 5" />
        </circle>
        <circle r="0.7" fill="hsl(200 75% 55%)" opacity="0.7">
          <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M 45 45 Q 48 35, 50 25 Q 52 15, 55 5" />
        </circle>
        <circle r="0.8" fill="hsl(205 70% 60%)" opacity="0.8">
          <animateMotion dur="3s" repeatCount="indefinite" begin="2s" path="M 45 45 Q 48 35, 50 25 Q 52 15, 55 5" />
        </circle>
        
        {/* Confluence point - outer glow rings */}
        <circle cx="45" cy="45" r="8" fill="none" stroke="hsl(200 80% 50%)" strokeWidth="0.3" opacity="0.2">
          <animate attributeName="r" values="5;10;5" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="45" cy="45" r="6" fill="none" stroke="hsl(200 85% 55%)" strokeWidth="0.4" opacity="0.3">
          <animate attributeName="r" values="4;8;4" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        
        {/* Confluence point - core glow */}
        <circle cx="45" cy="45" r="4" fill="hsl(200 80% 50%)" opacity="0.15" />
        <circle cx="45" cy="45" r="2.5" fill="hsl(200 85% 55%)" opacity="0.25">
          <animate attributeName="opacity" values="0.25;0.4;0.25" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="45" cy="45" r="1.2" fill="hsl(200 90% 70%)" opacity="0.6">
          <animate attributeName="r" values="1;1.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        {/* Confluence label */}
        <text x="45" y="52" textAnchor="middle" fill="hsl(200 70% 60%)" fontSize="2" fontFamily="monospace" opacity="0.7">
          CONFLUENCE
        </text>
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
