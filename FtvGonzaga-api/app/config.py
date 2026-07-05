import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:106220@localhost/ftvgonzaga"
    )
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "auth_plugin_map": {
                "caching_sha2_password": "mysql_native_password"
            }
        }
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SCHEDULER_API_ENABLED = True
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "FtvGonzaga-Super-Secret-Key-2026")
