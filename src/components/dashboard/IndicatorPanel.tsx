import { X } from "lucide-react";

interface Event {
    id: string;
    title: string;
    type: string;
    severity: string;
    confidence: number;
    location: string;
    coords: [number, number];
    proxy_details: Record<string, number>;
    status: string;
    timestamp: string;
}

interface IndicatorPanelProps {
    event: Event | null;
    onClose: () => void;
}

export function IndicatorPanel({ event, onClose }: IndicatorPanelProps) {
    if (!event) return null;

    const indicators = [
        { name: "VIIRS", label: "Satellite Night Lights", category: "Power" },
        { name: "GRID_GIS", label: "Grid Infrastructure", category: "Power" },
        { name: "WAPOR", label: "WAPOR", category: "Water" },
        { name: "FAO_AQUASTAT", label: "Water Stress Index", category: "Water" },
        { name: "HDX_HOT", label: "Infrastructure Damage", category: "Ground Truth" },
        { name: "HUMAN_REPORTS", label: "Crowd Reports", category: "Ground Truth" },
        { name: "WATER_GIS", label: "Pipeline Network", category: "Water" },
        { name: "SENTINEL_1", label: "Structural Integrity (SAR)", category: "Structure" },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-600';
            case 'warning': return 'bg-orange-500';
            default: return 'bg-blue-500';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-green-500';
        if (score >= 0.5) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-[2000] animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className={`${getSeverityColor(event.severity)} p-4 text-white`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="text-xs opacity-80 uppercase tracking-wider mb-1">
                            {event.status} • {Math.round(event.confidence * 100)}% Confidence
                        </div>
                        <h2 className="text-lg font-bold leading-tight">
                            {event.type.replace(/_/g, ' ').toUpperCase()}
                        </h2>
                        <div className="text-sm opacity-90 mt-1">
                            📍 {event.location}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto h-[calc(100%-140px)]">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Signal Authenticity Breakdown
                    </h3>
                    <div className="space-y-3">
                        {indicators.map((indicator) => {
                            const score = event.proxy_details?.[indicator.name];
                            const isActive = score !== undefined;

                            return (
                                <div
                                    key={indicator.name}
                                    className={`p-3 rounded-lg border transition-all ${isActive
                                        ? 'bg-card border-border shadow-sm'
                                        : 'bg-muted/30 border-transparent opacity-40'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="font-semibold text-sm">{indicator.label}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {indicator.category} • {indicator.name}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                                {Math.round(score * 100)}%
                                            </div>
                                        )}
                                    </div>
                                    {isActive && (
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${score >= 0.8 ? 'bg-green-500' :
                                                    score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${score * 100}%` }}
                                            />
                                        </div>
                                    )}
                                    {!isActive && (
                                        <div className="text-xs text-muted-foreground italic">
                                            No signal detected
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Analysis Summary */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-sm mb-2">Analysis Summary</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This incident was detected using {Object.keys(event.proxy_details || {}).length} independent
                        data sources. The combined confidence score of {Math.round(event.confidence * 100)}%
                        indicates a <strong>{event.severity}</strong> level event requiring{' '}
                        {event.severity === 'critical' ? 'immediate' : 'timely'} response.
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Dispatch Response Team
                </button>
            </div>
        </div>
    );
}
