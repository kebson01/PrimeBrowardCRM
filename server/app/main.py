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
        print(f"[*] Directories created: {settings.DATA_DIR}", flush=True)
        
        # Initialize database
        from .models import init_db
        init_db()
        print(f"[*] Database initialized: {settings.DATABASE_PATH}", flush=True)
        
        # Initialize templates
        from .models.database import SessionLocal
        from .services import LetterService
        db = SessionLocal()
        try:
            LetterService.init_default_templates(db)
            print("[*] Letter templates initialized", flush=True)
        except:
            pass
        finally:
            db.close()
        
        _initialized = True
        print("[*] Lazy initialization complete", flush=True)
    except Exception as e:
        print(f"[!] Lazy init error: {e}", flush=True)
        _initialized = True  # Don't retry on every request


# Track CSV import status
_csv_import_status = {"status": "not_started", "message": ""}


def import_csv_data():
    """Import CSV data from DigitalOcean Spaces - runs in background"""
    global _csv_import_status
    
    csv_url = os.getenv("CSV_URL", "")
    if not csv_url:
        _csv_import_status = {"status": "skipped", "message": "No CSV_URL configured"}
        return
    
    try:
        from .models.database import SessionLocal
        from .models.property import Property
        
        db = SessionLocal()
        try:
            property_count = db.query(Property).count()
            if property_count > 0:
                _csv_import_status = {"status": "skipped", "message": f"Database already has {property_count} properties"}
                print(f"[*] Database already has {property_count} properties. Skipping CSV import.", flush=True)
                return
            
            _csv_import_status = {"status": "downloading", "message": "Downloading CSV..."}
            print(f"[*] Downloading CSV from: {csv_url}", flush=True)
            
            import urllib.request
            import tempfile
            
            temp_csv = tempfile.NamedTemporaryFile(mode='w+b', suffix='.csv', delete=False)
            try:
                urllib.request.urlretrieve(csv_url, temp_csv.name)
                print(f"[*] CSV downloaded. Starting import...", flush=True)
                
                _csv_import_status = {"status": "importing", "message": "Importing CSV data..."}
                
                from .services.csv_service import CSVService
                result = CSVService.import_csv(db, temp_csv.name)
                
                msg = f"Imported {result.get('imported', 0)} new, updated {result.get('updated', 0)} existing"
                _csv_import_status = {"status": "complete", "message": msg}
                print(f"[*] CSV import complete! {msg}", flush=True)
            finally:
                try:
                    os.unlink(temp_csv.name)
                except:
                    pass
        finally:
            db.close()
    except Exception as e:
        _csv_import_status = {"status": "error", "message": str(e)}
        print(f"[!] CSV import error: {e}", flush=True)


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
    import threading
    
    # Do lazy init on health check (after server is accepting connections)
    lazy_init()
    
    # Auto-start CSV import in background if not started yet
    if _csv_import_status.get("status") == "not_started":
        thread = threading.Thread(target=import_csv_data)
        thread.daemon = True
        thread.start()
    
    return {"status": "healthy", "initialized": _initialized, "csv_import": _csv_import_status.get("status")}


@app.post("/api/import-csv")
def trigger_csv_import():
    """Manually trigger CSV import from DigitalOcean Spaces"""
    import threading
    
    lazy_init()  # Make sure DB is ready
    
    if _csv_import_status.get("status") in ["downloading", "importing"]:
        return {"message": "Import already in progress", "status": _csv_import_status}
    
    # Run import in background thread
    thread = threading.Thread(target=import_csv_data)
    thread.start()
    
    return {"message": "CSV import started in background", "status": _csv_import_status}


@app.get("/api/import-status")
def get_import_status():
    """Check CSV import status"""
    from .models.database import SessionLocal
    from .models.property import Property
    
    lazy_init()
    
    db = SessionLocal()
    try:
        property_count = db.query(Property).count()
    except:
        property_count = 0
    finally:
        db.close()
    
    return {
        "import_status": _csv_import_status,
        "property_count": property_count
    }


# For running directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server.app.main:app",
        host="0.0.0.0",
        port=8000,
        workers=1
    )
