from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class Signal(BaseModel):
    id: str = str(uuid.uuid4())
    type: str  # "satellite", "report", "sensor"
    source: str # "VIIRS", "SADA_SMS", "WAPOR"
    location: str
    coords: List[float] # [lat, lng]
    value: float # Normalized 0-100
    timestamp: str = datetime.utcnow().isoformat()
    metadata: dict = {}

class InfrastructureStatus(BaseModel):
    id: str
    name: str
    type: str # "water_plant", "substation", "pipeline"
    coords: List[float]
    status: str # "active", "degraded", "offline"
    last_updated: str = datetime.utcnow().isoformat()

class Event(BaseModel):
    id: str = str(uuid.uuid4())
    title: str
    type: str # "power_outage", "water_leak", "contamination"
    severity: str # "critical", "warning", "info"
    confidence: float # 0.0 - 1.0
    location: str
    coords: List[float]
    signals: List[str] # List of Signal IDs
    proxy_details: dict = {} # e.g., {"VIIRS": 0.9, "GRID": 1.0}
    status: str # "detected", "verified", "dispatched", "resolved"
    timestamp: str = datetime.utcnow().isoformat()
