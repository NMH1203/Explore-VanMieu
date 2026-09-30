"""Persist verified unlocks for both routes/checkins.py and routes/locations.py.

models/user_history.py is the authoritative per-user unlock table. Readers in
routes/progress.py, routes/locations.py, and routes/chat.py use that same table;
the legacy User.unlocked_location_ids JSON field is not an authorization source.
"""

from datetime import datetime, timezone

from sqlalchemy import case
from sqlalchemy.dialects.sqlite import insert
from sqlmodel import Session

from backend.src.models.user_history import UserHistory


def save_verified_unlock(session: Session, user_id: str, location_id: str) -> None:
    """Upsert one stamp after the caller has checked trusted verification evidence.

    Do not commit here: checkins.py must commit the audit log and unlock together.
    The composite primary key prevents duplicate stamps during concurrent scans,
    and repeated successful scans preserve the first successful unlock time.
    """
    statement = insert(UserHistory).values(
        user_id=user_id,
        location_id=location_id,
        status=True,
        unlocked_at=datetime.now(timezone.utc),
    )
    session.execute(statement.on_conflict_do_update(
        index_elements=["user_id", "location_id"],
        set_={
            "status": True,
            "unlocked_at": case(
                (UserHistory.status.is_(True), UserHistory.unlocked_at),
                else_=statement.excluded.unlocked_at,
            ),
        },
    ))
