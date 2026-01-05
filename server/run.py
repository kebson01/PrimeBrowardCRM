"""
PrimeBroward CRM - Python Backend
Run this script to start the API server
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("""
    ===========================================================
    |         PrimeBroward CRM - Python Backend               |
    |      Wholesale Real Estate CRM for Broward County       |
    ===========================================================
    """)
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level="info"
    )



