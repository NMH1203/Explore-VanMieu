"""Create or refresh the shared local-development administrator account."""

import os

from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.models.user import User
from backend.src.services.passwords import hash_password
from backend.src.services.targets import ensure_target_column


def seed_demo_admin() -> User:
    ensure_target_column()
    email = os.getenv("DEMO_ADMIN_EMAIL", "root@example.com").strip().lower()
    password = os.getenv("DEMO_ADMIN_PASSWORD", "RootTest123!")
    username = os.getenv("DEMO_ADMIN_USERNAME", "root").strip() or "root"
    if len(password) < 8:
        raise ValueError("DEMO_ADMIN_PASSWORD must contain at least 8 characters.")

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user is None:
            user = User(email=email, username=username, password_hash=hash_password(password))
        else:
            user.username = username
            user.password_hash = hash_password(password)
        user.is_admin = True
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"Development admin ready: {user.email} ({user.user_id})")
        return user


if __name__ == "__main__":
    seed_demo_admin()
