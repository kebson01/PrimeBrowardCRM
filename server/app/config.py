import os
import json
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Paths - will be set from env vars or defaults
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Optional[Path] = None
    DATABASE_PATH: Optional[Path] = None
    TEMPLATES_DIR: Optional[Path] = None
    EXPORTS_DIR: Optional[Path] = None
    LETTERS_DIR: Optional[Path] = None
    
    # API settings
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    
    # CORS - will be parsed in __init__
    CORS_ORIGINS: List[str] = []
    
    class Config:
        env_file = ".env"
        arbitrary_types_allowed = True
    
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
        if self.DATA_DIR is None:
            data_dir_str = os.getenv("DATA_DIR", str(self.BASE_DIR.parent / "data"))
            self.DATA_DIR = Path(data_dir_str)
        
        if self.DATABASE_PATH is None:
            db_path_str = os.getenv("DATABASE_PATH", str(self.DATA_DIR / "primebroward.db"))
            self.DATABASE_PATH = Path(db_path_str)
        
        if self.TEMPLATES_DIR is None:
            self.TEMPLATES_DIR = self.DATA_DIR / "templates"
        
        if self.EXPORTS_DIR is None:
            self.EXPORTS_DIR = self.DATA_DIR / "exports"
        
        if self.LETTERS_DIR is None:
            self.LETTERS_DIR = self.DATA_DIR / "letters"

settings = Settings()

# Create directories if they don't exist
for dir_path in [settings.DATA_DIR, settings.TEMPLATES_DIR, settings.EXPORTS_DIR, settings.LETTERS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)
