# Explore Van Mieu backend

Run from the repository root:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.src.app.main:app --reload
```

API documentation is available at `http://127.0.0.1:8000/docs`.

## Authentication

- `POST /api/auth/register` creates an account and returns a signed access token.
- `POST /api/auth/login` verifies the account and returns a signed access token.
- `GET /api/auth/status` reports whether the supplied bearer token represents a valid account.

Set `EXPLORE_VAN_MIEU_TOKEN_SECRET` outside local development so issued tokens cannot be forged. Passwords are stored as salted PBKDF2 hashes, never as plain text.

## Location progress

- `GET /api/locations` returns all locations locked for guests. With a valid bearer token, it returns the signed-in account's progress.
- `PUT /api/locations/{location_id}/unlock` records the unlock for the signed-in account and requires a bearer token.

The location catalog is stored in `backend/data/location_statuses.json`. Per-account progress is stored in `backend/data/users.json`. This remains a single-process JSON prototype; migrate both stores to the project database before production deployment.

The frontend uses `http://127.0.0.1:8000` by default. Set `VITE_API_URL` when the API runs elsewhere.

Run checks from the repository root:

```powershell
python -m unittest discover -s backend/tests
cd frontend
npm run build
```
