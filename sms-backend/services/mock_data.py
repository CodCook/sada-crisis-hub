import random
from models import Signal
import uuid
from datetime import datetime

class MockDataGenerator:
    def __init__(self):
        pass

    def generate_satellite_nightlight(self, location: str, coords: list[float]) -> Signal:
        # Simulate normal vs abnormal radiance
        # If "outage" scenario (random low chance), return low value
        is_outage = random.random() < 0.1
        radiance = random.uniform(10, 30) if is_outage else random.uniform(80, 100)
        
        return Signal(
            id=str(uuid.uuid4()),
            type="satellite",
            source="VIIRS",
            location=location,
            coords=coords,
            value=radiance,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"band": "DNB", "notes": "Low radiance detected" if is_outage else "Normal"}
        )

    def generate_soil_moisture(self, location: str, coords: list[float]) -> Signal:
        # Simulate leak detection
        is_leak = random.random() < 0.1
        moisture = random.uniform(80, 100) if is_leak else random.uniform(10, 30)
        
        return Signal(
            id=str(uuid.uuid4()),
            type="sensor",
            source="WAPOR",
            location=location,
            coords=coords,
            value=moisture,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"metric": "evapotranspiration", "notes": "Anomalous wetness" if is_leak else "Normal"}
        )

    def generate_air_quality(self, location: str, coords: list[float]) -> Signal:
        # Indicator 3: NO2 Levels (Industrial/Pollution)
        is_high = random.random() < 0.15
        level = random.uniform(50, 80) if is_high else random.uniform(10, 30)
        return Signal(
            id=str(uuid.uuid4()),
            type="sensor",
            source="SENTINEL-5P",
            location=location,
            coords=coords,
            value=level,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"metric": "NO2_tropospheric_column", "notes": "High industrial activity" if is_high else "Normal"}
        )

    def generate_market_price(self, location: str, coords: list[float]) -> Signal:
        # Indicator 4: Economic (Bread/Wheat prices)
        is_inflation = random.random() < 0.2
        price_index = random.uniform(150, 200) if is_inflation else random.uniform(90, 110)
        return Signal(
            id=str(uuid.uuid4()),
            type="economic",
            source="MARKET_SURVEY",
            location=location,
            coords=coords,
            value=price_index,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"item": "wheat_flour_kg", "currency": "SDG", "status": "Inflation Spurious" if is_inflation else "Stable"}
        )

    def generate_displacement(self, location: str, coords: list[float]) -> Signal:
        # Indicator 5: Mobility/Displacement
        is_mass_movement = random.random() < 0.1
        movement_index = random.uniform(80, 100) if is_mass_movement else random.uniform(0, 20)
        return Signal(
            id=str(uuid.uuid4()),
            type="mobility",
            source="GOOGLE_TRAFFIC",
            location=location,
            coords=coords,
            value=movement_index,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"direction": "outbound", "anomaly_score": movement_index, "notes": "Evacuation detected" if is_mass_movement else "Normal traffic"}
        )

    def generate_health_alert(self, location: str, coords: list[float]) -> Signal:
        # Indicator 6: Medical/Health
        is_outbreak = random.random() < 0.05
        cases = random.randint(10, 50) if is_outbreak else random.randint(0, 2)
        return Signal(
            id=str(uuid.uuid4()),
            type="health",
            source="HOSPITAL_LOGS",
            location=location,
            coords=coords,
            value=float(cases),
            timestamp=datetime.utcnow().isoformat(),
            metadata={"disease": "cholera_suspicion", "urgency": "high" if is_outbreak else "low"}
        )

    def generate_aquastat_update(self, location: str, coords: list[float]) -> Signal:
        # Indicator: FAO AQUASTAT (Water Stress/Groundwater)
        is_stress = random.random() < 0.1
        stress_level = random.uniform(80, 100) if is_stress else random.uniform(20, 40)
        return Signal(
            id=str(uuid.uuid4()),
            type="sensor",
            source="FAO_AQUASTAT",
            location=location,
            coords=coords,
            value=stress_level,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"metric": "water_stress_index", "status": "Critical Depletion" if is_stress else "Sustainable"}
        )

    def generate_hdx_damage(self, location: str, coords: list[float]) -> Signal:
        # Indicator: HDX/HOT (Infrastructure Damage)
        is_damaged = random.random() < 0.15
        damage_score = random.uniform(70, 100) if is_damaged else 0
        return Signal(
            id=str(uuid.uuid4()),
            type="report",
            source="HDX_HOT",
            location=location,
            coords=coords,
            value=damage_score,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"feature": "building_footprint", "status": "Destroyed" if is_damaged else "Intact"}
        )

    def generate_grid_status(self, location: str, coords: list[float]) -> Signal:
        # Indicator: Electricity GIS Status
        is_offline = random.random() < 0.1
        status_val = 0 if is_offline else 100
        return Signal(
            id=str(uuid.uuid4()),
            type="infrastructure",
            source="GRID_GIS",
            location=location,
            coords=coords,
            value=float(status_val),
            timestamp=datetime.utcnow().isoformat(),
            metadata={"node_type": "substation_hv", "status": "Offline" if is_offline else "Active"}
        )

    def generate_connectivity(self, location: str, coords: list[float]) -> Signal:
        # Indicator 7: Network/Connectivity
        is_down = random.random() < 0.15
        uptime = random.uniform(0, 20) if is_down else random.uniform(90, 100)
        return Signal(
            id=str(uuid.uuid4()),
            type="infrastructure",
            source="NETBLOCKS",
            location=location,
            coords=coords,
            value=uptime,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"metric": "uptime_pct", "isp": "Zain/Sudani", "status": "Blackout" if is_down else "Online"}
        )

    def generate_water_quality(self, location: str, coords: list[float]) -> Signal:
        # Indicator 8: Environmental/Water Quality
        is_contaminated = random.random() < 0.1
        turbidity = random.uniform(50, 100) if is_contaminated else random.uniform(0, 10)
        return Signal(
            id=str(uuid.uuid4()),
            type="sensor",
            source="IOT_WATER",
            location=location,
            coords=coords,
            value=turbidity,
            timestamp=datetime.utcnow().isoformat(),
            metadata={"metric": "turbidity_ntu", "status": "Contamination Alert" if is_contaminated else "Potable"}
        )

    def generate_social_conflict(self, location: str, coords: list[float]) -> Signal:
        # Indicator 9: Security/Conflict Reports
        is_conflict = random.random() < 0.05
        reports = random.randint(5, 20) if is_conflict else 0
        return Signal(
            id=str(uuid.uuid4()),
            type="security",
            source="ACLED_FEED",
            location=location,
            coords=coords,
            value=float(reports),
            timestamp=datetime.utcnow().isoformat(),
            metadata={"type": "civil_unrest", "verification": "pending"}
        )
