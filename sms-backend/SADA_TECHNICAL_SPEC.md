# SADA - Multi-Layered Proxy Detecting System (MPDS)
## Technical Specification & Proposal Context

### Core Architecture
**System Type:** Event-Driven Server-Client Architecture
**Goal:** Map water and power gaps in shattered cities (Khartoum/Omdurman) using multi-proxy verification.

### The 9 Validation Proxies
1. **OpenStreetMap (OSM):** Baseline "Digital Twin" of building footprints.
2. **Electricity GIS Report System:** Tracks high-voltage transmission networks.
3. **Water Line GIS Analysis:** Maps pipe corridors to predict leak impacts.
4. **WAPOR (Remote Sensing):** Monitors soil moisture and evapotranspiration.
5. **FAO Aqua Status:** Water table health and agricultural water use.
6. **HDX / Humanitarian OpenStreetMap Team (HOT):** Live humanitarian damage assessments.
7. **VIIRS (Satellite Night Lights):** Radiance detection for power outages.
8. **Crowdsourced Reports (ERRs):** Citizen data (SMS/Signal/Telegram).
9. **Infrastructure Maps:** Structural stability cross-referencing (e.g., Mogren Water Works).

### Key Logic Modules

#### 1. The "Offline Switch" Logic
*   **Trigger:** Incoming `#WATER` or `#POWER` (`#ELECTRICITY`) SMS.
*   **Action:** If coordinate is silent (no other reports), system *actively interrogates* Proxy #7 (Night Lights) and Proxy #4 (WAPOR).
*   **Outcome:** If Satellite sees blackout/moisture bloom -> Mark **RED** (Critical) without further human report.

#### 2. Bayesian Confidence Ranking
*   **Scoring:** Cross-referencing disparate sources.
*   **Example:** SMS Report (Proxy 8) + Satellite Moisture Spike (Proxy 4) = **95% Confidence**.
*   **Action:** Auto-dispatch repair team via Starlink.

#### 3. SAR (Synthetic Aperture Radar) Integration
*   **Source:** Sentinel-1C Satellite.
*   **Purpose:** "Dust Storm/Cloud Cover" backup.
*   **Mechanism:** Measures "interferometric coherence" (physical consistency).
*   **Detection:** Can detect fallen power pylons or collapsed water towers even with zero visibility/light.

#### 4. DBSCAN Clustering (The Filter)
*   **Algorithm:** Density-Based Spatial Clustering of Applications with Noise.
*   **Logic:**
    *   1 Report = Yellow Alert.
    *   15 Reports (Radius 200m) + WAPOR Spike = **Confirmed Main-Pipe Burst** (Red Alert).

### Deployment Strategy
*   **Nodes:** Starlink-linked "Guardian Nodes" in neighborhoods.
*   **Evolution:**
    *   Year 1: 90% Satellite dependency.
    *   Year 3: Pivot to 90% cellular/SMS as network recovers.
*   **Sustainability:** Data-as-a-Service (DaaS) for reconstruction planning (Zain/Sudani).

### Financials
*   **Request:** QAR 650,000.
*   **Team:** Triyo (Maryam Faizan Munshi, Mahgoub, Abdullah, Layan).
