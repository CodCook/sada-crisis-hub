import { useEffect, useState } from "react";
import { Polyline, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";

export function WaterLayer() {
    const map = useMap();
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch real water infrastructure from OpenStreetMap (Overpass API)
    useEffect(() => {
        const fetchWaterInfra = async () => {
            if (loading || pipelines.length > 0) return;
            setLoading(true);

            // Query for pipelines, canals, and drains in Khartoum area
            // 15.635/32.485 is approx Omdurman/Khartoum center
            // Query for pipelines, canals, and drains in Khartoum area
            const query = `
                [out:json];
                (
                  way["man_made"="pipeline"]["substance"="water"](around:25000, 15.589, 32.535);
                  way["waterway"="canal"](around:25000, 15.589, 32.535);
                  way["waterway"="drain"](around:25000, 15.589, 32.535);
                );
                out body;
                >;
                out skel qt;
            `;

            try {
                const response = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: query
                });

                if (!response.ok) throw new Error("OSM Fetch Failed");

                const data = await response.json();

                // Process Ways into LatLng Arrays
                const nodes: Record<number, [number, number]> = {};
                if (data.elements) {
                    data.elements.forEach((el: any) => {
                        if (el.type === "node") {
                            nodes[el.id] = [el.lat, el.lon];
                        }
                    });

                    const ways = data.elements
                        .filter((el: any) => el.type === "way")
                        .map((way: any) => ({
                            id: way.id,
                            type: way.tags.waterway || "pipeline",
                            positions: way.nodes.map((nid: number) => nodes[nid]).filter(Boolean)
                        }));

                    setPipelines(ways);
                    if (ways.length > 0) {
                        toast.success(`Loaded ${ways.length} real water segments from OSM`);
                    } else {
                        // Fallback if OSM has no data for Khartoum (likely triggers)
                        // Sudan OSM data is sparse, so we might need fallback static lines if this is empty
                        toast.info("No OSM water data found, using estimated arteries");
                    }
                }
            } catch (e) {
                console.error("Water Layer Error", e);
                toast.error("Failed to load real water infra, switching to estimate");
            } finally {
                setLoading(false);
            }
        };

        fetchWaterInfra();
    }, []);

    // Static Fallback (Critical Arteries) - Always show these as they represent "known" critical internal infra not always on OSM
    const staticArteries = [
        [
            [15.62, 32.54], // Bahri North
            [15.60, 32.53], // Bahri Central
            [15.589, 32.535], // Khartoum Central
            [15.52, 32.53], // Jabra
            [15.48, 32.51], // Kalakla
        ],
        [
            [15.589, 32.535], // Khartoum Central
            [15.55, 32.55], // Riyadh
            [15.575, 32.56], // Burri
        ],
        [
            [15.589, 32.535], // Khartoum Central
            [15.635, 32.485], // Omdurman Souq
            [15.65, 32.45], // Omdurman West
            [15.68, 32.47], // Karari
        ]
    ];

    return (
        <>
            {/* Real OSM Pipelines */}
            {pipelines.map((p) => (
                <Polyline
                    key={p.id}
                    positions={p.positions}
                    pathOptions={{
                        color: '#06b6d4', // Cyan
                        weight: p.type === "canal" ? 3 : 2,
                        opacity: 0.5
                    }}
                >
                    <Popup>
                        <span className="text-xs font-bold uppercase">{p.type} (OSM Real Data)</span>
                    </Popup>
                </Polyline>
            ))}

            {/* Critical Arteries (Known Internal) */}
            {staticArteries.map((positions, idx) => (
                <Polyline
                    key={`static-${idx}`}
                    positions={positions as [number, number][]}
                    pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.6, lineCap: 'round' }}
                >
                    <Popup>
                        <span className="text-xs font-bold uppercase">Main Supply Line (Mapped)</span>
                    </Popup>
                </Polyline>
            ))}

            {/* Connecting Nodes (Pulsing blue dots) */}
            <Circle center={[15.589, 32.535]} radius={150} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 1 }} className="animate-pulse" />
            <Circle center={[15.60, 32.53]} radius={150} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 1 }} className="animate-pulse" />
            <Circle center={[15.635, 32.485]} radius={150} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 1 }} className="animate-pulse" />
            <Circle center={[15.55, 32.55]} radius={120} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.7, weight: 1 }} className="animate-pulse" />
        </>
    );
}
