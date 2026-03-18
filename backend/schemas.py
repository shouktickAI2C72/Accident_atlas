from pydantic import BaseModel
from typing import List, Dict

class PredictionInput(BaseModel):
    Age_of_Driver: int
    Speed_limit: int
    Weather_Conditions: int
    Road_Surface_Conditions: int
    Light_Conditions: int
    Vehicle_Type: int
    Number_of_Vehicles: int

class ContributingFactor(BaseModel):
    name: str
    impact: float

class PredictionOutput(BaseModel):
    severity: str
    probability: float
    all_probabilities: Dict[str, float]
    risk_level: str
    contributing_factors: List[ContributingFactor]
    explanation: str

class BatchPredictionOutput(BaseModel):
    id: int
    severity: str
    probability: float
