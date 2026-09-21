import base64
import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import httpx
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")
logger = logging.getLogger(__name__)


class VisionConfigurationError(Exception):
    pass


class VisionProviderError(Exception):
    pass


@dataclass(frozen=True)
class VisionResult:
    label: str
    confidence: float
    reason: str


def _extract_json(content: str) -> dict:
    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise VisionProviderError("AI trả về dữ liệu không đúng định dạng JSON")

    try:
        return json.loads(content[start:end + 1])
    except json.JSONDecodeError as error:
        raise VisionProviderError("Không đọc được kết quả từ AI") from error


async def recognize_heritage_image(
    image_bytes: bytes,
    mime_type: str,
    allowed_labels: list[str],
) -> VisionResult:
    api_key = os.getenv("YESCALE_API_KEY", "").strip()
    if not api_key:
        raise VisionConfigurationError("Thiếu YESCALE_API_KEY trong file .env")

    base_url = os.getenv("YESCALE_BASE_URL", "https://api.yescale.io/v1").rstrip("/")
    model = os.getenv("YESCALE_VISION_MODEL", "gpt-4o-mini")
    encoded_image = base64.b64encode(image_bytes).decode("ascii")
    labels_text = ", ".join(allowed_labels)

    prompt = (
        "Bạn là hệ thống nhận diện địa điểm tại Văn Miếu - Quốc Tử Giám. "
        f"Chỉ được chọn một nhãn trong danh sách sau: {labels_text}. "
        "Nếu ảnh không đủ rõ hoặc không khớp, dùng nhãn unknown. "
        "Chỉ trả về một JSON có dạng "
        '{"label":"...","confidence":0.0,"reason":"..."}. '
        "confidence nằm trong khoảng 0 đến 1."
    )
    payload = {
        "model": model,
        "temperature": 0,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{encoded_image}",
                        },
                    },
                ],
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
    except httpx.TimeoutException as error:
        raise VisionProviderError("YEScale xử lý ảnh quá thời gian cho phép") from error
    except httpx.HTTPStatusError as error:
        logger.warning(
            "YEScale returned HTTP %s: %s",
            error.response.status_code,
            error.response.text[:500],
        )
        raise VisionProviderError(
            f"YEScale từ chối yêu cầu (HTTP {error.response.status_code})"
        ) from error
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise VisionProviderError("Không thể nhận kết quả từ YEScale") from error

    result = _extract_json(content)
    label = str(result.get("label", "unknown")).strip()
    if label not in allowed_labels:
        label = "unknown"

    try:
        confidence = max(0.0, min(1.0, float(result.get("confidence", 0))))
    except (TypeError, ValueError):
        confidence = 0.0

    return VisionResult(
        label=label,
        confidence=confidence,
        reason=str(result.get("reason", "")),
    )
