# Running the regression tests

Run commands from the repository root unless noted otherwise. Install the normal
dependencies first using [README.md](../README.md).

## Backend

Windows PowerShell:

```powershell
backend/.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
```

Linux/macOS:

```sh
backend/.venv/bin/python -m unittest discover -s backend/tests -v
```

`backend/tests/support.py` provides test-only configuration before route imports.
Each suite creates its own in-memory SQLite engine and patches routes and seeds
to use it. Tests do not import production startup migrations or modify the
visitor database. HTTP tests exercise real parsing, GPS checks, and commits.
Vision responses are mocked: no paid AI key or physical camera is needed.

| Test file | Coverage |
| --- | --- |
| `backend/tests/test_checkin_routes.py` | Successful check-in, far GPS rejection, audit history ordering and user isolation. |
| `backend/tests/test_location_unlocks.py` | All ten seeded sites, persistence, overlapping geofences, confidence and unknown-label rejection, repeat scans, cross-account isolation, verified repair, legacy/false history, reseeding, missing sessions, and transaction rollback. |

## Frontend

```powershell
cd frontend
npm ci
npm test
npm run check:locales
npm run build
```

The test script uses Node's built-in runner; no additional framework is required.
Component tests use the existing Vite/React dependencies to render real JSX with
server-side rendering. Test files are grouped in `frontend/tests/`, outside
production source.

| Test file | Coverage |
| --- | --- |
| `frontend/tests/cameraPreview.test.js` | Decoded-frame readiness, already-loaded video, playback failure, timeout, cancellation, and HTTP 401 classification. |
| `frontend/tests/locationDetail.test.js` | Real rendering of all ten locked/unlocked detail pages, stamps outside the five-site reward challenge, and public figures without site stamps. |
| `frontend/tests/locationProgress.test.js` | Database/frontend agreement on ten IDs, detail-route coverage, reload restoration, delayed-snapshot races, repeat scans, rejected/unknown IDs, account switching, and authenticated/cancelable progress requests. |

## Manual device checks

Automated tests do not establish physical-device camera quality or live AI accuracy.
On the HTTPS deployment, check these flows:

1. Deny camera access, allow it, choose **Open camera again**, and capture a photo.
2. Deny GPS, capture a photo, then allow GPS and retry verification with that photo.
3. Verify a site; confirm its catalog card, detail page, map marker, and passport
   stamp agree. Reload and confirm the stamp remains.
4. Repeat the same site: the count must not increase. Complete the other nine sites
   and confirm 10/10, independently of the five-site reward challenge.
5. Sign out and use another account: the first account's stamps must not appear.
6. Expire the session before sending a scan: show a sign-in action rather than a
   recognition failure or a silent shutter.
