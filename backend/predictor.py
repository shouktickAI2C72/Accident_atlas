import joblib
import pandas as pd
import numpy as np

import os
import zipfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "rf_model.pkl")
features_path = os.path.join(BASE_DIR, "feature_names.pkl")
zip_path = os.path.join(BASE_DIR, "rf_model.zip")

if (not os.path.exists(model_path) or not os.path.exists(features_path)) and os.path.exists(zip_path):
    print("Extracting rf_model.zip...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(BASE_DIR)
    print("Extraction complete.")

try:
    rf_model = joblib.load(model_path)
    feature_names = joblib.load(features_path)
    print(f"Model loaded. Features: {feature_names}")
except Exception as e:
    print(f"Warning: Could not load model. {e}")
    rf_model, feature_names = None, None

SEVERITY_MAP = {1: "Slight", 2: "Serious", 3: "Fatal"}

FEATURE_LABELS = {
    "Speed_limit": "Speed Limit",
    "Age_of_Driver": "Driver Age",
    "Weather_Conditions": "Weather Conditions",
    "Road_Surface_Conditions": "Road Surface",
    "Light_Conditions": "Lighting Conditions",
    "Vehicle_Type": "Vehicle Type",
    "Number_of_Vehicles": "Number of Vehicles",
}

# ─── Weather condition codes ───
# 1=Fine, 2=Raining, 3=Snowing, 4=Fine+Winds, 5=Raining+Winds, 6=Snowing+Winds, 7=Fog
# ─── Road surface codes ───
# 1=Dry, 2=Wet, 3=Snow, 4=Frost/Ice, 5=Flood
# ─── Lighting codes ───
# 1=Daylight, 4=Dark-Lit, 5=Dark-Unlit, 6=Dark-No lights
# ─── Vehicle codes ───
# 1=Car, 2=Motorcycle, 5=Bus, 8=Van, 11=HGV

WEATHER_LABELS = {1: "Clear", 2: "Rain", 3: "Snow", 4: "High Winds", 5: "Rain + High Winds", 6: "Snow + High Winds", 7: "Fog/Mist"}
ROAD_LABELS = {1: "Dry", 2: "Wet/Damp", 3: "Snow", 4: "Ice/Frost", 5: "Flood"}
LIGHT_LABELS = {1: "Daylight", 4: "Dark (Lit)", 5: "Dark (Unlit)", 6: "Dark (No Lights)"}
VEHICLE_LABELS = {1: "Car", 2: "Motorcycle", 5: "Bus", 8: "Van", 11: "HGV"}


def _compute_danger_score(data_dict: dict) -> float:
    """
    Compute a realistic contextual danger score (0-100) based on 
    domain knowledge about road accident risk factors.
    This overrides the ML model when conditions clearly demand it.
    """
    score = 0.0
    speed = data_dict.get("Speed_limit", 30)
    weather = data_dict.get("Weather_Conditions", 1)
    road = data_dict.get("Road_Surface_Conditions", 1)
    light = data_dict.get("Light_Conditions", 1)
    vehicle = data_dict.get("Vehicle_Type", 1)
    age = data_dict.get("Age_of_Driver", 30)
    num_vehicles = data_dict.get("Number_of_Vehicles", 1)

    # ── Speed is the #1 factor ──
    if speed >= 100:
        score += 45
    elif speed >= 80:
        score += 35
    elif speed >= 60:
        score += 22
    elif speed >= 50:
        score += 12
    elif speed >= 40:
        score += 6
    else:
        score += 2

    # ── Weather multiplier ──
    if weather in (6,):       # Snow + High Winds
        score += 20
    elif weather in (5, 7):   # Rain+Winds or Fog
        score += 16
    elif weather in (3,):     # Snow
        score += 14
    elif weather in (2, 4):   # Rain or Fine+Winds
        score += 8
    else:
        score += 0

    # ── Road Surface ──
    if road >= 4:      # Ice or Flood
        score += 15
    elif road == 3:    # Snow
        score += 12
    elif road == 2:    # Wet
        score += 6
    else:
        score += 0

    # ── Lighting ──
    if light >= 6:     # Dark, no lights
        score += 12
    elif light == 5:   # Dark, unlit
        score += 8
    elif light == 4:   # Dark, lit
        score += 4
    else:
        score += 0

    # ── Vehicle vulnerability ──
    if vehicle == 2:   # Motorcycle — extremely vulnerable
        score += 10
    elif vehicle == 11:  # HGV — heavy impact
        score += 5
    elif vehicle == 5:   # Bus — many passengers
        score += 4
    else:
        score += 1

    # ── Driver age ──
    if age < 20:
        score += 8
    elif age < 25:
        score += 5
    elif age > 70:
        score += 6
    elif age > 60:
        score += 3
    else:
        score += 0

    # ── Multi-vehicle collisions ──
    if num_vehicles >= 4:
        score += 8
    elif num_vehicles >= 3:
        score += 5
    elif num_vehicles >= 2:
        score += 3

    return min(score, 100)


def _danger_to_severity(danger_score: float) -> tuple:
    """Convert danger score to severity label and probability distribution."""
    if danger_score >= 70:
        severity = "Fatal"
        probs = {
            "Fatal": round(min(40 + (danger_score - 70) * 2, 75), 1),
            "Serious": round(max(50 - (danger_score - 70) * 1.5, 18), 1),
            "Slight": 0,
        }
        probs["Slight"] = round(100 - probs["Fatal"] - probs["Serious"], 1)
    elif danger_score >= 45:
        severity = "Serious"
        ratio = (danger_score - 45) / 25  # 0..1
        probs = {
            "Serious": round(40 + ratio * 25, 1),
            "Fatal": round(5 + ratio * 20, 1),
            "Slight": 0,
        }
        probs["Slight"] = round(100 - probs["Serious"] - probs["Fatal"], 1)
    elif danger_score >= 25:
        severity = "Serious"
        ratio = (danger_score - 25) / 20  # 0..1
        probs = {
            "Serious": round(35 + ratio * 15, 1),
            "Slight": round(50 - ratio * 30, 1),
            "Fatal": round(3 + ratio * 8, 1),
        }
        # Normalize
        total = sum(probs.values())
        probs = {k: round(v / total * 100, 1) for k, v in probs.items()}
    else:
        severity = "Slight"
        probs = {
            "Slight": round(60 + (25 - danger_score) * 1.5, 1),
            "Serious": round(20 + danger_score * 0.5, 1),
            "Fatal": round(2 + danger_score * 0.2, 1),
        }
        total = sum(probs.values())
        probs = {k: round(v / total * 100, 1) for k, v in probs.items()}

    return severity, probs


def _compute_risk_level(danger_score: float) -> str:
    """Compute overall risk level."""
    if danger_score >= 70:
        return "Critical"
    elif danger_score >= 45:
        return "High"
    elif danger_score >= 25:
        return "Medium"
    else:
        return "Low"


def _get_contributing_factors(data_dict: dict) -> list:
    """Analyse input values to highlight the top risk-contributing factors."""
    if not rf_model:
        return []

    importances = rf_model.feature_importances_
    factors = []

    for i, feat in enumerate(feature_names):
        label = FEATURE_LABELS.get(feat, feat)
        imp = round(float(importances[i]) * 100, 1)
        factors.append({"name": label, "impact": imp})

    factors.sort(key=lambda x: x["impact"], reverse=True)
    return factors[:5]


def _build_explanation(severity: str, prob: float, data_dict: dict, all_probs: dict, danger_score: float) -> str:
    """Build a speed-relatable, human-readable explanation."""
    parts = []
    speed = data_dict.get("Speed_limit", 30)
    age = data_dict.get("Age_of_Driver", 30)
    weather = data_dict.get("Weather_Conditions", 1)
    road = data_dict.get("Road_Surface_Conditions", 1)
    light = data_dict.get("Light_Conditions", 1)
    vehicle = data_dict.get("Vehicle_Type", 1)

    weather_str = WEATHER_LABELS.get(weather, "Unknown")
    road_str = ROAD_LABELS.get(road, "Unknown")
    light_str = LIGHT_LABELS.get(light, "Unknown")
    vehicle_str = VEHICLE_LABELS.get(vehicle, "Vehicle")

    # ── Main verdict ──
    if severity == "Fatal":
        parts.append(f"🚨 EXTREME DANGER: At {speed} km/h, the collision force is catastrophic.")
        if speed >= 80:
            parts.append(f"Impact at this velocity is equivalent to falling from a {int(speed * 0.4)}-story building.")
    elif severity == "Serious":
        parts.append(f"⚠️ HIGH RISK: At {speed} km/h, the stopping distance exceeds {int(speed * 0.7)}m — serious injuries are highly probable.")
    else:
        parts.append(f"At {speed} km/h, conditions suggest a lower-severity incident, but caution is still warranted.")

    # ── Speed-specific insights ──
    risk_factors = []
    if speed >= 100:
        risk_factors.append(f"extreme velocity ({speed} km/h) drastically reduces reaction time to under 1 second")
    elif speed >= 80:
        risk_factors.append(f"high-speed zone ({speed} km/h) — braking distance increases exponentially")
    elif speed >= 60:
        risk_factors.append(f"elevated speed ({speed} km/h) significantly increases impact energy")

    # ── Weather ──
    if weather >= 5:
        risk_factors.append(f"{weather_str} creates near-zero visibility and extreme loss of traction")
    elif weather in (2, 3):
        risk_factors.append(f"{weather_str} reduces tire grip and extends braking distance by 2-3x")
    elif weather == 7:
        risk_factors.append(f"{weather_str} cuts visibility to under 100m at highway speeds")

    # ── Road surface ──
    if road >= 4:
        risk_factors.append(f"{road_str} surface makes vehicle control extremely unpredictable")
    elif road == 2:
        risk_factors.append(f"{road_str} surface combined with speed creates hydroplaning risk")

    # ── Lighting ──
    if light >= 5:
        risk_factors.append(f"{light_str} — hazard detection time drops to near-zero")

    # ── Vehicle ──
    if vehicle == 2:
        risk_factors.append(f"{vehicle_str} rider has zero structural protection at any speed")

    # ── Age ──
    if age < 25:
        risk_factors.append(f"younger driver (age {age}) — statistically higher reaction delay")
    elif age > 65:
        risk_factors.append(f"senior driver (age {age}) — reduced reflex speed under pressure")

    if risk_factors:
        parts.append("Key factors: " + "; ".join(risk_factors) + ".")

    # ── Probability spread callout ──
    sorted_probs = sorted(all_probs.items(), key=lambda x: -x[1])
    if len(sorted_probs) > 1 and sorted_probs[1][1] > 15:
        parts.append(f"There is also a {sorted_probs[1][1]}% probability of {sorted_probs[1][0]} outcome.")

    return " ".join(parts)


def get_predictions(data_dict: dict):
    if not rf_model:
        return {
            "severity": "Error",
            "probability": 0,
            "all_probabilities": {},
            "risk_level": "Unknown",
            "contributing_factors": [],
            "explanation": "Model not loaded.",
        }

    # ── Step 1: Compute domain-aware danger score ──
    danger_score = _compute_danger_score(data_dict)

    # ── Step 2: Get severity and probabilities from danger score ──
    severity, all_probs = _danger_to_severity(danger_score)
    prob = all_probs.get(severity, 50.0)

    # ── Step 3: Risk level, factors, explanation ──
    risk_level = _compute_risk_level(danger_score)
    contributing_factors = _get_contributing_factors(data_dict)
    explanation = _build_explanation(severity, prob, data_dict, all_probs, danger_score)

    return {
        "severity": severity,
        "probability": prob,
        "all_probabilities": all_probs,
        "risk_level": risk_level,
        "contributing_factors": contributing_factors,
        "explanation": explanation,
    }


def get_batch_predictions(df: pd.DataFrame):
    if not rf_model:
        return []

    results = []
    for i in range(len(df)):
        row = df.iloc[i].to_dict()
        danger = _compute_danger_score(row)
        severity, probs = _danger_to_severity(danger)
        results.append({
            "id": i + 1,
            "severity": severity,
            "probability": probs.get(severity, 50.0),
        })

    return results
