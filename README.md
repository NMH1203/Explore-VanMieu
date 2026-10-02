# Explore Van Mieu

A web app for exploring Hanoi's Temple of Literature through an interactive map, GPS and photo check-ins, a digital heritage passport, and an AI guide. The interface supports English and Vietnamese.

## Features

- Explore ten heritage sites and their stories.
- Create an account and save your visit progress.
- Verify check-ins using GPS and image recognition.
- Collect heritage stamps and ask questions about unlocked sites.
- Resize camera images before uploading them for AI recognition.

## Tech stack

- **Frontend:** React, Vite, Leaflet, and CSS.
- **Backend:** Python, FastAPI, SQLModel, and SQLite.
- **Authentication:** Argon2 password hashing and JWT session cookies.
- **AI:** YEScale-compatible vision and chat APIs.

## Project structure

```text
Explore-VanMieu/
├── frontend/
│   ├── public/images/       # Site photos and visual assets
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── hooks/           # Shared database-backed progress state
│   │   ├── i18n/            # Language configuration
│   │   ├── locales/         # English and Vietnamese translations
│   │   ├── pages/           # Pages and page-specific components
│   │   ├── services/        # API requests grouped by capability
│   │   ├── utils/           # Shared response and image processing helpers
│   │   ├── styles/          # Shared styles
│   │   ├── App.jsx
│   │   └── routes/index.js
│   ├── tests/               # Run with npm test
│   │   ├── cameraPreview.test.js   # Camera readiness and HTTP errors
│   │   ├── locationDetail.test.js  # Locked/unlocked pages for all ten sites
│   │   └── locationProgress.test.js # Ten-site contract and progress races
│   └── scripts/             # Translation checks
├── backend/
│   ├── src/
│   │   ├── app/             # API and production web entry points
│   │   ├── config/          # Database connection
│   │   ├── dependencies/    # Shared authentication checks
│   │   ├── models/          # Database and request/response models
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Authentication, AI, and image processing
│   ├── tests/               # Isolated SQLite and API regression tests
│   │   ├── support.py       # Test-only configuration
│   │   ├── test_checkin_routes.py
│   │   └── test_location_unlocks.py
│   └── requirements.txt
├── database/
│   ├── schema/init_db.py    # Create database tables
│   ├── seeds/seed_locations.py # Seed the ten heritage sites
│   └── seeds/seed_demo_admin.py # Create/update the development admin
├── docs/
│   ├── UNLOCK_FLOW.md        # English file map and ten-site unlock rules
│   └── TESTING.md            # Test commands, coverage, and isolation
├── reports/                 # Verification results
└── README.md
```

## Setup

For the database-to-UI unlock sequence, see [Unlock flow](docs/UNLOCK_FLOW.md).
For test commands and coverage, see [Testing](docs/TESTING.md).

Requires Python 3.12+, Node.js 20.19+ or 22.12+, npm, and Git. The commands below use Windows PowerShell, starting from the repository root.

### Backend

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Create `.env` in the repository root:

```env
JWT_SECRET_KEY=replace_with_a_long_random_secret
YESCALE_API_KEY=replace_with_your_api_key
YESCALE_BASE_URL=https://api.yescale.io/v1
YESCALE_VISION_MODEL=gpt-4o-mini
YESCALE_CHAT_MODEL=gpt-4o-mini
YESCALE_MIN_CONFIDENCE=0.70
```

Keep `.env` private. A valid YEScale key is needed for image recognition and AI chat.

Initialize the database and start the API:

```powershell
backend\.venv\Scripts\python.exe -m database.schema.init_db
backend\.venv\Scripts\python.exe -m database.seeds.seed_locations
backend\.venv\Scripts\python.exe -m database.seeds.seed_demo_admin
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.main:app --reload --port 8000
```

The development seed creates `root@example.com` as an administrator using the
credentials documented in `.env.example`. The password is hashed before it is
stored. This shared account is for local/test environments only; the SQLite
database itself remains private and is not committed to Git.

API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

To try protected endpoints such as check-in in Swagger, first call
`POST /api/auth/login` from `/docs` and provide your account email and password.
Swagger's browser session then sends the `session` cookie with subsequent
requests. If you get `401` with “The token is invalid or has expired,” log in
again and retry. Always use the same host for both sign-in and API requests:
`localhost` and `127.0.0.1` have separate browser cookies. A successful sign-in
in the frontend only carries over when it used the same host as `/docs`.

If `/api/checkins/verify` returns **502**, inspect the response's `detail` field
in Swagger. The backend reached the image recognition step, but YEScale failed
to return a usable result. The detail distinguishes a timeout, connection
failure, provider HTTP error, or invalid AI response. Check your key, quota,
and image-capable model. Start with `YESCALE_VISION_MODEL=gpt-4o-mini` as above.
Restart the backend after editing `.env`; Python reload does not reliably reload
environment-file changes. An existing `YESCALE_*` shell environment variable
takes precedence over `.env`. A 502 does not save a successful check-in; retry
after resolving the provider error.

### Frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite, usually [http://localhost:5173](http://localhost:5173). Requests to `/api` are forwarded to the backend on port 8000.

Camera and location access require HTTPS or localhost. See the [backend guide](backend/README.md) for local HTTPS setup.

## Production build

Build the frontend, then serve the website and API together from the repository root:

```powershell
npm --prefix frontend run build
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.web:app --host 127.0.0.1 --port 8000
```

Use HTTPS for public access. Local HTTPS setup instructions are in the [backend guide](backend/README.md).

## Team

| Name | Role |
| --- | --- |
| Nguyễn Minh Hoàng | Team Lead, Frontend Developer |
| Nguyễn Minh Lương | Frontend Developer |
| Lương Quỳnh Anh | Frontend Developer |
| Lê Bá Tiệp | Backend Developer |
| Lê Hiền Anh | Backend Developer |
| Nguyễn Duy Nam | Backend Developer |
| Lê Bá Ninh | Backend Developer |
