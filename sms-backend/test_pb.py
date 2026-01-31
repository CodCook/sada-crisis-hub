import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("PUSHBULLET_API_KEY")
DEVICE_ID = os.getenv("PUSHBULLET_DEVICE_ID")
TO = os.getenv("ALERT_PHONE_NUMBER")

def test_send():
    print(f"Testing Pushbullet with Device: {DEVICE_ID} and To: {TO}...")
    url = "https://api.pushbullet.com/v2/texts"
    headers = {"Access-Token": API_KEY}
    payload = {
        "data": {
            "addresses": [TO],
            "message": "SADA Connection Test: Pushbullet is ONLINE 🚀",
            "target_device_iden": DEVICE_ID
        }
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("SUCCESS: Pushbullet accepted the request!")
            print(response.json())
        else:
            print(f"FAILED: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_send()
