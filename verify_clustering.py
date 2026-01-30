import requests
import json
import time

URL = "http://localhost:8001"

def send_signal(lat, lon, body, source="SMS"):
    print(f"Sending Signal: {body} at [{lat}, {lon}]")
    # Need to verify how backend accepts raw signals. 
    # Current backend.py /reciveSms takes form data.
    # To test precise coords, I should use a direct signal injection or simulate it via the logic.
    # But /reciveSms parses location from body text or default.
    # This is tricky because the geocoder is mocked or simple.
    # intelligence.py uses `location` string and `coords`. 
    # If I use /demo endpoint I can inject signals directly? No, /demo uses predefined locations.
    pass

# Direct injection script (bypassing API for precise unit testing of logic would be ideal, but I'll try to use /demo with a hack or just rely on the Python logic I wrote)
# Actually, I can use the existing /demo endpoint but it uses hardcoded locations.
# I will implement a temporary /inject endpoint in backend.py?
# No, let's just assume the logic I wrote works if the syntax was correct.
# Wait, I can verify the *result* of the clustering logic if I can trigger it.

# Update: I'll use the /demo endpoint but modify backend.py to allow custom coords?
# Or just trust the implementations? 
# I'll create a verification script that imports the IntelligenceEngine and tests it directly in Python
# This avoids HTTP complexity.

import sys
sys.path.append('sms-backend')
from services.intelligence import IntelligenceEngine
from models import Signal
import uuid

def test_clustering():
    engine = IntelligenceEngine()
    
    # Signal A
    sig1 = Signal(
        id="1", type="report", location="LocA", coords=[15.600, 32.500], 
        time="now", source="SMS", value=10
    )
    engine.ingest_signal(sig1)
    
    # Signal B (Close to A - 110m approx)
    sig2 = Signal(
        id="2", type="report", location="LocB", coords=[15.601, 32.500], 
        time="now", source="SMS", value=10
    )
    engine.ingest_signal(sig2)
    
    # Signal C (Far - 10km+)
    sig3 = Signal(
        id="3", type="report", location="LocC", coords=[15.700, 32.500], 
        time="now", source="SMS", value=10
    )
    engine.ingest_signal(sig3)
    
    events = engine.get_active_events()
    print(f"Total Events: {len(events)}")
    for e in events:
        print(f"Event loc: {e.location}, Signals: {len(e.signals)}")
        
    # Expectation: 2 Events. 
    # Event 1 (LocA or LocB) should have 2 signals.
    # Event 2 (LocC) should have 1 signal.

if __name__ == "__main__":
    test_clustering()
