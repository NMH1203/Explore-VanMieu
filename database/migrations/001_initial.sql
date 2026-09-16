CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'visitor' CHECK(role IN ('visitor', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  radius_meters INTEGER NOT NULL CHECK(radius_meters BETWEEN 10 AND 300),
  stamp_icon TEXT NOT NULL DEFAULT '★',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX artifacts_location ON artifacts(location_id);
CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  location_id TEXT NOT NULL REFERENCES locations(id),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy_meters REAL NOT NULL,
  distance_meters REAL NOT NULL,
  observed_at TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, location_id, visit_date)
);
CREATE INDEX check_ins_history ON check_ins(user_id, created_at DESC);
CREATE TABLE stamps (
  user_id TEXT NOT NULL REFERENCES users(id),
  location_id TEXT NOT NULL REFERENCES locations(id),
  check_in_id TEXT NOT NULL REFERENCES check_ins(id),
  collected_at TEXT NOT NULL,
  PRIMARY KEY(user_id, location_id)
);
CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  visit_date TEXT NOT NULL,
  UNIQUE(user_id, visit_date)
);
CREATE TABLE journey_stops (
  journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id),
  position INTEGER NOT NULL,
  PRIMARY KEY(journey_id, location_id),
  UNIQUE(journey_id, position)
);
CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold INTEGER NOT NULL CHECK(threshold BETWEEN 1 AND 10000),
  kind TEXT NOT NULL CHECK(kind IN ('badge', 'digital', 'physical')),
  stock INTEGER CHECK(stock IS NULL OR stock >= 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE reward_claims (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  reward_name TEXT NOT NULL,
  reward_kind TEXT NOT NULL,
  claim_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('pending', 'fulfilled')),
  claimed_at TEXT NOT NULL,
  fulfilled_at TEXT,
  UNIQUE(user_id, reward_id)
);
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX audit_created ON audit_logs(created_at DESC);
CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
