# Location unlock API

Run these commands from the repository root:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.src.app.main:app --reload
```

Open http://127.0.0.1:8000/docs to try the API.

- `GET /api/locations` reads every location's persisted unlock status.
- `PUT /api/locations/{location_id}/unlock` saves `unlocked: true` and returns that location. No request body or GPS coordinates are needed. Repeating the request is safe. Unknown identifiers return 404.

Example:

```powershell
Invoke-RestMethod -Method Put -Uri http://127.0.0.1:8000/api/locations/location-dai-trung-gate/unlock
```

Progress is stored in `backend/data/location_statuses.json`, independently of the working directory. The initial state matches the frontend: only `interpret` (Khue Van Cac) is unlocked. Updates survive server restarts. Invalid or inaccessible storage returns 500 without resetting progress.

For a test database, edit a location's `unlocked` flag to `true` or `false` and save valid JSON. The next GET reads the changed file without restarting the server. Responses disable caching. Avoid editing the file while an unlock request is writing it.

Local frontend origins `http://localhost:5173` and `http://127.0.0.1:5173` are allowed through CORS. Frontend integration can fetch `http://127.0.0.1:8000/api/locations` on page load and periodically (for example, every two seconds) to display external changes. The API does not push changes into an unmodified frontend.

This prototype uses one shared progress file, not per-user progress or a SQL database. Run only one server worker: the request lock is process-local. Manual unlocking has no authentication or GPS verification yet. The frontend is unchanged and still uses localStorage; API integration is a separate step.

The code separates HTTP routes, data models, and JSON persistence. Atomic file replacement prevents partially written JSON.

Run backend checks from the repository root:

```powershell
python -m unittest discover -s backend/tests
```
