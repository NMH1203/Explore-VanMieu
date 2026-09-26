"""Normalize uploaded images for inexpensive, low-detail vision requests."""

from dataclasses import dataclass
from io import BytesIO
import warnings

from PIL import Image, ImageOps, UnidentifiedImageError

MAX_EDGE = 512
JPEG_QUALITY = 75
MAX_INPUT_PIXELS = 20_000_000


class InvalidImageError(ValueError):
    """The upload cannot be safely decoded as a supported image."""


@dataclass(frozen=True)
class PreparedImage:
    data: bytes
    width: int
    height: int
    mime_type: str = "image/jpeg"


def prepare_vision_image(image_bytes: bytes) -> PreparedImage:
    """Fit within 512 x 512 without cropping/upscaling; remove metadata.

    JPEG quality reduces transfer bytes. The provider's detail setting, rather
    than JPEG byte size, controls the image-token budget for GPT-4o models.
    """
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(image_bytes)) as original:
                if original.format not in {"JPEG", "PNG", "WEBP"}:
                    raise InvalidImageError("Only JPEG, PNG, or WebP images are accepted.")
                if original.width * original.height > MAX_INPUT_PIXELS:
                    raise InvalidImageError("The image exceeds the 20 megapixel limit.")
                if getattr(original, "n_frames", 1) != 1:
                    raise InvalidImageError("Animated images are not supported.")
                original.load()
                oriented = ImageOps.exif_transpose(original)
                oriented.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
                # Flatten transparency onto white instead of producing black areas.
                rgba = oriented.convert("RGBA")
                output_image = Image.new("RGB", rgba.size, "white")
                output_image.paste(rgba, mask=rgba.getchannel("A"))
                output = BytesIO()
                output_image.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
                return PreparedImage(output.getvalue(), *output_image.size)
    except InvalidImageError:
        raise
    except (UnidentifiedImageError, OSError, ValueError,
            Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise InvalidImageError("The uploaded image is invalid or cannot be decoded.") from error
