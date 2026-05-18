from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

    API_VERSION: str = "v1"
    DATABASE_URL: str = "sqlite:///./crm.db"


settings = Settings()
