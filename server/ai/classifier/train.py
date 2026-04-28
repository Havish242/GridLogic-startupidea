from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


LABELS = [
    "gearbox_failure",
    "blade_damage",
    "generator_fault",
    "dam_seepage_crack",
    "dam_gate_fault",
    "dam_structural",
    "substation_transformer",
    "substation_breaker",
    "grid_line_break",
    "grid_relay_fault",
    "dam_turbine",
    "normal",
]

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"


def generate_samples_per_label(n: int = 1000) -> pd.DataFrame:
    rows: list[dict] = []
    rng = np.random.default_rng(42)

    base = {
        "gearbox_failure": (220, 95, 0.1, 0.2, 11.2, 210),
        "blade_damage": (180, 88, 0.1, 0.2, 10.8, 180),
        "generator_fault": (200, 98, 0.2, 0.2, 9.2, 250),
        "dam_seepage_crack": (20, 45, 0.8, 7.0, 10.5, 90),
        "dam_gate_fault": (18, 50, 0.4, 3.0, 10.8, 110),
        "dam_structural": (22, 55, 1.2, 8.2, 10.4, 95),
        "substation_transformer": (35, 110, 0.1, 0.1, 8.5, 400),
        "substation_breaker": (45, 85, 0.1, 0.1, 9.0, 380),
        "grid_line_break": (15, 42, 0.1, 0.1, 0.0, 20),
        "grid_relay_fault": (40, 60, 0.1, 0.1, 10.0, 320),
        "dam_turbine": (28, 75, 0.3, 2.4, 10.9, 210),
        "normal": (25, 52, 0.1, 0.4, 11.0, 150),
    }

    infra_map = {
        "gearbox_failure": "wind",
        "blade_damage": "wind",
        "generator_fault": "wind",
        "dam_seepage_crack": "dam",
        "dam_gate_fault": "dam",
        "dam_structural": "dam",
        "dam_turbine": "dam",
        "substation_transformer": "substation",
        "substation_breaker": "substation",
        "grid_line_break": "grid",
        "grid_relay_fault": "grid",
        "normal": "grid",
    }

    for label in LABELS:
        v, t, c, s, volt, cur = base[label]
        for _ in range(n):
            rows.append(
                {
                    "vibration": max(0, rng.normal(v, 8)),
                    "temperature": max(0, rng.normal(t, 4)),
                    "crack_width": max(0, rng.normal(c, 0.12)),
                    "seepage_flow": max(0, rng.normal(s, 0.7)),
                    "voltage": max(0, rng.normal(volt, 0.9)),
                    "current": max(0, rng.normal(cur, 18)),
                    "infra_type": infra_map[label],
                    "label": label,
                }
            )

    return pd.DataFrame(rows)


def train_and_save() -> dict:
    df = generate_samples_per_label(1000)
    X = df[["vibration", "temperature", "crack_width", "seepage_flow", "voltage", "current"]].to_numpy()
    y = df["label"].to_numpy()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=180, random_state=42)
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    payload = {
        "model": model,
        "labels": LABELS,
        "features": ["vibration", "temperature", "crack_width", "seepage_flow", "voltage", "current"],
    }
    joblib.dump(payload, MODEL_PATH)
    return {"accuracy": float(score), "path": str(MODEL_PATH)}


if __name__ == "__main__":
    summary = train_and_save()
    print(summary)
