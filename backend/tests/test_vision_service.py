import unittest

from backend.src.routes.checkins import calculate_distance_meters
from backend.src.services.vision import VisionProviderError, _extract_json


class VisionServiceTests(unittest.TestCase):
    def test_extracts_json_even_when_model_adds_code_fence(self):
        result = _extract_json(
            '```json\n{"label":"khue_van_cac","confidence":0.91,"reason":"match"}\n```'
        )
        self.assertEqual(result["label"], "khue_van_cac")
        self.assertEqual(result["confidence"], 0.91)

    def test_rejects_response_without_json(self):
        with self.assertRaises(VisionProviderError):
            _extract_json("I cannot recognize this image")

    def test_distance_is_zero_for_same_coordinate(self):
        distance = calculate_distance_meters(21.02868, 105.83592, 21.02868, 105.83592)
        self.assertAlmostEqual(distance, 0.0)


if __name__ == "__main__":
    unittest.main()
