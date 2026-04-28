from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

from server.ai.classifier.train import train_and_save


MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"


SEVERITY_MAP = {
    "normal": "low",
    "gearbox_failure": "high",
    "blade_damage": "high",
    "generator_fault": "critical",
    "dam_seepage_crack": "high",
    "dam_gate_fault": "medium",
    "dam_structural": "critical",
    "substation_transformer": "critical",
    "substation_breaker": "high",
    "grid_line_break": "critical",
    "grid_relay_fault": "high",
    "dam_turbine": "high",
}


def _load_model():
    if not MODEL_PATH.exists():
        train_and_save()
    return joblib.load(MODEL_PATH)


def classify_damage(payload: dict) -> dict:
    bundle = _load_model()
    model = bundle["model"]

    features = np.array(
        [[
            payload.get("vibration", 0.0),
            payload.get("temperature", 0.0),
            payload.get("crack_width", 0.0),
            payload.get("seepage_flow", 0.0),
            payload.get("voltage", 0.0),
            payload.get("current", 0.0),
        ]],
        dtype=float,
    )

    label = model.predict(features)[0]
    probs = model.predict_proba(features)[0]
    confidence = float(np.max(probs))

    return {
        "fault_type": label,
        "severity": SEVERITY_MAP.get(label, "medium"),
        "confidence": round(confidence, 4),
    }
