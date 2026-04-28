from datetime import datetime, timezone


def _to_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def calculate_mttr_minutes(start: datetime, end: datetime) -> int:
    delta = _to_utc(end) - _to_utc(start)
    return max(0, round(delta.total_seconds() / 60))
