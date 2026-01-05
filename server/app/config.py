import os
import json
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Paths - can be overridden via environment variables
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    
    # API settings
    API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS - will be set in __init__
    CORS_ORIGINS: list = None
    
    class Config:
        env_file = ".env"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Parse CORS_ORIGINS - support both JSON array and comma-separated string
        cors_env = os.getenv("CORS_ORIGINS", '["http://localhost:5173","http://127.0.0.1:5173"]')
        
        try:
            # Try parsing as JSON array first (required by DigitalOcean)
            self.CORS_ORIGINS = json.loads(cors_env)
        except json.JSONDecodeError:
            # Fall back to comma-separated string for local development
            self.CORS_ORIGINS = [
                origin.strip() 
                for origin in cors_env.split(",")
                if origin.strip()
            ]
        
        # Set data directory paths (can be overridden via env vars)
        data_dir_str = os.getenv("DATA_DIR", str(self.BASE_DIR.parent / "data"))
        self.DATA_DIR = Path(data_dir_str)
        
        db_path_str = os.getenv("DATABASE_PATH", str(self.DATA_DIR / "primebroward.db"))
        self.DATABASE_PATH = Path(db_path_str)
        
        self.TEMPLATES_DIR = self.DATA_DIR / "templates"
        self.EXPORTS_DIR = self.DATA_DIR / "exports"
        self.LETTERS_DIR = self.DATA_DIR / "letters"

settings = Settings()

# Create directories if they don't exist
for dir_path in [settings.DATA_DIR, settings.TEMPLATES_DIR, settings.EXPORTS_DIR, settings.LETTERS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)
