import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";
import { Signal } from "./LiveSignalsFeed";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Cluster {
    id: string;
    status: "critical" | "warning" | "safe";
    x: number;
    y: number;
    label: string;
}

interface LeafletMapProps {
    signals: Signal[];
    clusters: Cluster[];
    selectedCluster: string | null;
    onClusterClick: (id: string) => void;
    layers: {
        satellite: boolean;
        smsReports: boolean;
        waterPipelines: boolean;
    };
}

const KHARTOUM_CENTER: [number, number] = [15.589, 32.535];

function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export function LeafletMap({ signals, clusters, selectedCluster, onClusterClick, layers }: LeafletMapProps) {
    // Map our clusters (districts) to real coordinates
    const districtCoords: Record<string, [number, number]> = {
        "Bahri Central": [15.60, 32.53],
        "Omdurman Souq": [15.64, 32.48],
        "Al-Riyadh Block 4": [15.55, 32.55],
        "Khartoum Central": [15.589, 32.535],
        "Soba Industrial": [15.52, 32.62],
        "Omdurman West": [15.65, 32.45],
        "Karari Sector": [15.68, 32.47],
        "Burri District": [15.575, 32.560],
    };

    return (
        <div className="relative w-full h-full bg-[#0a0f14] overflow-hidden">
            <MapContainer
                center={KHARTOUM_CENTER}
                zoom={12}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Static Districts / Clusters Status */}
                {clusters.map((cluster) => {
                    const coords = districtCoords[cluster.label] || [KHARTOUM_CENTER[0] + (cluster.x / 1000), KHARTOUM_CENTER[1] + (cluster.y / 1000)];
                    return (
                        <Circle
                            key={cluster.id}
                            center={coords}
                            radius={800}
                            pathOptions={{
                                color: cluster.status === "critical" ? "#ea384c" : cluster.status === "warning" ? "#f59e0b" : "#10b981",
                                fillColor: cluster.status === "critical" ? "#ea384c" : cluster.status === "warning" ? "#f59e0b" : "#10b981",
                                fillOpacity: 0.3,
                                weight: 2
                            }}
                        >
                            <Popup>
                                <div className="font-bold text-xs uppercase">{cluster.label}</div>
                                <div className="text-[10px] text-muted-foreground uppercase opacity-70">Sector Status: {cluster.status}</div>
                            </Popup>
                        </Circle>
                    );
                })}

                {/* Dynamic Signals from Backend */}
                {layers.smsReports && signals.map((signal) => (
                    <Marker
                        key={signal.id}
                        position={signal.coords}
                        eventHandlers={{
                            click: () => onClusterClick(signal.id),
                        }}
                    >
                        <Popup className="crisis-popup">
                            <div className="p-2">
                                <h3 className="font-bold text-sm">#{signal.type} Report</h3>
                                <p className="text-xs text-muted-foreground">{signal.location}</p>
                                <div className="mt-2 text-xs">
                                    <span className="font-mono">Priority: {signal.priority}%</span>
                                </div>
                            </div>
                        </Popup>

                        {/* Pulsing effect for SOS/Critical */}
                        {(signal.type === "SOS" || (signal.priority && signal.priority > 80)) && (
                            <Circle
                                center={signal.coords}
                                radius={500}
                                pathOptions={{
                                    color: signal.type === "SOS" ? '#ea384c' : '#f59e0b',
                                    fillColor: signal.type === "SOS" ? '#ea384c' : '#f59e0b',
                                    fillOpacity: 0.2,
                                    className: 'animate-pulse'
                                }}
                            />
                        )}
                    </Marker>
                ))}

                {/* Water Pipelines Layer - Realistic Khartoum Grid */}
                {layers.waterPipelines && (
                    <>
                        {/* Main Arteries */}
                        <Polyline
                            positions={[
                                [15.62, 32.54], // Bahri North
                                [15.60, 32.53], // Bahri Central
                                [15.589, 32.535], // Khartoum Central
                                [15.52, 32.53], // Jabra
                                [15.48, 32.51], // Kalakla
                            ]}
                            pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.6, lineCap: 'round' }}
                        />
                        <Polyline
                            positions={[
                                [15.589, 32.535], // Khartoum Central
                                [15.55, 32.55], // Riyadh
                                [15.575, 32.56], // Burri
                            ]}
                            pathOptions={{ color: '#0ea5e9', weight: 3, opacity: 0.5 }}
                        />
                        <Polyline
                            positions={[
                                [15.589, 32.535], // Khartoum Central
                                [15.635, 32.485], // Omdurman Souq
                                [15.65, 32.45], // Omdurman West
                                [15.68, 32.47], // Karari
                            ]}
                            pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
                        />
                        {/* Connecting Nodes (Pulsing blue dots) */}
                        <Circle center={[15.589, 32.535]} radius={150} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 1 }} className="animate-pulse" />
                        <Circle center={[15.60, 32.53]} radius={150} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 1 }} className="animate-pulse" />
                        <Circle center={[15.635, 32.485]} radius={150} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 1 }} className="animate-pulse" />
                        <Circle center={[15.55, 32.55]} radius={120} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.7, weight: 1 }} className="animate-pulse" />
                    </>
                )}
            </MapContainer>

            {/* Map Overlay Elements (HUD) */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded bg-surface-glass/80 border border-border pointer-events-none">
                <span className="text-xs font-mono text-muted-foreground tracking-tighter">SADA GIS • LIVE_INTEL_STREAM</span>
            </div>

            <div className="absolute top-4 right-1/2 translate-x-1/2 z-[1000] px-4 py-2 rounded bg-surface-glass/80 border border-border pointer-events-none">
                <span className="text-sm font-semibold text-foreground">Operational Zone: Greater Khartoum</span>
            </div>
        </div>
    );
}
