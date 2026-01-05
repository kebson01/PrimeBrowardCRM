from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional
from pydantic import BaseModel

from ..models import Lead, Property, get_db

router = APIRouter(prefix="/leads", tags=["leads"])


class LeadCreate(BaseModel):
    folio_number: str
    property_address: Optional[str] = None
    owner_name: Optional[str] = None
    lead_status: str = "New"
    assigned_to: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    offer_amount: Optional[float] = None
    contract_price: Optional[float] = None
    assignment_fee: Optional[float] = None
    updated_by_name: Optional[str] = None


class LeadUpdate(BaseModel):
    lead_status: Optional[str] = None
    assigned_to: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    offer_amount: Optional[float] = None
    contract_price: Optional[float] = None
    assignment_fee: Optional[float] = None
    updated_by_name: Optional[str] = None


@router.get("")
def list_leads(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    sort: str = "updated_date",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    """List leads with filters and pagination"""
    query = db.query(Lead)
    
    if status and status != 'all':
        query = query.filter(Lead.lead_status == status)
    
    if assigned_to:
        query = query.filter(Lead.assigned_to == assigned_to)
    
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Lead, sort, Lead.updated_date)
    if order == 'desc':
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * limit
    leads = query.offset(offset).limit(limit).all()
    
    return {
        "data": [lead.to_dict() for lead in leads],
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{lead_id}")
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Get a single lead by ID"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return lead.to_dict()


@router.get("/folio/{folio_number}")
def get_lead_by_folio(folio_number: str, db: Session = Depends(get_db)):
    """Get lead by property folio number"""
    lead = db.query(Lead).filter(Lead.folio_number == folio_number).first()
    
    if not lead:
        return None
    
    return lead.to_dict()


@router.post("")
def create_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    """Create a new lead"""
    # Check if property exists
    property = db.query(Property).filter(
        Property.folio_number == lead_data.folio_number
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if lead already exists
    existing = db.query(Lead).filter(
        Lead.folio_number == lead_data.folio_number
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Lead already exists for this property")
    
    # Auto-fill property info if not provided
    if not lead_data.property_address:
        lead_data.property_address = ' '.join(filter(None, [
            property.situs_street_number,
            property.situs_street_name,
            property.situs_street_type
        ]))
    
    if not lead_data.owner_name:
        lead_data.owner_name = property.name_line_1
    
    lead = Lead(**lead_data.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    return lead.to_dict()


@router.put("/{lead_id}")
def update_lead(lead_id: int, lead_data: LeadUpdate, db: Session = Depends(get_db)):
    """Update an existing lead"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)
    
    db.commit()
    db.refresh(lead)
    
    return lead.to_dict()


@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """Delete a lead"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    
    return {"success": True, "message": "Lead deleted"}



