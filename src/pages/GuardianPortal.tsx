import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
    id: string;
    title: string;
    type: string;
    severity: string;
    confidence: number;
    location: string;
    timestamp: string;
    status: string;
}

export default function GuardianPortal() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";
            if (backendUrl && !backendUrl.startsWith("http")) {
                backendUrl = `http://${backendUrl}`;
            }
            const res = await fetch(`${backendUrl}/events`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Connection Failed. Offline Mode Active.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            let backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";
            if (backendUrl && !backendUrl.startsWith("http")) {
                backendUrl = `http://${backendUrl}`;
            }
            const res = await fetch(`${backendUrl}/verify_event/${id}`, { method: "POST" });
            const data = await res.json();
            if (data.status === "success") {
                toast.success("Event Verified via Guardian Node");
                fetchEvents();
            } else {
                toast.error("Verification Failed");
            }
        } catch (e) {
            toast.error("Failed to sync verification.");
        }
    };

    useEffect(() => {
        fetchEvents();
        // Poll less frequently for low bandwidth (e.g. 10s)
        const interval = setInterval(fetchEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    // Categorize
    const criticalEvents = events.filter(e => e.severity === "critical");
    const warningEvents = events.filter(e => e.severity === "warning");

    return (
        <div className="min-h-screen bg-slate-50 font-mono text-sm p-4 max-w-md mx-auto">
            {/* Header - Minimalist */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                    <Link to="/" className="p-1 hover:bg-slate-200 rounded">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">SADA GUARDIAN</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-xs text-slate-500">Node Active</span>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2"
                    onClick={fetchEvents}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? "Syncing..." : "Sync Feeds"}
                </Button>
            </div>

            {/* Critical Feed */}
            <div className="mb-6">
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Priority Actions ({criticalEvents.length})
                </h2>
                <div className="space-y-3">
                    {criticalEvents.length === 0 && (
                        <p className="text-slate-400 italic">No critical actions required.</p>
                    )}
                    {criticalEvents.map(event => (
                        <Card key={event.id} className="border-l-4 border-l-red-500 shadow-sm">
                            <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-slate-900">{event.title}</div>
                                        <div className="text-xs text-slate-500">{event.location} • {new Date(event.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                        {Math.round(event.confidence * 100)}% Conf
                                    </Badge>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-9"
                                        onClick={() => handleVerify(event.id)}
                                        disabled={event.status === "verified"}
                                    >
                                        {event.status === "verified" ? (
                                            <><CheckCircle className="w-4 h-4 mr-2" /> Verified</>
                                        ) : "Confirm Report"}
                                    </Button>
                                    <Button variant="ghost" className="w-1/3 h-9 text-slate-500">Dismiss</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Warning Feed */}
            <div>
                <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-3">
                    Observation Log ({warningEvents.length})
                </h2>
                <div className="space-y-3 opacity-90">
                    {warningEvents.map(event => (
                        <div key={event.id} className="p-3 bg-white border border-slate-200 rounded">
                            <div className="flex justify-between">
                                <span className="font-semibold">{event.title}</span>
                                <span className="text-orange-500 text-xs font-bold">{Math.round(event.confidence * 100)}%</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{event.location}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                SADA NETWORK • GUARDIAN NODE ALPHA • LOW BANDWIDTH MODE
            </div>
        </div>
    );
}
