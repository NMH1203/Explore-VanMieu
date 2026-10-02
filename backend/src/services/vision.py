import base64
import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import httpx
from dotenv import load_dotenv
from starlette.concurrency import run_in_threadpool

from backend.src.services.image_processing import prepare_vision_image

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
    if not isinstance(content, str) or not content.strip():
        raise VisionProviderError("YEScale returned no image analysis. Retry or check YESCALE_VISION_MODEL.")
    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise VisionProviderError("The AI returned data that is not valid JSON.")

    try:
        return json.loads(content[start:end + 1])
    except json.JSONDecodeError as error:
        raise VisionProviderError("Could not parse the AI result.") from error


async def recognize_heritage_image(
    image_bytes: bytes,
    mime_type: str,
    allowed_labels: list[str],
) -> VisionResult:
    api_key = os.getenv("YESCALE_API_KEY", "").strip()
    if not api_key:
        raise VisionConfigurationError("YESCALE_API_KEY is missing from the .env file.")

    base_url = os.getenv("YESCALE_BASE_URL", "https://api.yescale.io/v1").rstrip("/")
    model = os.getenv("YESCALE_VISION_MODEL", "gpt-4o-mini")
    prepared = await run_in_threadpool(prepare_vision_image, image_bytes)
    encoded_image = base64.b64encode(prepared.data).decode("ascii")
    labels_text = ", ".join(allowed_labels)

    prompt = (
        "You identify locations at the Temple of Literature in Hanoi. "
        f"Choose exactly one label from this list: {labels_text}. "
        "If the image is unclear or does not match, use the label unknown. "
        "Return only one JSON object in this format: "
        '{"label":"...","confidence":0.0,"reason":"..."}. '
        "confidence must be between 0 and 1."
    )
    payload = {
        "model": model,
        "temperature": 0,
        "max_tokens": 150,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{prepared.mime_type};base64,{encoded_image}",
                            "detail": "low",
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
        raise VisionProviderError(
            f"The YEScale image request timed out after 90 seconds (model: {model}). "
            "Retry or set YESCALE_VISION_MODEL=gpt-4o-mini in .env and restart the backend."
        ) from error
    except httpx.HTTPStatusError as error:
        logger.warning(
            "YEScale returned HTTP %s: %s",
            error.response.status_code,
            error.response.text[:500],
        )
        status = error.response.status_code
        hint = (
            "Check YESCALE_API_KEY and its permissions."
            if status in (401, 403) else
            "Check your YEScale quota and request limits."
            if status in (402, 429) else
            "Check YESCALE_BASE_URL and whether YESCALE_VISION_MODEL supports images and is available to your key."
            if status in (400, 404, 422) else
            "The YEScale service is temporarily unavailable; retry shortly."
        )
        raise VisionProviderError(
            f"YEScale rejected the image request (HTTP {status}, model: {model}). {hint}"
        ) from error
    except httpx.RequestError as error:
        logger.warning("YEScale image connection failed: %s", type(error).__name__)
        raise VisionProviderError(
            "Could not connect to YEScale. Check YESCALE_BASE_URL, internet access, proxy and TLS certificates."
        ) from error
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise VisionProviderError("Could not retrieve a result from YEScale.") from error

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
