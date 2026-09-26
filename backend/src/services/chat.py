import logging
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")
logger = logging.getLogger(__name__)


class ChatConfigurationError(Exception):
    pass


class ChatProviderError(Exception):
    pass


async def answer_heritage_question(
    *,
    location_name: str,
    story_summary: str,
    deep_history: str | None,
    question: str,
) -> str:
    api_key = os.getenv("YESCALE_API_KEY", "").strip()
    if not api_key:
        raise ChatConfigurationError("YESCALE_API_KEY is missing from the .env file.")

    base_url = os.getenv("YESCALE_BASE_URL", "https://api.yescale.io/v1").rstrip("/")
    model = os.getenv("YESCALE_CHAT_MODEL", "gpt-4o-mini")
    context = (
        f"Location: {location_name}\n"
        f"Summary: {story_summary}\n"
        f"Detailed history: {deep_history or 'No additional information is available.'}"
    )
    payload = {
        "model": model,
        "temperature": 0.2,
        "max_tokens": 500,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a historical guide at the Temple of Literature in Hanoi. "
                    "Answer clearly and warmly in English. "
                    "Use only the information in the supplied reference material. "
                    "If the material does not contain enough information, say so; "
                    "never invent events or dates."
                ),
            },
            {
                "role": "user",
                "content": f"REFERENCE MATERIAL:\n{context}\n\nQUESTION:\n{question}",
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )
            response.raise_for_status()
            answer = response.json()["choices"][0]["message"]["content"]
    except httpx.TimeoutException as error:
        raise ChatProviderError("YEScale chat request timed out.") from error
    except httpx.HTTPStatusError as error:
        logger.warning(
            "YEScale chat returned HTTP %s: %s",
            error.response.status_code,
            error.response.text[:500],
        )
        raise ChatProviderError(
            f"YEScale rejected the chat request (HTTP {error.response.status_code})."
        ) from error
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise ChatProviderError("Could not retrieve a response from YEScale.") from error

    if not isinstance(answer, str) or not answer.strip():
        raise ChatProviderError("YEScale returned an empty answer.")
    return answer.strip()
