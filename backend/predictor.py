import joblib
import pandas as pd
import numpy as np

import os
import zipfile

model_path = "rf_model.pkl"
features_path = "feature_names.pkl"

if not os.path.exists(model_path) and os.path.exists("rf_model.zip"):
    print("Extracting rf_model.zip...")
    with zipfile.ZipFile("rf_model.zip", 'r') as zip_ref:
        zip_ref.extractall(".")
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


def _compute_risk_level(all_probs: dict) -> str:
    """Compute overall risk level based on probability distribution."""
    fatal = all_probs.get("Fatal", 0)
    serious = all_probs.get("Serious", 0)
    danger_score = fatal * 3 + serious * 1.5

    if danger_score >= 150:
        return "Critical"
    elif danger_score >= 80:
        return "High"
    elif danger_score >= 30:
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

    # Sort by importance, return top 5
    factors.sort(key=lambda x: x["impact"], reverse=True)
    return factors[:5]


def _build_explanation(severity: str, prob: float, data_dict: dict, all_probs: dict) -> str:
    """Build a human-readable explanation of the prediction."""
    parts = []

    # Severity context
    if severity == "Fatal":
        parts.append(f"⚠️ The model predicts a FATAL severity level with {prob}% confidence.")
    elif severity == "Serious":
        parts.append(f"The model predicts SERIOUS severity with {prob}% confidence.")
    else:
        parts.append(f"The model predicts SLIGHT severity with {prob}% confidence.")

    # Key risk factors
    speed = data_dict.get("Speed_limit", 0)
    age = data_dict.get("Age_of_Driver", 0)
    weather = data_dict.get("Weather_Conditions", 1)
    light = data_dict.get("Light_Conditions", 1)

    risk_notes = []
    if speed >= 60:
        risk_notes.append(f"high speed limit ({speed} mph)")
    if age < 25:
        risk_notes.append(f"young driver (age {age})")
    elif age > 65:
        risk_notes.append(f"elderly driver (age {age})")
    if weather >= 5:
        risk_notes.append("severe weather conditions")
    elif weather >= 3:
        risk_notes.append("adverse weather")
    if light >= 5:
        risk_notes.append("dark/unlit road conditions")

    if risk_notes:
        parts.append(f"Key risk factors: {', '.join(risk_notes)}.")

    # Probability spread
    sorted_probs = sorted(all_probs.items(), key=lambda x: -x[1])
    second = sorted_probs[1]
    if second[1] > 25:
        parts.append(f"Note: there is also a {second[1]}% chance of {second[0]} severity.")

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

    # Build DataFrame with correct feature order
    input_df = pd.DataFrame([data_dict])[feature_names]

    prediction = rf_model.predict(input_df)[0]
    probabilities = rf_model.predict_proba(input_df)[0]
    classes = rf_model.classes_

    severity = SEVERITY_MAP.get(prediction, "Unknown")
    prob = round(float(np.max(probabilities)) * 100, 2)

    # All class probabilities
    all_probs = {}
    for cls, p in zip(classes, probabilities):
        label = SEVERITY_MAP.get(cls, str(cls))
        all_probs[label] = round(float(p) * 100, 2)

    risk_level = _compute_risk_level(all_probs)
    contributing_factors = _get_contributing_factors(data_dict)
    explanation = _build_explanation(severity, prob, data_dict, all_probs)

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

    predictions = rf_model.predict(df[feature_names])
    probabilities = rf_model.predict_proba(df[feature_names])

    results = []
    for i in range(len(predictions)):
        results.append({
            "id": i + 1,
            "severity": SEVERITY_MAP.get(predictions[i], "Unknown"),
            "probability": round(float(np.max(probabilities[i])) * 100, 2),
        })

    return results
