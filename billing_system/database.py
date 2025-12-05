from sqlmodel import SQLModel, create_engine
import os

sqlite_file_name = "billing.db"
sqlite_url = os.environ.get("DATABASE_URL", f"sqlite:///{sqlite_file_name}")

engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
