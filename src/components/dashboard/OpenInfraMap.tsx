import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Khartoum center coordinates
const KHARTOUM_CENTER: [number, number] = [32.535, 15.589]; // [lng, lat] for MapLibre

interface Signal {
    id: string;
    type: string;
    location: string;
    coords: [number, number];
    source: string;
    time: string;
}

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

interface OpenInfraMapProps {
    className?: string;
    layers?: {
        waterPipelines: boolean;
        electricity: boolean;
        powerPlants: boolean;
        telecoms: boolean;
        petroleum: boolean;
    };
    signals?: Signal[];
    events?: Event[];
    onEventClick?: (event: Event) => void;
}

export function OpenInfraMap({ className = "w-full h-full", layers, signals = [], events = [], onEventClick }: OpenInfraMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const eventMarkersRef = useRef<maplibregl.Marker[]>([]);

    // Update Event Markers (Clusters)
    useEffect(() => {
        if (!map.current) return;

        // Clear existing event markers
        eventMarkersRef.current.forEach(marker => marker.remove());
        eventMarkersRef.current = [];

        events.forEach(event => {
            const el = document.createElement('div');
            // Larger, more prominent pulsing markers
            el.className = 'w-12 h-12 rounded-full border-4 border-white shadow-2xl cursor-pointer flex items-center justify-center transition-transform hover:scale-110';

            if (event.severity === 'critical') {
                el.classList.add('bg-red-600', 'animate-pulse');
            } else if (event.severity === 'warning') {
                el.classList.add('bg-orange-500');
            } else {
                el.classList.add('bg-blue-500');
            }

            // Larger icon inside
            el.innerHTML = '<span class="text-white font-bold text-lg">⚠</span>';

            // Click handler to open side panel
            el.addEventListener('click', () => {
                if (onEventClick) {
                    onEventClick(event);
                }
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([event.coords[1], event.coords[0]]) // [lng, lat]
                .addTo(map.current!);

            eventMarkersRef.current.push(marker);
        });

    }, [events, onEventClick]);

    // Update Signal Markers
    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        signals.forEach(signal => {
            const el = document.createElement('div');
            el.className = 'w-4 h-4 rounded-full border border-white shadow-lg cursor-pointer transform hover:scale-125 transition-transform';

            // Color coding based on type
            let colorClass = 'bg-blue-500';
            if (signal.type === 'SOS' || signal.type === 'CRITICAL' || signal.type === 'AID') colorClass = 'bg-red-600 animate-pulse';
            else if (signal.type === 'BROKEN' || signal.type === 'OUTAGE' || signal.type === 'POWER') colorClass = 'bg-orange-500';
            else if (signal.type === 'DIRTY' || signal.type === 'WARNING' || signal.type === 'WATER') colorClass = 'bg-yellow-500';
            else if (signal.type === 'RESTORED' || signal.type === 'SAFE') colorClass = 'bg-green-500';

            el.classList.add(...colorClass.split(' '));

            // Create marker
            // Note: signal.coords is [lat, lng], MapLibre expects [lng, lat]
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([signal.coords[1], signal.coords[0]])
                .setPopup(new maplibregl.Popup({ offset: 10, closeButton: false })
                    .setHTML(`
                        <div class="px-2 py-1 text-black">
                            <div class="font-bold text-xs">${signal.type}</div>
                            <div class="text-[10px] opacity-75">${signal.location}</div>
                            <div class="text-[10px] opacity-50">${signal.time}</div>
                        </div>
                    `))
                .addTo(map.current!);

            markersRef.current.push(marker);
        });
    }, [signals]);

    // Toggle layers when props change
    useEffect(() => {
        if (!map.current || !layers) return;
        const m = map.current;

        if (!m.getStyle()) return;

        // Water
        const waterLayers = ['water-pipeline'];
        waterLayers.forEach(id => {
            if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', layers.waterPipelines ? 'visible' : 'none');
        });

        // Electricity (Grid)
        const eleLayers = ['power-line', 'power-substation', 'power-tower'];
        eleLayers.forEach(id => {
            if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', layers.electricity ? 'visible' : 'none');
        });

        // Power Plants
        const plantLayers = ['power-plant', 'power-plant-point', 'power-generator', 'power-solar'];
        plantLayers.forEach(id => {
            if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', layers.powerPlants ? 'visible' : 'none');
        });

        // Telecoms
        const telLayers = ['telecoms-line', 'telecoms-mast', 'telecoms-datacenter'];
        telLayers.forEach(id => {
            if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', layers.telecoms ? 'visible' : 'none');
        });

        // Petroleum
        const petLayers = ['petroleum-pipeline', 'petroleum-site', 'petroleum-well'];
        petLayers.forEach(id => {
            if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', layers.petroleum ? 'visible' : 'none');
        });

    }, [layers]);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                name: "OpenInfraMap",
                sources: {
                    // OpenStreetMap base layer
                    osm: {
                        type: "raster",
                        tiles: [
                            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        ],
                        tileSize: 256,
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    },
                    // OpenInfraMap vector tiles
                    openinframap: {
                        type: "vector",
                        url: "https://openinframap.org/map.json"
                    }
                },
                layers: [
                    // Base map layer
                    {
                        id: "osm-base",
                        type: "raster",
                        source: "osm",
                        minzoom: 0,
                        maxzoom: 19
                    },
                    // Power lines
                    {
                        id: "power-line",
                        type: "line",
                        source: "openinframap",
                        "source-layer": "power_line",
                        paint: {
                            "line-color": "#ff6600",
                            "line-width": 2,
                            "line-opacity": 0.8
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Power substations
                    {
                        id: "power-substation",
                        type: "fill",
                        source: "openinframap",
                        "source-layer": "power_substation",
                        paint: {
                            "fill-color": "#ff9900",
                            "fill-opacity": 0.5,
                            "fill-outline-color": "#ff6600"
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Power towers/poles
                    {
                        id: "power-tower",
                        type: "circle",
                        source: "openinframap",
                        "source-layer": "power_tower",
                        paint: {
                            "circle-color": "#ff6600",
                            "circle-radius": 3,
                            "circle-opacity": 0.8
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Power Plants (Polygon)
                    {
                        id: "power-plant",
                        type: "fill",
                        source: "openinframap",
                        "source-layer": "power_plant",
                        paint: {
                            "fill-color": "#ff3333",
                            "fill-opacity": 0.5,
                            "fill-outline-color": "#cc0000"
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Power Plants (Points)
                    {
                        id: "power-plant-point",
                        type: "circle",
                        source: "openinframap",
                        "source-layer": "power_plant_point",
                        paint: {
                            "circle-color": "#ff3333",
                            "circle-radius": 5,
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#fff"
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Power Generators
                    {
                        id: "power-generator",
                        type: "fill",
                        source: "openinframap",
                        "source-layer": "power_generator",
                        paint: {
                            "fill-color": "#ff3333",
                            "fill-opacity": 0.4
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Solar Heatmap
                    {
                        id: "power-solar",
                        type: "circle",
                        source: "openinframap",
                        "source-layer": "power_heatmap_solar",
                        paint: {
                            "circle-color": "#ffd700",
                            "circle-radius": 4,
                            "circle-opacity": 0.6
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Telecoms Lines
                    {
                        id: "telecoms-line",
                        type: "line",
                        source: "openinframap",
                        "source-layer": "telecoms_communication_line",
                        paint: {
                            "line-color": "#8a2be2", // BlueViolet
                            "line-width": 1.5,
                            "line-opacity": 0.8
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Telecoms Masts/Towers
                    {
                        id: "telecoms-mast",
                        type: "circle",
                        source: "openinframap",
                        "source-layer": "telecoms_mast",
                        paint: {
                            "circle-color": "#8a2be2",
                            "circle-radius": 3
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Telecoms Datacenters
                    {
                        id: "telecoms-datacenter",
                        type: "fill",
                        source: "openinframap",
                        "source-layer": "telecoms_data_center",
                        paint: {
                            "fill-color": "#9400d3",
                            "fill-opacity": 0.5
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Petroleum Pipelines
                    {
                        id: "petroleum-pipeline",
                        type: "line",
                        source: "openinframap",
                        "source-layer": "petroleum_pipeline",
                        paint: {
                            "line-color": "#4a4a4a", // Dark Grey
                            "line-width": 2,
                            "line-dasharray": [2, 1],
                            "line-opacity": 0.8
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Petroleum Sites/Wells
                    {
                        id: "petroleum-site",
                        type: "fill",
                        source: "openinframap",
                        "source-layer": "petroleum_site",
                        paint: {
                            "fill-color": "#2f4f4f",
                            "fill-opacity": 0.5
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Petroleum Wells
                    {
                        id: "petroleum-well",
                        type: "circle",
                        source: "openinframap",
                        "source-layer": "petroleum_well",
                        paint: {
                            "circle-color": "#2f4f4f",
                            "circle-radius": 3,
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#fff"
                        },
                        layout: { "visibility": "visible" }
                    },
                    // Water pipelines (Original)
                    {
                        id: "water-pipeline",
                        type: "line",
                        source: "openinframap",
                        "source-layer": "water_pipeline",
                        paint: {
                            "line-color": "#0066ff",
                            "line-width": 3,
                            "line-opacity": 0.8
                        },
                        layout: { "visibility": "visible" }
                    }
                ]
            },
            center: KHARTOUM_CENTER,
            zoom: 11
        });

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Apply initial visibility from props if map loads late
        map.current.on('load', () => {
            // Logic repeated here or handle via useEffect dependency on map.current
            // Since useEffect runs when map.current is set, it might be safer to trigger a state update
            // but here we just let the useEffect[layers] handle it if layers change.
            // Ideally we should apply initial state here.
        });

        return () => {
            map.current?.remove();
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-4 right-1/2 translate-x-1/2 z-10 px-4 py-2 rounded bg-black/70 border border-white/20 pointer-events-none">
                <span className="text-sm font-semibold text-white">Operational Zone: Greater Khartoum (Omdurman)</span>
            </div>
        </div>
    );
}

export default OpenInfraMap;
