"""Persist location progress in a JSON file for the single-process prototype."""

import json
import os
import tempfile
from pathlib import Path
from threading import RLock

from backend.src.models.location import LocationStatus


class LocationRepository:
    """Serialize reads and updates so simultaneous requests cannot lose progress."""

    def __init__(self, path: Path):
        self.path = path
        self._lock = RLock()

    def list_locations(self) -> list[LocationStatus]:
        """Validate stored data; never silently replace a damaged file."""
        with self._lock:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            if not isinstance(data, list):
                raise ValueError("Location storage must contain a JSON array.")
            locations = [LocationStatus.model_validate(item) for item in data]
            if len({item.id for item in locations}) != len(locations):
                raise ValueError("Location identifiers must be unique.")
            return locations

    def unlock(self, location_id: str) -> LocationStatus:
        """Save an unlock once, leaving all other locations unchanged."""
        with self._lock:
            locations = self.list_locations()
            location = next((item for item in locations if item.id == location_id), None)
            if location is None:
                raise KeyError(location_id)
            if not location.unlocked:
                location.unlocked = True
                self._save(locations)
            return location

    def _save(self, locations: list[LocationStatus]) -> None:
        """Replace the file atomically so failed writes preserve previous data."""
        temporary_path = None
        try:
            # The temporary file must share the destination filesystem for replacement.
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=self.path.parent,
                suffix=".tmp", delete=False,
            ) as temporary:
                temporary_path = Path(temporary.name)
                json.dump([item.model_dump() for item in locations], temporary, indent=2)
                temporary.write("\n")
                temporary.flush()
                os.fsync(temporary.fileno())
            os.replace(temporary_path, self.path)
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)
