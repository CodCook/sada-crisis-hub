from fastapi import FastAPI, Form, Response , Request
from twilio.twiml.messaging_response import MessagingResponse
import uvicorn
import random
import asyncio

# In-memory store for received SMS reports
# Each entry will be a dict with keys: body, from_number, timestamp, signal_type, priority, action
message_store: list[dict] = []

app = FastAPI()

# --- SADA Core Logic ---

def calculate_priority(satellite_score: int, reports_count: int, infrastructure_score: int, is_sos: bool = False) -> float:
    """
    SADA Priority Formula:
    Priority = (30% * Satellite) + (50% * Reports) + (20% * Infrastructure)
    Override: If #SOS, Priority = 100.
    """
    if is_sos:
        return 100.0

    # Normalize reports (cap at 10 for max score)
    report_score = min(reports_count * 10, 100)
    
    priority = (0.3 * satellite_score) + (0.5 * report_score) + (0.2 * infrastructure_score)
    return round(priority, 2)

def get_proxy_data(location_code: str = "Unknown"):
    """
    Simulates fetching data from external proxies (Satellite & Infrastructure Map).
    In a real system, this would query GIS databases.
    """
    # Simulate random scores for demo purposes
    satellite_score = random.randint(0, 100)      # 0 = No issue seen, 100 = Major darkness/flood
    infrastructure_score = random.randint(0, 100) # 0 = Off grid, 100 = Major pipeline/grid line
    
    return satellite_score, infrastructure_score

def determine_action(priority_score: float, signal_type: str):
    if signal_type == "SOS":
         return "HUMANITARIAN ALERT: Dispatch UNICEF immediately."

    if priority_score >= 80:
        if signal_type == "DIRTY":
            return "CRITICAL ALERT: Dispatch Water Tanker + Chlorine Tablets immediately."
        else: # BROKEN or other
            return "CRITICAL ALERT: Dispatch Repair Team immediately."
    elif priority_score >= 50:
         return "WARNING: Flag for verification. High potential for issue."
    else:
        return "LOW PRIORITY: Logged as potential rumor. Awaiting further reports."

# --- API Endpoints ---

@app.post("/reciveSms")
async def getsms(request: Request):
    """
    Webhook for Twilio to send incoming SMS.
    """
    form_data = await request.form()
    message_dict = dict(form_data)
    
    body = message_dict.get('Body', '').strip().upper()
    from_number = message_dict.get('From', 'Unknown')
    
    print(f"--- Incoming SMS from {from_number} ---")
    print(f"Body: {body}")
    
    signal_type = "UNKNOWN"
    if "#DIRTY" in body or "#WATER" in body:
        signal_type = "DIRTY"
    elif "#SOS" in body:
        signal_type = "SOS"
    elif "#BROKEN" in body or "#CURRENT" in body or "#POWER" in body:
        signal_type = "BROKEN"
        
    # Proxy Data Simulation
    satellite, infrastructure = get_proxy_data()
    
    # Calculate Priority
    is_sos = (signal_type == "SOS")
    priority = calculate_priority(satellite, 1, infrastructure, is_sos)
    
    action = determine_action(priority, signal_type)
    
    print(f"Signal Type: {signal_type}")
    print(f"Proxy Fusion -> Sat: {satellite}, Infra: {infrastructure}, Reports: 1")
    print(f"Calculated Priority: {priority}")
    print(f"Action: {action}")
    print("-----------------------------------------")
    
    # Store the message for frontend consumption
    message_store.append({
        "body": body,
        "from": from_number,
        "timestamp": datetime.utcnow().isoformat(),
        "signal_type": signal_type,
        "priority": priority,
        "action": action,
        "satellite_score": satellite,
        "infrastructure_score": infrastructure,
    })
    
    # Twilio Response
    resp = MessagingResponse()
    resp.message(f"SADA System: Report received. Priority Score: {priority}. Status: {action}")
    
    return Response(content=str(resp), media_type="application/xml")

@app.post("/demo")
async def run_demo(type: str = "water"):
    """
    Simulates an incoming report to demonstrate the logic.
    type: 'water', 'power', or 'sos'
    """
    if type.lower() == "sos":
        signal_type = "SOS"
    else:
        signal_type = "DIRTY" if type.lower() == "water" else "BROKEN"
    
    # Generates random proxy data
    satellite, infrastructure = get_proxy_data()
    
    # Simulate a random number of reports to show variance
    reports_count = random.randint(1, 15)
    
    is_sos = (signal_type == "SOS")
    priority = calculate_priority(satellite, reports_count, infrastructure, is_sos)
    action = determine_action(priority, signal_type)
    
    fusion_math = "IMMEDIATE OVERRIDE" if is_sos else f"({satellite} * 0.3) + ({min(reports_count*10, 100)} * 0.5) + ({infrastructure} * 0.2)"
    
    result = {
        "simulation": {
            "input_signal": signal_type,
            "reports_aggregated": reports_count,
            "proxies": {
                "satellite_layer_score": satellite,
                "infrastructure_layer_score": infrastructure
            },
            "fusion_math": fusion_math,
            "final_priority_score": priority,
            "system_decision": action
        }
    }
    # Store demo result for frontend (optional)
    message_store.append({
        "body": f"Demo {type}",
        "from": "demo",
        "timestamp": datetime.utcnow().isoformat(),
        "signal_type": signal_type,
        "priority": priority,
        "action": action,
        "satellite_score": satellite,
        "infrastructure_score": infrastructure,
    })
    return result

from datetime import datetime

@app.get("/messages")
async def get_messages(limit: int = 20):
    """Return the most recent messages for the frontend (default 20)."""
    return message_store[-limit:][::-1]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)