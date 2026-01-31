from fastapi import FastAPI, Form, Response, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import uuid
from datetime import datetime
import random
import os
import asyncio
import json
import websockets
import requests
from dotenv import load_dotenv

# Import modular services
from models import Signal
from services.intelligence import IntelligenceEngine
from services.mock_data import MockDataGenerator

# Load environment variables from .env file
load_dotenv()

# Pushbullet Config
PUSHBULLET_API_KEY = os.getenv("PUSHBULLET_API_KEY")
PUSHBULLET_DEVICE_ID = os.getenv("PUSHBULLET_DEVICE_ID")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
engine = IntelligenceEngine()
mock_gen = MockDataGenerator()

def send_sms_via_pushbullet(to: str, message: str):
    if not PUSHBULLET_API_KEY or not PUSHBULLET_DEVICE_ID:
        print("Pushbullet skipping: Missing API Key or Device ID")
        return False
    try:
        url = "https://api.pushbullet.com/v2/texts"
        headers = {"Access-Token": PUSHBULLET_API_KEY}
        payload = {
            "data": {
                "addresses": [to],
                "message": message,
                "target_device_iden": PUSHBULLET_DEVICE_ID
            }
        }
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"Pushbullet SMS sent to {to}")
            return True
        else:
            print(f"Pushbullet failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Pushbullet error: {e}")
        return False

# --- Autonomous Monitoring & Verification Logic ---

async def simulate_verification(location: str, coords: list[float]):
    """
    Simulates a targeted satellite/sensor sweep triggered by a human report.
    Delays for effect, then generates corroborating data.
    """
    await asyncio.sleep(5) # Wait 5 seconds to simulate satellite tasking
    
    # 1. Check Nightlights (VIIRS)
    sat_signal = mock_gen.generate_satellite_nightlight(location, coords)
    engine.ingest_signal(sat_signal)
    
    # 2. Check Infrastructure Status (Grid)
    grid_signal = mock_gen.generate_grid_status(location, coords)
    engine.ingest_signal(grid_signal)

async def autonomous_monitoring_loop():
    """
    Background process that runs indefinitely to simulate the system
    finding issues on its own without human reports.
    """
    while True:
        await asyncio.sleep(20) # Sweep every 20 seconds
        
        # Pick a random location to "scan"
        loc_key = random.choice(list(LOCATIONS.keys()))
        loc_data = LOCATIONS[loc_key]
        
        # Randomly decide to check different indicators
        check_type = random.choice(["wapor", "viirs", "aquastat"])
        
        if check_type == "wapor":
            sig = mock_gen.generate_soil_moisture(loc_data["name"], loc_data["coords"])
        elif check_type == "viirs":
            sig = mock_gen.generate_satellite_nightlight(loc_data["name"], loc_data["coords"])
        else:
            sig = mock_gen.generate_aquastat_update(loc_data["name"], loc_data["coords"])
            
        # Only ingest if it's actually an anomaly (value check) to reduce noise?
        # The generators randomize anomalies. We'll ingest everything, 
        # but the frontend only cares about what's pushed to the feed/map.
        engine.ingest_signal(sig)

@app.on_event("startup")
async def startup_event():
    # Start the autonomous loop in the background
    asyncio.create_task(autonomous_monitoring_loop())
    # Start Pushbullet listener if API key is present
    if PUSHBULLET_API_KEY:
        asyncio.create_task(pushbullet_listener_loop())

