"""Serve the production React build and API from a single HTTPS origin.

Build frontend/dist before starting this entry point. TLS can be provided by
Uvicorn locally or a trusted reverse proxy on the deployment host.
"""

from pathlib import Path

from fastapi import HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.src.app.main import create_app

DIST = Path(__file__).resolve().parents[3] / "frontend" / "dist"
if not (DIST / "index.html").is_file():
    raise RuntimeError("Frontend build is missing. Run npm run build in frontend first.")

app = create_app()
app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")
app.mount("/images", StaticFiles(directory=DIST / "images"), name="images")


@app.middleware("http")
async def web_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if response.status_code == 200 and request.url.path.startswith("/assets/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif response.status_code == 200 and request.url.path.startswith("/images/"):
        response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.get("/{path:path}", include_in_schema=False)
def frontend_page(path: str):
    # Only application routes receive the SPA shell. Missing API/assets stay 404.
    if path and path != "Explore" and not path.startswith("Explore/"):
        raise HTTPException(status_code=404, detail="Not found.")
    return FileResponse(DIST / "index.html", headers={"Cache-Control": "no-cache"})
