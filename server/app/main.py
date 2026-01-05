from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .config import settings
from .routes import properties_router, leads_router, letters_router, import_export_router


# Flag to track if initialization is complete
_initialized = False


def lazy_init():
    """Lazy initialization - called on first real request, not during startup"""
    global _initialized
    if _initialized:
        return
    
    try:
        # Create directories
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        os.makedirs(settings.TEMPLATES_DIR, exist_ok=True)
        os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
        os.makedirs(settings.LETTERS_DIR, exist_ok=True)
        
        # Initialize database
        from .models import init_db
        init_db()
        
        # Initialize templates
        from .models.database import SessionLocal
        from .services import LetterService
        db = SessionLocal()
        try:
            LetterService.init_default_templates(db)
        except:
            pass
        finally:
            db.close()
        
        _initialized = True
        print("[*] Lazy initialization complete", flush=True)
    except Exception as e:
        print(f"[!] Lazy init error: {e}", flush=True)
        _initialized = True  # Don't retry on every request


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Minimal lifespan - just log startup"""
    print("[*] PrimeBroward CRM API starting...", flush=True)
    print(f"[*] Port: {settings.API_PORT}", flush=True)
    print("[*] Server ready to accept connections", flush=True)
    yield
    print("[*] Shutting down...", flush=True)


# Create FastAPI app with minimal startup
app = FastAPI(
    title="PrimeBroward CRM API",
    description="Wholesale Real Estate CRM for Broward County",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(properties_router)
app.include_router(leads_router)
app.include_router(letters_router)
app.include_router(import_export_router)


# ============= HEALTH CHECK ENDPOINTS (NO DEPENDENCIES) =============

@app.get("/")
def root():
    """Root endpoint - immediate response"""
    return {"status": "running", "name": "PrimeBroward CRM API"}


@app.get("/ping")
def ping():
    """Simple ping - immediate response, no dependencies"""
    return {"status": "ok"}


@app.get("/api/ping")
def api_ping():
    """Simple ping for /api route"""
    return {"status": "ok"}


@app.get("/health")
def health():
    """Health check - immediate response"""
    return {"status": "healthy"}


@app.get("/api/health")
def api_health():
    """Health check for /api route"""
    # Do lazy init on health check (after server is accepting connections)
    lazy_init()
    return {"status": "healthy", "initialized": _initialized}


# For running directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server.app.main:app",
        host="0.0.0.0",
        port=8000,
        workers=1
    )
