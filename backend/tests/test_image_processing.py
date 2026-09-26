import unittest
from io import BytesIO
from unittest.mock import patch, AsyncMock
import base64

import httpx
from PIL import Image

from backend.src.services.image_processing import InvalidImageError, prepare_vision_image
from backend.src.services.vision import recognize_heritage_image


def make_image(size=(1280, 720), mode="RGB", color="red", **save_options):
    output = BytesIO()
    Image.new(mode, size, color).save(output, format="PNG", **save_options)
    return output.getvalue()


class ImageProcessingTests(unittest.TestCase):
    def test_landscape_and_portrait_preserve_aspect_ratio(self):
        for size, expected in [((1280, 720), (512, 288)), ((720, 1280), (288, 512)), ((1200, 1200), (512, 512))]:
            result = prepare_vision_image(make_image(size))
            with Image.open(BytesIO(result.data)) as image:
                self.assertEqual(image.size, expected)
                self.assertEqual(image.format, "JPEG")
                self.assertEqual(image.mode, "RGB")

    def test_small_images_are_not_enlarged(self):
        result = prepare_vision_image(make_image((120, 80)))
        self.assertEqual((result.width, result.height), (120, 80))

    def test_transparency_is_flattened_on_white(self):
        result = prepare_vision_image(make_image((30, 30), "RGBA", (0, 0, 0, 0)))
        with Image.open(BytesIO(result.data)) as image:
            self.assertEqual(image.getpixel((0, 0)), (255, 255, 255))

    def test_orientation_is_applied_and_metadata_removed(self):
        exif = Image.Exif()
        exif[274] = 6
        exif[270] = "Private image description"
        result = prepare_vision_image(make_image((120, 80), exif=exif))
        with Image.open(BytesIO(result.data)) as image:
            self.assertEqual(image.size, (80, 120))
            self.assertFalse(image.getexif())

    def test_invalid_or_oversized_images_are_rejected(self):
        for value in [b"fake-jpeg-content", b""]:
            with self.assertRaises(InvalidImageError):
                prepare_vision_image(value)
        with patch("backend.src.services.image_processing.MAX_INPUT_PIXELS", 100):
            with self.assertRaises(InvalidImageError):
                prepare_vision_image(make_image((11, 10)))


class VisionPayloadTests(unittest.IsolatedAsyncioTestCase):
    async def test_provider_receives_normalized_jpeg_and_low_detail(self):
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.post.return_value = httpx.Response(
            200, request=httpx.Request("POST", "https://provider.invalid"),
            json={"choices": [{"message": {"content": '{"label":"gate","confidence":0.9}'}}]},
        )
        with patch.dict("os.environ", {"YESCALE_API_KEY": "test-only"}), patch(
            "backend.src.services.vision.httpx.AsyncClient", return_value=client,
        ):
            result = await recognize_heritage_image(make_image(), "image/png", ["gate"])
        self.assertEqual(result.label, "gate")
        payload = client.post.call_args.kwargs["json"]
        item = payload["messages"][0]["content"][1]["image_url"]
        self.assertEqual(item["detail"], "low")
        self.assertTrue(item["url"].startswith("data:image/jpeg;base64,"))
        with Image.open(BytesIO(base64.b64decode(item["url"].split(",", 1)[1]))) as image:
            self.assertEqual(image.size, (512, 288))
        self.assertEqual(payload["max_tokens"], 150)
