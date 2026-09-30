"""Test-only configuration, imported before backend routes or token services.

Every database test patches route engines with an isolated SQLite engine. No
test imports app/main.py, whose startup migrations target the configured DB.
"""
import os

os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-key-at-least-thirty-two-characters")
os.environ.setdefault("DATABASE_URL", "sqlite://")
