import { Polyline, Circle, Popup } from "react-leaflet";

export function ElectricityLayer() {
    return (
        <>
            {/* High Voltage Transmission Lines - Yellow/Orange */}
            <Polyline
                positions={[
                    [15.65, 32.55], // North Bahri Substation
                    [15.60, 32.53], // Bahri Central
                    [15.55, 32.52], // Khartoum Central
                ]}
                pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8 }}
            />
            <Polyline
                positions={[
                    [15.55, 32.52], // Khartoum Central
                    [15.50, 32.48], // South Khartoum
                ]}
                pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8 }}
            />
            {/* Omdurman Grid (Damaged) */}
            <Polyline
                positions={[
                    [15.60, 32.53], // Bahri
                    [15.64, 32.48], // Omdurman
                ]}
                pathOptions={{ color: '#ef4444', weight: 3, opacity: 0.8, dashArray: '5, 10' }} // Red dashed = Damaged
            />

            {/* Substations */}
            <Circle
                center={[15.65, 32.55]}
                radius={300}
                pathOptions={{ color: '#f59e0b', fillColor: '#10b981', fillOpacity: 0.9, weight: 2 }}
            >
                <Popup>Bahri North Substation: ACTIVE</Popup>
            </Circle>

            <Circle
                center={[15.55, 32.52]}
                radius={400}
                pathOptions={{ color: '#f59e0b', fillColor: '#10b981', fillOpacity: 0.9, weight: 2 }}
            >
                <Popup>Khartoum Central Grid: ACTIVE</Popup>
            </Circle>

            <Circle
                center={[15.64, 32.48]}
                radius={300}
                pathOptions={{ color: '#ef4444', fillColor: '#3f3f46', fillOpacity: 0.9, weight: 2 }}
            >
                <Popup>Omdurman Substation: OFFLINE</Popup>
            </Circle>
        </>
    );
}
