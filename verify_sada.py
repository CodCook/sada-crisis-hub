import requests
import json
import time

URL = "http://localhost:8001"

def send_sms(body, tag="#WATER"):
    print(f"Sending SMS: {body} with tag {tag}")
    resp = requests.post(f"{URL}/reciveSms", data={
        "Body": f"{tag} {body}",
        "From": "+249912345678"
    })
    print(f"SMS Response: {resp.text}")

def check_events():
    resp = requests.get(f"{URL}/events")
    events = resp.json()
    for e in events:
        print(f"\nEvent: {e['title']}")
        print(f"  Type: {e['type']}")
        print(f"  Confidence: {e['confidence']}")
        print(f"  Proxies: {json.dumps(e['proxy_details'], indent=2)}")
        
        # Check for Offline Switch (Satellite present without explicit satellite signal ingest?)
        # My intelligence.py logic adds 'WAPOR' or 'VIIRS' to proxy_details if it triggers.
        if "WAPOR" in e['proxy_details'] or "VIIRS" in e['proxy_details']:
            print("  [SUCCESS] Satellite Proxy Active!")
        
        if e['confidence'] >= 0.95:
             print("  [SUCCESS] High Confidence (Bayesian Rule Matched!)")

# Test 1: Offline Switch (Single SMS -> Auto Satellite)
# We might need to send a few to trigger the 40% random chance
print("--- Testing Offline Switch & Bayesian Logic ---")
send_sms("Test Location Alpha", "#WATER")
time.sleep(2)
check_events()
