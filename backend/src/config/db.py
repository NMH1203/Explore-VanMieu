from sqlalchemy import event
from sqlmodel import create_engine


database_url = "sqlite:///database/explore_van_mieu.db"

engine = create_engine(database_url)


@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(
    database_connection,
    connection_record,
):
    cursor = database_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()