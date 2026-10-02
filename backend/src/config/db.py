import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import event
from sqlmodel import create_engine

# Resolve project root and load environment variables from .env
PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")

# Construct database connection URL (defaults to SQLite file database)
database_url = os.getenv(
    "DATABASE_URL", f"sqlite:///{(PROJECT_ROOT / 'database/explore_van_mieu.db').as_posix()}",
)

# Initialize SQLAlchemy / SQLModel engine
engine = create_engine(database_url)


# Ensure SQLite enforces foreign key constraints on every new connection
@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(
    database_connection,
    connection_record,
):
    cursor = database_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

