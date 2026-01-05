from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid

from ..models import get_db
from ..services import CSVService
from ..config import settings

router = APIRouter(prefix="/import-export", tags=["import-export"])

# Store import progress
import_progress = {}


@router.post("/import")
async def import_csv(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Import a CSV file into the database
    
    Supports large files by processing in chunks
    """
    # Validate file type
    if not file.filename.endswith(('.csv', '.CSV')):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported"
        )
    
    # Save uploaded file temporarily
    temp_path = settings.DATA_DIR / f"temp_{uuid.uuid4().hex}.csv"
    
    try:
        with open(temp_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Import the CSV
        result = CSVService.import_csv(db, temp_path)
        
        return {
            "success": True,
            "message": f"Import completed successfully",
            "total_rows": result['total_rows'],
            "imported": result['imported'],
            "updated": result['updated'],
            "error_count": result['error_count'],
            "errors": result['errors'][:10] if result['errors'] else []
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        # Clean up temp file
        if temp_path.exists():
            temp_path.unlink()


@router.post("/import-from-path")
def import_csv_from_path(file_path: str, db: Session = Depends(get_db)):
    """
    Import a CSV file from a local path
    
    This is useful for importing large files without uploading
    """
    path = Path(file_path)
    
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    
    if not path.suffix.lower() == '.csv':
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        result = CSVService.import_csv(db, path)
        
        return {
            "success": True,
            "message": f"Import completed successfully",
            "total_rows": result['total_rows'],
            "imported": result['imported'],
            "updated": result['updated'],
            "error_count": result['error_count']
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.get("/export")
def export_csv(
    city: str = None,
    use_type: str = None,
    min_value: float = None,
    absentee: bool = None,
    db: Session = Depends(get_db)
):
    """Export properties to CSV file"""
    filters = {}
    if city:
        filters['city'] = city
    if use_type:
        filters['use_type'] = use_type
    if min_value:
        filters['min_value'] = min_value
    if absentee is not None:
        filters['absentee'] = absentee
    
    try:
        file_path = CSVService.export_csv(db, filters)
        
        return FileResponse(
            path=file_path,
            filename=file_path.name,
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/sample-headers")
def get_sample_headers():
    """Get expected CSV column headers"""
    return {
        "required": ["folio_number (or parcel_id)"],
        "owner_info": ["name_line_1", "name_line_2"],
        "mailing_address": [
            "mailing_address_line_1",
            "mailing_city",
            "mailing_state",
            "mailing_zip"
        ],
        "situs_address": [
            "situs_street_number",
            "situs_street_name",
            "situs_street_type",
            "situs_city",
            "situs_zip"
        ],
        "property_details": [
            "use_code",
            "use_type",
            "bldg_year_built",
            "bldg_tot_sq_footage",
            "beds",
            "baths"
        ],
        "values": [
            "just_land_value",
            "just_building_value",
            "just_value"
        ],
        "exemptions": [
            "homestead_flag",
            "exemption_amount",
            "owners_domicile"
        ],
        "sale_history": [
            "sale_date_1",
            "deed_type_1",
            "stamp_amount_1"
        ],
        "notes": "Column names are flexible - the system will attempt to match common variations"
    }