# --- SMS Simulator UI ---
@app.get("/", response_class=HTMLResponse)
async def simulator():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram | SADA Messenger</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background: #0e1621; color: #fff; margin: 0; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
            .bg-telegram { background-color: #0e1621; }
            .bg-telegram-header { background-color: #17212b; }
            .bg-telegram-bubble-sent { background-color: #2b5278; }
            .bg-telegram-bubble-received { background-color: #182533; }
            .text-telegram-accent { color: #5288c1; }
            .chat-pattern {
                background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
                background-opacity: 0.1;
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                padding: 16px;
            }
            .message-bubble {
                max-width: 85%;
                padding: 8px 12px;
                border-radius: 12px;
                margin-bottom: 4px;
                font-size: 14.5px;
                position: relative;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .sent { align-self: flex-end; border-bottom-right-radius: 2px; }
            .received { align-self: flex-start; border-bottom-left-radius: 2px; }
            .timestamp { font-size: 10px; color: rgba(255,255,255,0.4); margin-left: 8px; float: right; margin-top: 4px; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
        </style>
    </head>
    <body class="bg-telegram">
        <!-- Telegram Header -->
        <div class="bg-telegram-header p-3 flex items-center gap-4 shadow-md z-10">
            <button class="text-zinc-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div class="w-10 h-10 bg-[#5288c1] rounded-full flex items-center justify-center text-lg font-bold">S</div>
            <div class="flex-1">
                <div class="font-bold text-sm">SADA Crisis Hub</div>
                <div class="text-[11px] text-telegram-accent font-medium">bot • Al-Riyadh Node</div>
            </div>
            <button class="text-zinc-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
            </button>
        </div>

        <!-- Chat Area -->
        <div id="chat-stream" class="chat-pattern no-scrollbar">
            <div class="flex flex-col gap-1">
                <div class="bg-telegram-header/50 text-[11px] text-zinc-400 px-3 py-1 rounded-full self-center mb-4 uppercase tracking-wider font-bold">Today</div>
                
                <div class="bg-telegram-bubble-received received message-bubble">
                    Welcome to the SADA Fusion Engine bot. Start your report with a code like #BROKEN or #SOS followed by your location in Khartoum.
                    <span class="timestamp">12:00 PM</span>
                </div>
            </div>
        </div>

        <!-- Action Bar (Presets) -->
        <div class="bg-telegram-header/50 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
            <button onclick="sendDirect('#POWER Khartoum Central')" class="bg-[#17212b] border border-[#2b5278] text-[#5288c1] text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#2b5278]/20 transition-colors">REPORT: #POWER KHARTOUM</button>
            <button onclick="sendDirect('#AID Omdurman Souq')" class="bg-[#17212b] border border-red-500/30 text-red-500 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-red-500/10 transition-colors">URGENT: #AID OMDURMAN</button>
            <button onclick="sendDirect('#WATER Bahri Central')" class="bg-[#17212b] border border-[#2b5278] text-[#5288c1] text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#2b5278]/20 transition-colors">REPORT: #WATER BAHRI</button>
        </div>

        <div class="bg-telegram-header p-3 flex items-center gap-3">
            <div class="relative group">
                <button class="text-zinc-500 hover:text-telegram-accent transition-colors p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </button>
                <div class="absolute bottom-full left-0 mb-2 w-48 bg-[#17212b] rounded-lg shadow-xl border border-white/5 hidden group-hover:block p-1">
                    <button onclick="setLocation('KHARTOUM')" class="w-full text-left px-3 py-2 text-sm hover:bg-[#2b5278] rounded">📍 Khartoum Central</button>
                    <button onclick="setLocation('OMDURMAN')" class="w-full text-left px-3 py-2 text-sm hover:bg-[#2b5278] rounded">📍 Omdurman Souq</button>
                    <button onclick="setLocation('BAHRI')" class="w-full text-left px-3 py-2 text-sm hover:bg-[#2b5278] rounded">📍 Bahri North</button>
                    <button onclick="setLocation('KARARI')" class="w-full text-left px-3 py-2 text-sm hover:bg-[#2b5278] rounded">📍 Karari Sector</button>
                </div>
            </div>
            
            <div class="flex-1 bg-[#242f3d] rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-telegram-accent transition-all">
                <input id="sms-input" type="text" placeholder="Message (#AID...)" 
                    class="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-zinc-500">
            </div>
            <button onclick="sendCustom()" class="bg-[#242f3d] w-10 h-10 rounded-full flex items-center justify-center text-telegram-accent hover:bg-telegram-accent hover:text-white transition-all transform active:scale-95 shadow-lg">
                <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7l9 5-9 5V7z"></path></svg>
            </button>
        </div>

        <script>
            let currentLocation = "KHARTOUM"; // Default
            
            function setLocation(loc) {
                currentLocation = loc;
                const input = document.getElementById('sms-input');
                if (!input.value.includes(loc)) {
                    input.value = input.value + " " + loc;
                }
                input.focus();
            }

            async function sendDirect(body) {
                if (!body) return;

                // Add bubble to UI
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const chatStream = document.getElementById('chat-stream');
                
                const bubble = document.createElement('div');
                bubble.className = 'bg-telegram-bubble-sent sent message-bubble';
                bubble.innerHTML = `${body}<span class="timestamp">${time} ✓✓</span>`;
                chatStream.appendChild(bubble);
                chatStream.scrollTop = chatStream.scrollHeight;

                const formData = new FormData();
                formData.append('Body', body);
                formData.append('From', 'Personal Phone');

                try {
                    await fetch('/reciveSms', { method: 'POST', body: formData });
                } catch (e) {
                    console.error("Failed to transmit", e);
                }
            }

            function sendCustom() {
                const input = document.getElementById('sms-input');
                if (input.value.trim()) {
                    sendDirect(input.value.trim());
                    input.value = "";
                }
            }

            document.getElementById('sms-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendCustom();
            });
        </script>
    </body>
    </html>
    """

# --- SADA Core Logic ---

LOCATIONS = {
    # Khartoum
    "KHARTOUM": {"name": "Khartoum Central", "coords": [15.589, 32.535]},
    "BURRI": {"name": "Burri District", "coords": [15.575, 32.560]},
    "KALAKLA": {"name": "Kalakla South", "coords": [15.480, 32.510]},
    "JABRA": {"name": "Jabra Industrial", "coords": [15.520, 32.530]},
    "RIYADH": {"name": "Al-Riyadh Block 4", "coords": [15.556, 32.553]},
    # Omdurman
    "OMDURMAN": {"name": "Omdurman Central", "coords": [15.642, 32.482]},
    "SOUQ": {"name": "Omdurman Souq", "coords": [15.635, 32.485]},
    "OMDURMAN WEST": {"name": "Omdurman West", "coords": [15.650, 32.450]},
    "KARARI": {"name": "Karari Sector", "coords": [15.680, 32.470]},
    # Bahri
    "BAHRI": {"name": "Bahri North", "coords": [15.620, 32.540]},
    "BAHRI CENTRAL": {"name": "Bahri Central", "coords": [15.600, 32.530]},
    "SHAMBAT": {"name": "Shambat Area", "coords": [15.625, 32.525]},
}

def extract_location(text: str) -> dict:
    text = text.upper()
    sorted_keys = sorted(LOCATIONS.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key in text:
            return LOCATIONS[key]
    return {"name": "Unknown Sector", "coords": [15.58, 32.53]}

# --- API Endpoints ---

async def handle_sms_signal(body: str, from_number: str, background_tasks: BackgroundTasks):
    """
    Centralized logic to process SADA SMS reports.
    Used by both the REST endpoint and the Pushbullet listener.
    """
    body = body.strip().upper()
    print(f"--- SADA FUSION: Processing '{body}' from {from_number} ---")
    
    # 1. Parse Signal
    report_type = "OTHER"
    if "#AID" in body or "#SOS" in body: report_type = "AID"
    elif "#POWER" in body or "#BROKEN" in body: report_type = "POWER"
    elif "#WATER" in body or "#DIRTY" in body: report_type = "WATER"
    
    loc_data = extract_location(body)
    
    # Create Signal Object
    new_signal = Signal(
        type="report",
        source="SADA_SMS",
        location=loc_data["name"],
        coords=loc_data["coords"],
        value=100.0 if report_type == "SOS" else 50.0,
        metadata={"raw_body": body, "report_type": report_type, "sender": from_number}
    )
    
    # 2. Ingest into Intelligence Engine
    events = engine.ingest_signal(new_signal)
    
    # 3. Trigger Autonomous Verification (Simulation)
    background_tasks.add_task(simulate_verification, loc_data["name"], loc_data["coords"])
    
    # Check if this triggered/updated an event
    active_events = [e for e in events if e.location == loc_data["name"]]
    return len(active_events) > 0

@app.post("/reciveSms")
async def getsms(request: Request, background_tasks: BackgroundTasks):
    print("--- DEBUG: Incoming Webhook Request Received ---")
    try:
        data = await request.json()
    except:
        form_data = await request.form()
        data = dict(form_data)
        
    body = data.get('message', data.get('Body', '')).strip().upper()
    from_number = data.get('sender', data.get('From', 'Personal Phone'))
    
    event_triggered = await handle_sms_signal(body, from_number, background_tasks)
    return {"status": "received", "event_triggered": event_triggered}

async def pushbullet_listener_loop():
    """
    Listens to Pushbullet WebSocket for real-time notifications/SMS.
    """
    if not PUSHBULLET_API_KEY:
        return

    class MockTasks:
        def add_task(self, func, *args):
            asyncio.create_task(func(*args))

    uri = f"wss://stream.pushbullet.com/websocket/{PUSHBULLET_API_KEY}"
    print(f"--- Pushbullet Listener: Connecting to {uri[:30]}... ---")

    while True:
        try:
            async with websockets.connect(uri) as websocket:
                print("--- Pushbullet Listener: CONNECTED ---")
                while True:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    if data.get('type') == 'push':
                        push_data = data.get('push', {})
                        
                        # Case A: Actual SMS event (sms_changed)
                        if push_data.get('type') == 'sms_changed':
                            notifications = push_data.get('notifications', [])
                            for notif in notifications:
                                body = notif.get('body', '')
                                sender = notif.get('title', 'Unknown')
                                if '#' in body:
                                    print(f"--- Pushbullet Listener: SMS Detected! '{body}' from {sender} ---")
                                    await handle_sms_signal(body, sender, MockTasks())
                        
                        # Case B: Standard mirrored notification (mirrored_push)
                        else:
                            body = push_data.get('body', '')
                            title = push_data.get('title', 'Notification')
                            if '#' in body:
                                print(f"--- Pushbullet Listener: Notification Detected! '{body}' ---")
                                await handle_sms_signal(body, title, MockTasks())
        except Exception as e:
            print(f"--- Pushbullet Listener ERROR: {e}. Reconnecting in 5s... ---")
            await asyncio.sleep(5)

@app.get("/messages")
async def get_messages(limit: int = 50):
    """
    Returns recent signals specifically formatted for the frontend feed.
    Prioritizes SMS reports and high-severity signals.
    """
    # Sort by timestamp desc (assuming simple append order for now)
    recent = engine.signals[-limit:]
    recent.reverse()
    
    # Map internal signal model to frontend expected props where needed
    # (The frontend expects: timestamp, signal_type, location, coords, from/source, body)
    results = []
    for s in recent:
        # Determine source label
        src_label = s.source
        if s.source == "SADA_SMS": src_label = "SMS"
        
        # Determine urgency/priority for frontend highlighting
        priority = 0
        if s.type == "SOS" or (s.metadata and s.metadata.get("urgency") == "high"):
            priority = 100
        
        results.append({
            "id": s.id,
            "time": s.timestamp,
            "type": s.metadata.get("report_type", s.type) if s.type == "report" else s.type,
            "location": s.location,
            "coords": s.coords,
            "source": src_label,
            "body": s.metadata.get("raw_body") or s.metadata.get("notes") or f"Detected {s.type} anomaly",
            "priority": priority,
            "action": s.metadata.get("status") or "Verify"
        })
        
    return results

@app.post("/demo")
async def run_demo(type: str = "water", loc: str = ""):
    """
    Simulates signals for the demo.
    """
    loc_key = "SOUQ"
    if loc:
        for k in LOCATIONS:
            if k in loc.upper():
                loc_key = k
                break
                
    if type.lower() == "power":
        # Simulate Nightlight Drop
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["RIYADH"])
        sat_signal = mock_gen.generate_satellite_nightlight(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sat_signal)
        return {"status": "injected", "signal": sat_signal, "current_events": events}
        
    elif type.lower() == "leak":
        # Simulate Soil Moisture Spike
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["SOUQ"])
        sensor_signal = mock_gen.generate_soil_moisture(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sensor_signal)
        return {"status": "injected", "signal": sensor_signal, "current_events": events}

    # Add handlers for all other 9 indicators
    elif type.lower() == "air":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["KARARI"])
        sig = mock_gen.generate_air_quality(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}
        
    elif type.lower() == "market":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["OMDURMAN"])
        sig = mock_gen.generate_market_price(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}
        
    elif type.lower() == "health":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["KALAKLA"])
        sig = mock_gen.generate_health_alert(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}
        
    elif type.lower() == "mobility":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["SHAMBAT"])
        sig = mock_gen.generate_displacement(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}
        
    elif type.lower() == "network":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["BAHRI"])
        sig = mock_gen.generate_connectivity(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}

    elif type.lower() == "water":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["BURRI"])
        sig = mock_gen.generate_water_quality(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}

    elif type.lower() == "security":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["JABRA"])
        sig = mock_gen.generate_social_conflict(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}

    elif type.lower() == "aquastat":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["SHAMBAT"])
        sig = mock_gen.generate_aquastat_update(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}

    elif type.lower() == "hdx":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["BAHRI"])
        sig = mock_gen.generate_hdx_damage(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}

    elif type.lower() == "grid":
        loc_data = LOCATIONS.get(loc_key, LOCATIONS["RIYADH"])
        sig = mock_gen.generate_grid_status(loc_data["name"], loc_data["coords"])
        events = engine.ingest_signal(sig)
        return {"status": "injected", "signal": sig}

    return {"status": "unknown_type"}

@app.get("/events")
async def get_events():
    return engine.get_active_events()

@app.get("/signals")
async def get_signals():
    return engine.signals

@app.post("/verify_event/{event_id}")
async def verify_event(event_id: str):
    """
    Endpoint for ERRs (Guardians) to manuall confirm an event.
    """
    for event in engine.events:
        if event.id == event_id or str(event.id) == event_id: # Handle int/str mismatch
             event.status = "verified"
             event.confidence = min(event.confidence + 0.2, 1.0)
             event.proxy_details["MANUAL_VERIFICATION"] = 1.0
             
             # Send Alert via Pushbullet if configured
             alert_recipient = os.getenv("ALERT_PHONE_NUMBER", "+1234567890")
             msg_body = f"SADA ALERT: Verified {event.severity} event in {event.location}. Deploying teams."
             send_sms_via_pushbullet(alert_recipient, msg_body)

             # Manual verification complete
             return {"status": "success", "event": event}
    return {"status": "error", "message": "Event not found"}

@app.post("/clear")
async def clear_data():
    """
    Clears all signals and events from the engine.
    """
    engine.reset()
    return {"status": "cleared"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)