from typing import List, Dict
from models import Signal, Event
import uuid
import random
import math
from datetime import datetime

class IntelligenceEngine:
    def __init__(self):
        self.signals: List[Signal] = []
        self.events: List[Event] = []
        self.active_clusters: Dict[str, List[Signal]] = {} 

    def ingest_signal(self, signal: Signal) -> List[Event]:
        self.signals.append(signal)
        return self._evaluate_context(signal)



    def _calculate_distance(self, coord1, coord2):
        # Haversine formula
        R = 6371  # Earth radius in km
        lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
        lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _find_cluster_for_location(self, new_location, new_coords):
        # 1. Try exact location match first (legacy/named locations)
        if new_location in self.active_clusters:
            return new_location
            
        # 2. Try spatial match (200m radius)
        # Check against existing cluster keys if we stored coords mapped to keys
        # For MVP, active_clusters key is the location string. 
        # We need to peek at the first signal in each cluster to get its coords.
        for loc_key, signals in self.active_clusters.items():
            if signals:
                ref_signal = signals[0]
                dist = self._calculate_distance(new_coords, ref_signal.coords)
                if dist <= 0.2: # 200 meters
                    return loc_key
        
        return None

    def _evaluate_context(self, new_signal: Signal) -> List[Event]:
        # Spatial Clustering Logic
        target_cluster_key = self._find_cluster_for_location(new_signal.location, new_signal.coords)
        
        if not target_cluster_key:
            target_cluster_key = new_signal.location
            self.active_clusters[target_cluster_key] = []
        
        self.active_clusters[target_cluster_key].append(new_signal)
        cluster_signals = self.active_clusters[target_cluster_key]
        
        # --- 1. Signal Categorization ---
        # Electricity
        viirs_signals = [s for s in cluster_signals if s.source == "VIIRS" and s.value < 40]
        grid_signals = [s for s in cluster_signals if s.source == "GRID_GIS" and s.value == 0]
        
        # Water
        wapor_signals = [s for s in cluster_signals if s.source == "WAPOR" and s.value > 70]
        aquastat_signals = [s for s in cluster_signals if s.source == "FAO_AQUASTAT" and s.value > 70]
        water_quality_signals = [s for s in cluster_signals if s.type == "sensor" and s.metadata.get("metric") == "turbidity_ntu" and s.value > 50]
        
        # Ground Truth / Human
        hdx_signals = [s for s in cluster_signals if s.source == "HDX_HOT" and s.value > 0]
        err_reports = [s for s in cluster_signals if s.type == "report" or s.source == "SMS" or s.source == "ERR"]
        
        # Structural / SAR (Sentinel-1)
        sar_signals = [s for s in cluster_signals if s.source == "SENTINEL_1"] 

        # --- 2. Calculate Proxy Accuracies (Confidence Contributions) ---
        proxy_details = {}
        
        # Report Threshold Categories (Yellow/Orange/Red)
        report_count = len(err_reports)
        
        # Electricity Proxies
        if viirs_signals: proxy_details["VIIRS"] = random.uniform(0.3, 1.0)
        if grid_signals: proxy_details["GRID_GIS"] = random.uniform(0.3, 1.0)
        
        # Water Proxies
        if wapor_signals: proxy_details["WAPOR"] = random.uniform(0.3, 1.0)
        if aquastat_signals: proxy_details["FAO_AQUASTAT"] = random.uniform(0.3, 1.0)
        
        # Human/Ground Truth
        if hdx_signals: proxy_details["HDX_HOT"] = random.uniform(0.3, 1.0)
        
        # Dynamic Human Confidence based on Cluster Density
        if report_count > 0:
            if report_count >= 15:
                # 15+ Reports = Saturation (High Confidence)
                proxy_details["HUMAN_REPORTS"] = 0.95 
            elif report_count >= 5:
                 proxy_details["HUMAN_REPORTS"] = 0.75
            else:
                 proxy_details["HUMAN_REPORTS"] = 0.40 # Low confidence for isolated reports

        
        # SAR Proxy
        if sar_signals: proxy_details["SENTINEL_1"] = random.uniform(0.7, 1.0) # High confidence for structural

        # --- "Offline Switch" Logic ---
        # If we have only 1 SMS report, SIMULATE checking satellites
        # in a real system this would query an external API.
        # Here we mock it by "discovering" a satellite signal ~30% of the time if it's missing
        if len(proxy_details) == 1 and "HUMAN_REPORTS" in proxy_details:
             # Random chance to find latent satellite data "activated" by the SMS
            if random.random() < 0.4: 
                # "Found" a WAPOR signal matching the report
                proxy_details["WAPOR"] = random.uniform(0.8, 0.99)
                wapor_signals = [True] # Hack to trigger categorization logic below
            elif random.random() < 0.4:
                # "Found" a VIIRS signal
                proxy_details["VIIRS"] = random.uniform(0.8, 0.99)
                viirs_signals = [True]

        # --- 3. Strict Correlation Logic (Multi-Source Verification) ---
        confidence = 0.0
        event_type = "investigation"
        severity = "info"
        
        sources_present = list(proxy_details.keys())
        unique_categories = 0
        if any(k in ["VIIRS", "GRID_GIS", "SENTINEL_1"] for k in sources_present): unique_categories += 1
        if any(k in ["WAPOR", "FAO_AQUASTAT", "WATER_GIS"] for k in sources_present): unique_categories += 1
        if any(k in ["HDX_HOT", "HUMAN_REPORTS"] for k in sources_present): unique_categories += 1
        
        source_count = len(sources_present)

        # Bayesian Confidence Rules (Proposal Alignment)
        if "HUMAN_REPORTS" in sources_present:
            if "WAPOR" in sources_present:
                # Rule: SMS + WAPOR = Confirmed Main-Pipe Burst (95%)
                confidence = 0.95
                event_type = "verified_water_issue"
                severity = "critical"
            elif "VIIRS" in sources_present:
                # Rule: SMS + VIIRS = Confirmed Power Outage (95%)
                confidence = 0.95
                event_type = "verified_power_outage"
                severity = "critical"
            elif "SENTINEL_1" in sources_present:
                 # Rule: SMS + SAR = Structural Damage
                confidence = 0.92
                event_type = "structural_collapse"
                severity = "critical"
            elif report_count >= 15:
                 # 15+ Reports = Confirmed by density alone
                 confidence = 0.90
                 event_type = "mass_casualty_cluster"
                 severity = "critical"
            elif source_count >= 2:
                 # Generic multi-source fallback
                conf_sum = sum(proxy_details.values())
                confidence = min((conf_sum / source_count), 0.90)
                event_type = "corroborated_incident"
                severity = "warning"
            else:
                 # Single source
                confidence = proxy_details["HUMAN_REPORTS"] * 0.5
                event_type = "unconfirmed_report"
                
        elif source_count >= 2:
            # Satellite-only cross-validation (e.g. VIIRS + GRID)
            confidence = sum(proxy_details.values()) / source_count
            event_type = "remote_sensing_anomaly"
            severity = "warning"
            
        else:
             confidence = 0.2
             event_type = "noise"

        
        # --- 4. Event Generation ---
        if confidence > 0.4:
            # Update existing event for this CLUSTER KEY (location)
            existing_event = next((e for e in self.events if e.location == target_cluster_key and e.status != "resolved"), None)
            
            if existing_event:
                existing_event.confidence = confidence
                existing_event.signals = [s.id for s in cluster_signals] # Update signal list
                existing_event.timestamp = datetime.utcnow().isoformat()
                existing_event.type = event_type
                existing_event.severity = severity
                existing_event.proxy_details = proxy_details # Update breakdown
            else:
                new_event = Event(
                    title=f"{event_type.replace('_', ' ').title()} in {target_cluster_key}",
                    type=event_type,
                    severity=severity,
                    confidence=confidence,
                    location=target_cluster_key,
                    coords=new_signal.coords,
                    signals=[s.id for s in cluster_signals],
                    status="verified" if confidence > 0.7 else "detected",
                    proxy_details=proxy_details
                )
                self.events.append(new_event)
                
        return self.events
    
    def get_active_events(self):
        return [e for e in self.events if e.status != "resolved"]
