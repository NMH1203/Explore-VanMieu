"""Check persistence, external edits, and failures using isolated JSON files."""

import json
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from backend.src.repositories.location_repository import LocationRepository


class LocationRepositoryTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "locations.json"
        self.path.write_text(json.dumps([
            {"id": "first", "unlocked": False},
            {"id": "second", "unlocked": False},
        ]), encoding="utf-8")
        self.repository = LocationRepository(self.path)

    def test_unlock_survives_restart_and_is_idempotent(self):
        self.repository.unlock("first")
        saved = self.path.read_bytes()
        self.repository.unlock("first")
        self.assertEqual(saved, self.path.read_bytes())
        locations = LocationRepository(self.path).list_locations()
        self.assertTrue(locations[0].unlocked)
        self.assertFalse(locations[1].unlocked)

    def test_external_json_edits_are_visible_on_next_read(self):
        self.repository.list_locations()
        data = json.loads(self.path.read_text())
        data[1]["unlocked"] = True
        self.path.write_text(json.dumps(data), encoding="utf-8")
        self.assertTrue(self.repository.list_locations()[1].unlocked)

    def test_unknown_location_does_not_change_file(self):
        saved = self.path.read_bytes()
        with self.assertRaises(KeyError):
            self.repository.unlock("unknown")
        self.assertEqual(saved, self.path.read_bytes())

    def test_concurrent_unlocks_preserve_both_changes(self):
        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(self.repository.unlock, ["first", "second"]))
        self.assertTrue(all(item.unlocked for item in self.repository.list_locations()))

    def test_failed_replace_preserves_original_file(self):
        saved = self.path.read_bytes()
        with patch("backend.src.repositories.location_repository.os.replace", side_effect=OSError):
            with self.assertRaises(OSError):
                self.repository.unlock("first")
        self.assertEqual(saved, self.path.read_bytes())
        self.assertEqual(list(self.path.parent.glob("*.tmp")), [])

    def test_corrupt_data_is_not_overwritten(self):
        self.path.write_text("broken JSON", encoding="utf-8")
        with self.assertRaises(ValueError):
            self.repository.unlock("first")
        self.assertEqual(self.path.read_text(), "broken JSON")
