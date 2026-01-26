from fastapi import FastAPI, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from twilio.twiml.messaging_response import MessagingResponse
import uvicorn
import random
import asyncio
from datetime import datetime
import re

# In-memory store for received SMS reports
message_store: list[dict] = []

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            <button onclick="sendDirect('#BROKEN Al-Riyadh Block 4')" class="bg-[#17212b] border border-[#2b5278] text-[#5288c1] text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#2b5278]/20 transition-colors">REPORT: #BROKEN RIYADH</button>
            <button onclick="sendDirect('#SOS Khartoum West')" class="bg-[#17212b] border border-red-500/30 text-red-500 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-red-500/10 transition-colors">URGENT: #SOS KHARTOUM</button>
            <button onclick="sendDirect('#DIRTY Omdurman Souq')" class="bg-[#17212b] border border-[#2b5278] text-[#5288c1] text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#2b5278]/20 transition-colors">REPORT: #DIRTY OMDURMAN</button>
        </div>

        <!-- Input Area -->
        <div class="bg-telegram-header p-3 flex items-center gap-3">
            <button class="text-zinc-500 hover:text-telegram-accent transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
            <div class="flex-1 bg-[#242f3d] rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-telegram-accent transition-all">
                <input id="sms-input" type="text" placeholder="Message" 
                    class="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-zinc-500">
                <button class="text-zinc-500 hover:text-telegram-accent">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </button>
            </div>
            <button onclick="sendCustom()" class="bg-[#242f3d] w-10 h-10 rounded-full flex items-center justify-center text-telegram-accent hover:bg-telegram-accent hover:text-white transition-all transform active:scale-95 shadow-lg">
                <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7l9 5-9 5V7z"></path></svg>
            </button>
        </div>

        <script>
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
    # Al-Riyadh
    "RIYADH": "Al-Riyadh Block 4",
    # Omdurman
    "OMDURMAN": "Omdurman Central",
    "SOUQ": "Omdurman Souq",
    "OMDURMAN WEST": "Omdurman West",
    "KARARI": "Karari Sector",
    # Bahri
    "BAHRI": "Bahri North",
    "BAHRI CENTRAL": "Bahri Central",
    "SHAMBAT": "Shambat Area",
    # Khartoum
    "KHARTOUM": "Khartoum Central",
    "BURRI": "Burri District",
    "KALAKLA": "Kalakla South",
    "JABRA": "Jabra Industrial",
}

def extract_location(text: str) -> str:
    text = text.upper()
    # Sort keys by length descending to match more specific strings first (e.g., "Al-Riyadh" before "Khartoum")
    sorted_keys = sorted(LOCATIONS.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key in text:
            return LOCATIONS[key]
    return "Unknown Sector"

def calculate_priority(satellite_score: int, reports_count: int, infrastructure_score: int, is_sos: bool = False) -> float:
    if is_sos: return 100.0
    report_score = min(reports_count * 10, 100)
    priority = (0.3 * satellite_score) + (0.5 * report_score) + (0.2 * infrastructure_score)
    return round(priority, 2)

def get_proxy_data():
    return random.randint(0, 100), random.randint(0, 100)

def determine_action(priority_score: float, signal_type: str):
    if signal_type == "SOS":
         return "HUMANITARIAN ALERT: Dispatch UNICEF immediately."
    if priority_score >= 80:
        return "CRITICAL ALERT: Dispatch Immediate Response Team."
    elif priority_score >= 50:
         return "WARNING: Flag for verification."
    else:
        return "LOW PRIORITY: Logged for monitoring."

# --- API Endpoints ---

@app.post("/reciveSms")
async def getsms(request: Request):
    form_data = await request.form()
    message_dict = dict(form_data)
    
    body = message_dict.get('Body', '').strip().upper()
    from_number = message_dict.get('From', 'Personal Phone')
    
    signal_type = "UNKNOWN"
    if "#SOS" in body: signal_type = "SOS"
    elif "#BROKEN" in body: signal_type = "BROKEN"
    elif "#DIRTY" in body or "#WATER" in body: signal_type = "DIRTY"
    
    location = extract_location(body)
    # Special case for the script: if it mentions Al-Riyadh
    if "RIYADH" in body: location = "Al-Riyadh Block 4"

    satellite, infrastructure = get_proxy_data()
    is_sos = (signal_type == "SOS")
    priority = calculate_priority(satellite, 1, infrastructure, is_sos)
    action = determine_action(priority, signal_type)
    
    msg_entry = {
        "body": body,
        "from": from_number,
        "timestamp": datetime.utcnow().isoformat(),
        "signal_type": signal_type,
        "location": location,
        "priority": priority,
        "action": action,
    }
    message_store.append(msg_entry)
    
    resp = MessagingResponse()
    resp.message(f"SADA: Signal '{signal_type}' received from {location}. Priority: {priority}.")
    return Response(content=str(resp), media_type="application/xml")

@app.post("/demo")
async def run_demo(type: str = "water", loc: str = ""):
    """
    Simulates reports for the demo script.
    """
    if type.lower() == "sos":
        signal_type = "SOS"
        location = "Khartoum West"
    elif type.lower() == "power":
        signal_type = "BROKEN"
        location = "Al-Riyadh Block 4"
    else:
        signal_type = "DIRTY"
        location = loc if loc else "Omdurman Souq"
    
    satellite, infrastructure = get_proxy_data()
    reports_count = 1 if type.lower() == "power" else 12 # Power start is "single report", SOS is instant
    
    priority = calculate_priority(satellite, reports_count, infrastructure, signal_type == "SOS")
    action = determine_action(priority, signal_type)
    
    msg_entry = {
        "body": f"DEMO: {signal_type} SIGNAL",
        "from": "demo",
        "timestamp": datetime.utcnow().isoformat(),
        "signal_type": signal_type,
        "location": location,
        "priority": priority,
        "action": action,
    }
    message_store.append(msg_entry)
    return {"status": "success", "message": msg_entry}

@app.get("/messages")
async def get_messages(limit: int = 20):
    return message_store[-limit:][::-1]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)