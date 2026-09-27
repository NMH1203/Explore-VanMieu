"""Assign one persistent, randomly selected heritage target to each account."""

from secrets import choice

from sqlalchemy import inspect, text
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User


def ensure_target_column() -> None:
    """Add the target column to an existing SQLite database without data loss."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "target_location_id" not in columns:
        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE users ADD COLUMN target_location_id VARCHAR(32)"
            ))
            connection.execute(text(
                "CREATE INDEX IF NOT EXISTS ix_users_target_location_id "
                "ON users (target_location_id)"
            ))


def assign_target_location(session: Session, user: User) -> str | None:
    """Return the account's target, assigning a random location once if needed."""
    if user.target_location_id:
        return user.target_location_id

    location_ids = list(session.exec(
        select(HeritageLocation.location_id).order_by(HeritageLocation.sequence_order)
    ).all())
    if not location_ids:
        return None

    user.target_location_id = choice(location_ids)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user.target_location_id


def assign_targets_to_existing_users() -> None:
    """Backfill a target for every existing account that does not have one."""
    ensure_target_column()
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if "users" not in tables or "heritage_locations" not in tables:
        return
    with Session(engine) as session:
        users = session.exec(
            select(User).where(User.target_location_id.is_(None))
        ).all()
        location_ids = list(session.exec(
            select(HeritageLocation.location_id).order_by(HeritageLocation.sequence_order)
        ).all())
        if not location_ids:
            return
        for user in users:
            user.target_location_id = choice(location_ids)
            session.add(user)
        session.commit()
