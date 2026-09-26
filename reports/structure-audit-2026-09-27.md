# Project structure audit — 2026-09-27

## Verification

- Backend: 19 active SQLite/API/service tests passed after removing 6 tests for the unused JSON prototype.
- Frontend: 8 tests passed.
- Python source compilation: passed.
- Vietnamese/English locale key parity: passed.
- Vite production build: passed (1,907 modules).
- Authenticated API smoke test: login, current user, account target, progress,
  locations, and figure chat history all returned successfully.

## Changes made

- Moved authentication endpoints from `backend/src/app/main.py` to
  `backend/src/routes/auth.py`. The app entry point now only configures
  middleware and registers routers.
- Moved location/figure presentation metadata from
  `LocationDetailPage.jsx` to `frontend/src/data/heritageItems.js`.
- Kept daily journey selection in `frontend/src/data/dailyJourney.js` so it is
  shared by the journey card and detail pages.
- Removed unused `LocationBanner.jsx`, its obsolete CSS, and the unused
  `frontend/src/services/api.js` service.
- Rewrote `docs/requirements/camera.md` so it documents the current API-backed workflow instead
  of the old local-storage prototype.

## Current boundaries

- `backend/src/app`: application composition and production static hosting.
- `backend/src/routes`: HTTP concerns only.
- `backend/src/services`: password, token, target assignment, AI, and image
  processing logic.
- `backend/src/models`: SQLModel/Pydantic database and API schemas.
- `frontend/src/pages`: page-level UI and page-specific CSS.
- `frontend/src/components`: reusable cross-page UI, grouped by component responsibility.
- `frontend/src/data`: shared frontend catalogs and journey selection.
- `frontend/src/services`: one folder per API capability.
- `frontend/src/routes`: route paths and URL normalization.
- `frontend/src/utils`: API-response and camera-image helpers without UI state.

## Removed legacy code

Removed the unused JSON progress prototype (`location_repository.py`,
`location_statuses.json`, and its isolated test). The active application stores
progress in SQLite through the FastAPI routes and SQLModel models.

## Optional future cleanup

- `HomePage.jsx` remains large because it contains many static landing-page
  sections. Split it only when those sections need independent state, tests, or
  reuse; splitting solely by line count would add indirection without changing
  behavior.
- Page-specific CSS files are large but correctly colocated. A design-token or
  component-style split is useful only if the same patterns begin to diverge.
- Add endpoint-level auth tests for register/login/logout; current smoke tests
  and service tests cover runtime behavior but not every cookie attribute.
