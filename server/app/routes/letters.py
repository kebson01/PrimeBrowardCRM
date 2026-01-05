from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from pathlib import Path

from ..models import LetterTemplate, LetterHistory, get_db
from ..services import LetterService
from ..config import settings

router = APIRouter(prefix="/letters", tags=["letters"])


class TemplateCreate(BaseModel):
    name: str
    subject: Optional[str] = None
    body: str
    template_type: str = "mail"


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    template_type: Optional[str] = None


class GenerateLetterRequest(BaseModel):
    folio_number: str
    template_id: int
    output_format: str = "pdf"


class GenerateBulkRequest(BaseModel):
    folio_numbers: List[str]
    template_id: int
    output_format: str = "pdf"


@router.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    """Get all letter templates"""
    templates = LetterService.get_templates(db)
    return [t.to_dict() for t in templates]


@router.get("/templates/{template_id}")
def get_template(template_id: int, db: Session = Depends(get_db)):
    """Get a specific template"""
    template = LetterService.get_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template.to_dict()


@router.post("/templates")
def create_template(data: TemplateCreate, db: Session = Depends(get_db)):
    """Create a new template"""
    template = LetterService.create_template(db, data.model_dump())
    return template.to_dict()


@router.put("/templates/{template_id}")
def update_template(template_id: int, data: TemplateUpdate, db: Session = Depends(get_db)):
    """Update a template"""
    template = LetterService.update_template(db, template_id, data.model_dump(exclude_unset=True))
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template.to_dict()


@router.delete("/templates/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete a template"""
    template = db.query(LetterTemplate).filter(LetterTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return {"success": True, "message": "Template deleted"}


@router.post("/generate")
def generate_letter(request: GenerateLetterRequest, db: Session = Depends(get_db)):
    """Generate a letter for a single property"""
    try:
        result = LetterService.generate_letter(
            db,
            request.folio_number,
            request.template_id,
            request.output_format
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/generate-bulk")
def generate_bulk_letters(request: GenerateBulkRequest, db: Session = Depends(get_db)):
    """Generate letters for multiple properties"""
    result = LetterService.generate_bulk_letters(
        db,
        request.folio_numbers,
        request.template_id,
        request.output_format
    )
    return result


@router.get("/download/{filename}")
def download_letter(filename: str):
    """Download a generated letter"""
    file_path = settings.LETTERS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    media_type = "application/pdf" if filename.endswith('.pdf') else \
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )


@router.get("/history")
def get_letter_history(
    folio_number: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get letter generation history"""
    query = db.query(LetterHistory)
    
    if folio_number:
        query = query.filter(LetterHistory.folio_number == folio_number)
    
    history = query.order_by(LetterHistory.generated_date.desc()).limit(limit).all()
    
    return [h.to_dict() for h in history]



