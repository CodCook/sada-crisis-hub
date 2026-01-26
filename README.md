# SADA Crisis Hub 🇸🇩

**Real-time Humanitarian Response Fusion Engine**

SADA Crisis Hub is a high-stakes dashboard designed to close the **"Validation Gap"** in shattered cities. By fusing crowd-sourced reports with multi-sensor data, we map the invisible boundaries of water and power access in war-damaged zones.

## 🏚️ The Challenge (SPS#3)

Months of intense fighting in **Khartoum and Omdurman** have decimated key infrastructure. 
- **Infrastructure Chaos**: Neighborhoods face weeks without electricity; water treatment plants are offline.
- **Data Blackout**: Official data is non-existent. Many fixes are informal, community-led efforts.
- **Constraints**: Residents rely on "cheap phones," have minimal data, and operate under frequent blackouts.

**SADA** provides the shared, up-to-date picture required for humanitarian agencies to prioritize repairs and direct limited resources to the most critically affected areas.

## 🚀 Hackathon Submission Details

### Deadlines & Artifacts
- **MVP Submission (Jan 27)**: Full proposal, Source Code, and MVP Video (max 4:00 mins).
- **Final Submission (Jan 31)**: Updated proposal, Enhanced code, Slides, Demo Video, and Feedback Form.

## ✨ Core Features

- **Live Signal Fusion**: Real-time ingest of SMS reports (`#BROKEN`, `#DIRTY`), satellite anomalies, and sensor data.
- **Infrastructure Gap Mapping**: Visualizing the "Zero-Lumen Zones" and water contamination clusters in Bahri and Al-Riyadh.
- **Low-Connectivity Engine**: Optimized for SMS-based crowd-sourcing where mobile data is a luxury.
- **Response Orchestration**: Direct dispatch hooks for electrical repair teams and 10,000L water tankers.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui.
- **Backend (SMS Simulator)**: FastAPI (Python), Twilio API (Mocked).
- **Branding**: SADA - *The Sound of Resilience.*

## 🏁 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+

### Step 1: Frontend
```sh
npm i
npm run dev
```

### Step 2: SMS Simulator (Backend)
```sh
cd sms-backend
pip install fastapi uvicorn twilio
python backend.py
```
Backend Simulator: `http://localhost:8001`

## 📺 Demo Scenario

1. **The Reporting Gap**: Send `#BROKEN RIYADH` via the SMS Simulator.
2. **Crisis Verification**: Trigger the `[DEMO] Crisis Lock` to see the Fusion Engine verify a 96% confidence failure via satellite.
3. **Emergency Dispatch**: Use the Action Modal to dispatch Water or Electrical teams to the verified cluster.

---

*Impact Metric: Reduction in time spent by residents searching for water through real-time map updates.*
