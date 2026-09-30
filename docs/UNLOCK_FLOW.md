# Ten-site unlock flow

## Rules and sources of truth

- `database/seeds/seed_locations.py` defines the ten supported location IDs,
  recognition labels, coordinates, and geofence radii. Seeding creates or updates
  catalog rows; it does not grant user access.
- `heritage_locations` is the backend catalog. Frontend catalogs provide images,
  routes, and translations, but cannot authorize an unlock.
- `user_history` is the authoritative per-user unlock table. Its composite key
  `(user_id, location_id)` permits one stamp per site per account.
- `users.unlocked_location_ids` is retained for existing-database compatibility.
  It is not read for authorization and must not be used to grant access.
- All ten sites can be unlocked independently. The five randomly assigned reward
  targets in `routes/rewards.py` are a separate challenge, not an unlock limit.

## File-to-file sequence

Paths are relative to the repository root.

| Step | File | Responsibility and next file |
| --- | --- | --- |
| 1 | `frontend/src/pages/camera/CameraPage.jsx` | Handles scan actions and calls `hooks/useCameraStream.js` and `hooks/useLiveLocation.js`. |
| 2 | `frontend/src/pages/camera/hooks/useCameraStream.js` | Starts the stream; calls `frontend/src/utils/cameraPreview.js` to wait for a drawable frame, then `imageProcessing.js` to encode JPEG. |
| 3 | `frontend/src/App.jsx` | Receives image/GPS from CameraPage and calls `services/check-in-service/index.js`. |
| 4 | `frontend/src/services/check-in-service/index.js` | Uploads multipart image/GPS with the session cookie to `POST /api/checkins/verify`. |
| 5 | `backend/src/dependencies/auth.py` | Resolves the current user before the route runs. Missing/expired sessions return HTTP 401. |
| 6 | `backend/src/routes/checkins.py` | Loads the catalog, calls `services/vision.py`, matches the returned label to the database, and checks confidence and distance to that recognized site. |
| 7 | `backend/src/services/unlocks.py` | Writes `UserHistory` without committing. The caller commits the audit log and unlock in one transaction. |
| 8 | `frontend/src/hooks/useLocationProgress.js` | Accepts verified responses from App and updates shared state using `utils/locationProgress.js`. |
| 9 | `frontend/src/services/passport-service/index.js` | On login/reload, requests `GET /api/progress`, implemented by `backend/src/routes/progress.py`. |
| 10 | `frontend/src/App.jsx` | Passes the same unlock set to home, map, catalog, detail, account, and passport pages. |

## GPS and recognition

Several seeded buildings are less than 30 meters apart. Requiring the recognized
building to be the nearest GPS point rejects valid photographs inside overlapping
geofences. The route checks distance to the **recognized database site**.
For example, a photograph of Thai Hoc Hall can pass while the GPS fix is nearer
the Bell and Drum Towers, provided the fix is within the hall's own radius.
Only the recognized site is unlocked.

Unknown labels, low confidence, and out-of-range GPS are recorded as rejected
attempts without granting access. An unknown label uses the nearest site only
as the diagnostic target for the rejected log.

## Persistence, retries, and account isolation

`services/unlocks.py` uses a SQLite upsert so repeated successful scans cannot
create duplicate stamps. It preserves the original successful timestamp. A false
history row can become true when a verified scan succeeds. A failed transaction
rolls back both the log and the unlock.

`PUT /api/locations/{id}/unlock` is a repair endpoint, not a shortcut. It requires
a verified log for the same user and exact location before calling the shared
unlock writer. Unknown IDs return 404; missing evidence returns 409.

The frontend merges the initial progress snapshot with successful scans that
finished while it was loading. Requests are canceled on account changes; stale
responses cannot add another user's stamps. Only known catalog IDs and explicit
successful status values count toward the ten-site passport.

The AI guide independently checks `UserHistory` in `backend/src/routes/chat.py`.
A frontend route, local state change, or legacy JSON value does not grant backend
access to a locked site's guide.

## Tests

See [TESTING.md](TESTING.md) for commands. `backend/tests/test_location_unlocks.py`
exercises the seeded database and HTTP routes; `frontend/tests/locationProgress.test.js`
checks the catalog contract and state transitions. Camera readiness tests live in
`frontend/tests/cameraPreview.test.js`. `frontend/tests/locationDetail.test.js`
renders all ten detail pages and ensures the reward challenge cannot hide earned stamps.
