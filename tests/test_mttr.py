from __future__ import annotations

from datetime import datetime, timedelta, timezone

from server.services.mttr_service import calculate_mttr_minutes


def test_mttr_minutes_calculation():
    started = datetime(2026, 4, 23, 10, 0, tzinfo=timezone.utc)
    resolved = started + timedelta(minutes=47, seconds=20)

    mttr = calculate_mttr_minutes(started, resolved)
    assert mttr == 47
