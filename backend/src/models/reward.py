from datetime import datetime, timezone
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, JSON


# SQLModel entity representing the 'reward_journeys' table (stores 5 random target location IDs assigned to each user)
class RewardJourney(SQLModel, table=True):
    __tablename__ = "reward_journeys"
    user_id: str = Field(primary_key=True, foreign_key="users.user_id")
    target_ids: list[str] = Field(sa_column=Column(JSON, nullable=False))


# SQLModel entity representing the 'reward_claims' table (records when a user claimed their completion certificate)
class RewardClaim(SQLModel, table=True):
    __tablename__ = "reward_claims"
    user_id: str = Field(primary_key=True, foreign_key="users.user_id")
    location_id: str
    claimed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

