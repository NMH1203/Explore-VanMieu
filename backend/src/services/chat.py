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
        raise ChatConfigurationError("Thiếu YESCALE_API_KEY trong file .env")

    base_url = os.getenv("YESCALE_BASE_URL", "https://api.yescale.io/v1").rstrip("/")
    model = os.getenv("YESCALE_CHAT_MODEL", "gpt-4o-mini")
    context = (
        f"Địa điểm: {location_name}\n"
        f"Tóm tắt: {story_summary}\n"
        f"Lịch sử chi tiết: {deep_history or 'Chưa có dữ liệu bổ sung.'}"
    )
    payload = {
        "model": model,
        "temperature": 0.2,
        "max_tokens": 500,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Bạn là hướng dẫn viên lịch sử tại Văn Miếu - Quốc Tử Giám. "
                    "Hãy trả lời bằng tiếng Việt, rõ ràng và thân thiện. "
                    "Chỉ sử dụng thông tin trong phần tư liệu được cung cấp. "
                    "Nếu tư liệu không đủ để trả lời, hãy nói rằng dữ liệu hiện có "
                    "chưa cung cấp thông tin đó; không được tự bịa sự kiện hoặc niên đại."
                ),
            },
            {
                "role": "user",
                "content": f"TƯ LIỆU:\n{context}\n\nCÂU HỎI:\n{question}",
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
        raise ChatProviderError("YEScale trả lời quá thời gian cho phép") from error
    except httpx.HTTPStatusError as error:
        logger.warning(
            "YEScale chat returned HTTP %s: %s",
            error.response.status_code,
            error.response.text[:500],
        )
        raise ChatProviderError(
            f"YEScale từ chối yêu cầu (HTTP {error.response.status_code})"
        ) from error
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise ChatProviderError("Không thể nhận câu trả lời từ YEScale") from error

    if not isinstance(answer, str) or not answer.strip():
        raise ChatProviderError("YEScale trả về câu trả lời rỗng")
    return answer.strip()
