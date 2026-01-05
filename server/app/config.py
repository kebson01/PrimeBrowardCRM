import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR.parent / "data"
    DATABASE_PATH: Path = DATA_DIR / "primebroward.db"
    TEMPLATES_DIR: Path = DATA_DIR / "templates"
    EXPORTS_DIR: Path = DATA_DIR / "exports"
    LETTERS_DIR: Path = DATA_DIR / "letters"
    
    # API settings
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    
    # CORS - allow React dev server
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create directories if they don't exist
for dir_path in [settings.DATA_DIR, settings.TEMPLATES_DIR, settings.EXPORTS_DIR, settings.LETTERS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)



