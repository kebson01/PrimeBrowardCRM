from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from .config import settings
from .models import init_db, get_db, Base, engine
from .services import LetterService
from .routes import properties_router, leads_router, letters_router, import_export_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("[*] Starting PrimeBroward CRM API...")
    
    try:
        # Ensure data directories exist
        import os
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        os.makedirs(settings.TEMPLATES_DIR, exist_ok=True)
        os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
        os.makedirs(settings.LETTERS_DIR, exist_ok=True)
        print(f"[*] Data directories created: {settings.DATA_DIR}")
        
        # Initialize database
        init_db()
        print(f"[*] Database initialized: {settings.DATABASE_PATH}")
        
        # Auto-import CSV from DigitalOcean Spaces on first startup
        csv_url = os.getenv("CSV_URL", "")
        if csv_url:
            from .models.database import SessionLocal
            from .models.property import Property
            
            # Check if database is empty
            db = SessionLocal()
            try:
                property_count = db.query(Property).count()
                if property_count == 0:
                    print(f"[*] Database is empty. Downloading and importing CSV from: {csv_url}")
                    print(f"[*] This will take 10-15 minutes on first startup...")
                    
                    import urllib.request
                    import tempfile
                    
                    # Download CSV to temp file
                    temp_csv = tempfile.NamedTemporaryFile(mode='w+b', suffix='.csv', delete=False)
                    try:
                        print(f"[*] Downloading CSV (this may take a few minutes)...")
                        urllib.request.urlretrieve(csv_url, temp_csv.name)
                        print(f"[*] CSV downloaded. Starting import...")
                        
                        # Import the CSV
                        from .services.csv_service import CSVService
                        result = CSVService.import_csv(db, temp_csv.name)
                        
                        print(f"[*] CSV import complete! Imported {result.get('imported', 0)} new records, updated {result.get('updated', 0)} existing records")
                    except Exception as e:
                        print(f"[!] Failed to download/import CSV: {e}")
                        import traceback
                        traceback.print_exc()
                    finally:
                        # Clean up temp file
                        try:
                            os.unlink(temp_csv.name)
                        except:
                            pass
                else:
                    print(f"[*] Database already has {property_count} properties. Skipping CSV import.")
            finally:
                db.close()
        
        # Initialize default letter templates
        from .models.database import SessionLocal
        db = SessionLocal()
        try:
            LetterService.init_default_templates(db)
            print("[*] Letter templates initialized")
        except Exception as e:
            print(f"[!] Warning: Could not initialize templates: {e}")
        finally:
            db.close()
        
        print(f"[OK] API ready at http://{settings.API_HOST}:{settings.API_PORT}")
        print(f"[*] API docs at http://{settings.API_HOST}:{settings.API_PORT}/docs")
    except Exception as e:
        print(f"[!] Error during startup: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    yield
    
    # Shutdown
    print("[*] Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="PrimeBroward CRM API",
    description="Wholesale Real Estate CRM for Broward County",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
# In production, use specific origins. For now, allow all for easier deployment
cors_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"]
if "*" not in cors_origins:
    cors_origins = cors_origins + ["*"]  # Allow all for initial deployment

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers WITHOUT prefix (DigitalOcean strips /api when routing)
app.include_router(properties_router)
app.include_router(leads_router)
app.include_router(letters_router)
app.include_router(import_export_router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "name": "PrimeBroward CRM API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/api/health")
def api_health_check():
    """Health check endpoint for DigitalOcean (direct service access)"""
    from .models.database import SessionLocal
    from sqlalchemy import text
    
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "data_dir": str(settings.DATA_DIR)
    }


@app.get("/health")
def health_check():
    """Health check endpoint for direct access"""
    from .models.database import SessionLocal
    from sqlalchemy import text
    
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "data_dir": str(settings.DATA_DIR)
    }


# For running directly with: python -m app.main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
