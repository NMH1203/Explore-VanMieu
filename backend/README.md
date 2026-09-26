# Backend HTTPS and location progress

Run these commands from the repository root. The API uses the SQLite database
created by `database/init_db.py` and seeded by `database/seed_locations.py`.

## HTTPS and camera access

Browsers require a secure page before granting camera access. `localhost` is
treated as secure over HTTP for local development. When testing from a phone
or another computer, serve both the frontend page and API over HTTPS; enabling
HTTPS on the API alone cannot make an HTTP frontend secure.

Create a short-lived self-signed certificate for local testing. Replace
`192.168.1.50` with the computer's LAN IPv4 address when testing from a phone;
the IP must be present in the certificate's subject alternative names:

```powershell
openssl req -x509 -newkey rsa:2048 -nodes -keyout backend-local.key -out backend-local.crt -days 2 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.1.50"
```

Start FastAPI with TLS enabled:

```powershell
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.main:app --reload --host 0.0.0.0 --port 8443 --ssl-keyfile backend-local.key --ssl-certfile backend-local.crt
```

Open `https://localhost:8443/docs` to confirm that the TLS endpoint responds.
The self-signed certificate is only for local testing and will show a browser
trust warning. Use a trusted certificate for a deployed site. HTTPS login
cookies are marked `Secure` automatically; HTTP localhost development keeps
the cookie usable.

The Vite configuration in `frontend/vite.config.js` automatically enables
HTTPS when it finds `backend-local.key` and `backend-local.crt` in the
repository root. It serves the page at `https://localhost:5173` for local
computer testing. For phone testing, install and trust the self-signed
certificate on the phone, then start the backend and frontend with these
commands in separate terminals:

```powershell
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.main:app --host 0.0.0.0 --port 8443 --ssl-keyfile backend-local.key --ssl-certfile backend-local.crt
```

```powershell
$env:VITE_API_TARGET = "https://127.0.0.1:8443"
$env:VITE_API_TLS_INSECURE = "true"
Set-Location frontend
npm run dev
```

Open `https://localhost:5173` on the computer. For phone access, start Vite
with `npm run dev -- --host 0.0.0.0` instead, then open
`https://192.168.1.50:5173`, replacing the address with the computer's LAN
IPv4 address. Vite proxies `/api` to the HTTPS backend, so the browser only
communicates with the secure frontend origin. The
`VITE_API_TLS_INSECURE` setting is for the local self-signed backend
certificate; omit it when the backend uses a trusted certificate. Allow the
frontend and backend ports through the computer's private-network firewall if
the phone cannot connect.

## Database location unlock flow

The backend modules connect as follows:

- `backend/src/app/main.py` registers the API routers and creates the app.
- `backend/src/config/db.py` creates the SQLite SQLModel engine.
- `database/init_db.py` creates tables for the models, including
  `heritage_locations`, `checkin_logs`, and `user_history`.
- `database/seed_locations.py` inserts the 10 locations into
  `heritage_locations`.
- `backend/src/routes/checkins.py` checks GPS distance, calls the configured
  YEScale vision service, writes the verification log, and creates a user's
  `user_history` row only after a matching image passes the confidence check.
- `backend/src/routes/locations.py` returns all database locations with the
  signed-in user's unlock status. Its unlock endpoint only synchronizes a
  successful verified check-in; it does not let a request unlock a location
  without a verified `checkin_logs` record.
- `backend/src/routes/progress.py` returns the signed-in user's saved progress.

Initialize or refresh the local development database and start the API:

```powershell
backend\.venv\Scripts\python.exe -m database.init_db
backend\.venv\Scripts\python.exe -m database.seed_locations
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.main:app --reload --port 8000
```

Sign in before calling `GET /api/locations` or
`PUT /api/locations/{location_id}/unlock`; both endpoints use the session cookie.
The unlock endpoint returns `409` if the user has no verified check-in for
that location and `404` if the location is not in the database. Repeating an
unlock after successful verification is safe.

The YEScale provider is left configured through the existing `YESCALE_*`
environment variables and `backend/src/services/vision.py`.

## Serve the production web build over local HTTPS

The `backend.src.app.web:app` entry point serves `frontend/dist` and the API
from one origin. Build the frontend first; initialize/seed the database using
the commands above. This entry point requires the frontend build to exist.

```powershell
Set-Location frontend
npm run build
Set-Location ..
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.web:app --host 127.0.0.1 --port 8443 --ssl-keyfile backend-local.key --ssl-certfile backend-local.crt
```

Use the local certificate setup described above. Open `https://localhost:8443`.
A self-signed certificate must be trusted on the testing device for normal browser
use; the automated test below trusts its certificate only inside its HTTP client.
For a public deployment, supply a certificate trusted by users' browsers. If TLS
terminates at a reverse proxy, configure trusted forwarded headers for that proxy
so secure login cookies reflect the original HTTPS request.

Run the isolated HTTPS/concurrency verification without changing the development
database or certificate files:

```powershell
backend\.venv\Scripts\python.exe scripts/test_https_load.py --users 10,25,50 --seconds 10
```

The script starts and stops its own HTTPS server. It writes the measured results
to `reports/https-load-local.json`. Read `reports/verification-2026-09-26.md` for
the scenarios, limits, and image-token settings. `DATABASE_URL` can select a
separate database; the default remains the repository's development SQLite file.
