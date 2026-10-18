import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_PATH = os.environ.get("SMARTSEAT_DB", os.path.join(BASE_DIR, "smartseat.sqlite"))
    C_ENGINE_PATH = os.environ.get("C_ENGINE_PATH", os.path.join(BASE_DIR, "c_engine", "seat_engine"))
    SECRET_KEY = os.environ.get("SECRET_KEY", "smartseat-exam-secret-key-2026")
    PREFERRED_ENGINE = os.environ.get("PREFERRED_ENGINE", "c_engine")
