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

### Submission Status
- [x] **Public GitHub Repository**: Operational at your repo URL.
- [x] **Working Functional MVP**: SMS-to-Map pipeline fully implemented.
- [x] **Clear Readme**: Instructions for setup and demo included.

### Deadlines & Artifacts
- **MVP Submission (Jan 27)**: [x] Proposal | [x] Source Code | [ ] MVP Video.
- **Final Submission (Jan 31)**: [ ] Enhanced Code | [ ] Slides | [ ] Demo Video.

## ✨ Core Features

- **Live Signal Fusion**: Real-time ingest of SMS reports, satellite anomalies (VIIRS), and multispectral data (WAPOR/Sentinel-1).
- **Bayesian Intelligence Engine**: Automated corroboration logic (e.g., `#WATER SMS` + `WAPOR Anomaly` = **95% Confidence**).
- **"Offline Switch"**: Single reports automatically trigger background satellite sweeps to verify "Silent Zones."
- **Guardian Portal**: A low-bandwidth, high-security dashboard for Emergency Response Teams (ERRs) to manually verify and track incidents.
- **Micro-Clustering**: Spatial grouping of reports (200m radius) to identify high-density crisis nodes.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Leaflet.js, Lucide Icons.
- **Backend**: FastAPI (Python), Intelligence Engine (Modular), Textbee.dev REST API.
- **Security**: Environment-based secret management with `.gitignore` protection.

## 🏁 Getting Started

### Prerequisites
- Node.js & npm (v18+)
### Step 2: Backend
1. Navigate to the backend: `cd sms-backend`
2. Install dependencies: `pip install fastapi uvicorn requests python-dotenv`
3. Configure your environment:
   - Copy the `.env` template.
   - Fill in your `PUSHBULLET_API_KEY` and `PUSHBULLET_DEVICE_ID`.
4. Run the server: `python backend.py`

## 📺 Demo Scenario

1. **The Signal**: Send an SMS to **yourself** (to your own HONOR phone) with a tag and location.
   - Example: `#POWER KHARTOUM`
   - Example: `#WATER OMDURMAN`
2. **Real-time Reception**: Watch the backend console. The Pushbullet Listener will detect the mirrored notification and trigger the SADA Fusion engine instantly.
3. **View the Fusion**: Go to your **Dashboard** (`http://localhost:5173`). A new crisis marker will appear at the detected location.
4. **Emergency Dispatch**: Access the `/guardian` portal, verify the incident, and receive a confirmation SMS alert back on your phone.

---

*Impact Metric: Empowering local "Guardians" to validate street-level crisis data through automated multi-sensor fusion.*

## 📜 Credits
Developed for the **SADA Crisis Hub**. Special thanks to the community leads for the "Ground Truth" context.

## ⚖️ License
MIT License.
