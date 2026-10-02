import unittest
from io import BytesIO
from unittest.mock import patch

import httpx
from PIL import Image

from backend.src.services.vision import VisionProviderError, recognize_heritage_image


class VisionProviderTests(unittest.IsolatedAsyncioTestCase):
    async def recognize(self, handler):
        # Utility helper creating a dummy JPEG image and executing vision API calls using mocked HTTP responses.
        image = BytesIO()
        Image.new("RGB", (16, 16)).save(image, format="JPEG")
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        with patch.dict("os.environ", {
            "YESCALE_API_KEY": "test-secret",
            "YESCALE_BASE_URL": "https://provider.test/v1",
            "YESCALE_VISION_MODEL": "gpt-4o-mini",
        }), patch("backend.src.services.vision.httpx.AsyncClient", return_value=client):
            return await recognize_heritage_image(image.getvalue(), "image/jpeg", ["khue_van_cac"])

    async def test_timeout_explains_recovery(self):
        # Validates VisionProviderError exception handling when provider requests time out.
        def handler(request):
            raise httpx.ReadTimeout("timeout", request=request)
        with self.assertRaisesRegex(VisionProviderError, "timed out after 90 seconds"):
            await self.recognize(handler)

    async def test_invalid_key_explains_configuration(self):
        # Validates clear error messaging when API authentication fails (401 status).
        with self.assertRaisesRegex(VisionProviderError, "Check YESCALE_API_KEY"):
            await self.recognize(lambda request: httpx.Response(401, json={"error": "Unauthorized"}))

    async def test_connection_failure_explains_network(self):
        # Verifies handling of underlying network connectivity failures.
        def handler(request):
            raise httpx.ConnectError("connection failed", request=request)
        with self.assertRaisesRegex(VisionProviderError, "Could not connect to YEScale"):
            await self.recognize(handler)

    async def test_empty_content_is_provider_error(self):
        # Verifies handling when the AI vision service returns empty or null response content.
        with self.assertRaisesRegex(VisionProviderError, "no image analysis"):
            await self.recognize(lambda request: httpx.Response(200, json={
                "choices": [{"message": {"content": None}}],
            }))

    async def test_valid_recognition(self):
        # Asserts accurate parsing of structured JSON payload on successful API response.
        result = await self.recognize(lambda request: httpx.Response(200, json={
            "choices": [{"message": {"content": '{"label":"khue_van_cac","confidence":0.9,"reason":"matched"}'}}],
        }))
        self.assertEqual(result.label, "khue_van_cac")
        self.assertEqual(result.confidence, 0.9)
