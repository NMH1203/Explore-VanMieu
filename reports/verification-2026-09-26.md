# Local HTTPS and concurrency verification

Date: 2026-09-26. This report covers the local production build, not a public deployment.

## What was exercised

The test launches one Uvicorn worker serving `backend.src.app.web:app`. React's
built files and `/api` share a single HTTPS origin. Every run creates its own
SQLite database, users, JWT secret, certificate, and server log under the ignored
`.local-test/` directory. The existing development database and `.env` are not modified.
The child server is stopped when the test finishes.

TLS verification stays enabled. The HTTP client explicitly trusts only the
new local certificate; an ordinary client must reject it. No certificate is
installed into the operating system trust store.

Passed checks:

- TLS 1.3 with `TLS_AES_256_GCM_SHA384` and certificate verification.
- Self-signed certificate rejection without explicit trust.
- React production HTML, JS, CSS, images, and direct navigation to SPA routes.
- Missing assets/API routes return 404; `.env` and backend source are not served.
- Registration, duplicate-email rejection, login, cookie reuse, and logout.
- Session cookies have `Secure`, `HttpOnly`, and `SameSite=Lax`.
- API responses use `Cache-Control: no-store`; hashed assets use immutable caching.
- Distinct users receive their own account and progress data.
- Concurrent GPS-rejected check-ins write real SQLite logs without calling AI.

## Measured load

Each virtual user logs in, repeatedly requests a page, JS/CSS, one image, account,
progress, locations, and a GPS-rejected check-in, then logs out. Requests within a
user journey are sequential, with a 100 ms pause after each loop. Each user runs
for 10 seconds after login. The login burst and logout are included in aggregate
latencies and throughput. Static files are requested repeatedly without a browser
cache. Load generation and serving share the same Windows machine (8 logical CPUs).

| Concurrent users | Requests | Unexpected failures | Requests/sec | p95 latency | Login p95 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 10 | 750 | 0 | 61.56 | 251.01 ms | 1,166.05 ms |
| 25 | 1,171 | 0 | 86.36 | 628.95 ms | 3,009.93 ms |
| 50 | 1,958 | 0 | 133.30 | 748.90 ms | 4,257.96 ms |

There were 453 persisted check-in logs. The 85 responses with HTTP 401 are the
expected post-logout checks, not failures. Raw results and endpoint percentiles
are in `https-load-local.json`.

This is a short closed-loop benchmark, not a maximum-capacity or soak test.
The slowest measured operation was simultaneous login. Password verification and
resource contention are possible contributors, but profiling was not performed.
Password hashing was not weakened. A public host needs its own longer benchmark;
these numbers do not predict Internet/mobile performance or external AI throughput.
Browser rendering, camera permissions, reverse-proxy TLS termination, public DNS,
HTTP-to-HTTPS redirects, certificate renewal, and external map tiles were not tested.

## Reproduce

From the repository root:

```powershell
Set-Location frontend
npm run build
npm test
Set-Location ..
.\backend\.venv\Scripts\python.exe -m unittest discover -s backend/tests
.\backend\.venv\Scripts\python.exe scripts/test_https_load.py --users 10,25,50 --seconds 10
```

The script finds OpenSSL on PATH or at `D:/Git/usr/bin/openssl.exe`. On another
machine, pass `--openssl` with the executable's path. Use `--report` to preserve
multiple runs. The script caps load at 100 concurrent users and 120 seconds per
journey and only targets the server it starts on loopback.

## Image optimization

`frontend/src/services/imageProcessing.js` scales camera frames before upload.
`backend/src/services/image_processing.py` also normalizes direct API uploads:

- Fit within 512 x 512 pixels, preserving aspect ratio, without cropping/upscaling.
- JPEG quality 75, with transparency flattened onto white.
- Apply EXIF orientation and remove metadata from the encoded result.
- Reject invalid images, animations, and inputs above 20 megapixels.
- Retain the API's existing 5 MB upload limit.
- Run backend decoding/resizing in a thread pool rather than blocking the event loop.
- Send `detail: low` and limit the short recognition response to 150 output tokens.

A 1280 x 720 camera frame becomes 512 x 288: 84% fewer pixels. With the currently
configured GPT-4o-mini default, low detail uses a fixed base image-token budget,
independent of further reductions in JPEG dimensions. JPEG quality mainly affects
transfer size, not token count. The current official table lists 2,833 base tokens
for GPT-4o-mini; 85 is the GPT-4o figure, not GPT-4o-mini. YEScale may account for
usage differently. No billable request was made to validate provider billing.

Source: [OpenAI images and vision](https://developers.openai.com/api/docs/guides/images-vision).

| Existing sample | Original | Optimized | Byte reduction |
| --- | --- | --- | ---: |
| khue-van-cac.jpg | 960 x 1280; 348,870 bytes | 384 x 512; 39,559 bytes | 88.7% |
| van-mieu-hero.jpg | 1920 x 1280; 973,961 bytes | 512 x 341; 49,081 bytes | 95.0% |
| thai-hoc-building.webp | 1200 x 630; 268,362 bytes | 512 x 269; 37,391 bytes | 86.1% |

These measurements invoke the backend processor on repository samples; the source
assets remain unchanged. Raw measurements are in `image-optimization.json`.
Low detail is a cost-oriented default for recognizing whole buildings. Recognition
accuracy, inscriptions, and small architectural details still need real-image AI
evaluation. Smaller dimensions are not claimed to preserve all recognition quality.

Validation: 24 backend tests, 8 frontend tests, and the production build passed.
The vision payload test mocks the provider and checks the actual encoded image,
MIME type, `detail`, and output limit. It does not measure AI recognition quality.
