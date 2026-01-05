from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, or_
from typing import Optional, List

from ..models import Property, Lead, get_db

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("")
def list_properties(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    city: Optional[str] = None,
    zip: Optional[str] = None,
    use_type: Optional[str] = None,
    lead_status: Optional[str] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    min_equity: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    absentee: Optional[str] = None,
    homestead: Optional[str] = None,
    sort: str = "created_date",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    """
    List properties with filters and pagination
    """
    # Base query with lead join
    query = db.query(
        Property,
        Lead.lead_status.label('lead_status'),
        Lead.id.label('lead_id')
    ).outerjoin(Lead, Property.folio_number == Lead.folio_number)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                # Owner info
                Property.name_line_1.ilike(search_term),
                Property.name_line_2.ilike(search_term),
                # Parcel / Folio number
                Property.folio_number.ilike(search_term),
                # Property address
                Property.situs_street_number.ilike(search_term),
                Property.situs_street_name.ilike(search_term),
                Property.situs_street_type.ilike(search_term),
                Property.situs_city.ilike(search_term),
                Property.situs_zip.ilike(search_term),
                # Mailing address
                Property.mailing_address_line_1.ilike(search_term),
                Property.mailing_address_line_2.ilike(search_term),
                Property.mailing_city.ilike(search_term),
                Property.mailing_state.ilike(search_term),
                Property.mailing_zip.ilike(search_term),
                # Property type
                Property.use_type.ilike(search_term),
                Property.use_code.ilike(search_term),
            )
        )
    
    if city:
        query = query.filter(Property.situs_city.ilike(f"%{city}%"))
    
    if zip:
        query = query.filter(Property.situs_zip.ilike(f"%{zip}%"))
    
    if use_type and use_type != 'all':
        query = query.filter(Property.use_type == use_type)
    
    if lead_status and lead_status != 'all':
        query = query.filter(Lead.lead_status == lead_status)
    
    if min_value:
        query = query.filter(Property.just_value >= min_value)
    
    if max_value:
        query = query.filter(Property.just_value <= max_value)
    
    if min_equity:
        query = query.filter(Property.potential_equity >= min_equity)
    
    if min_year:
        query = query.filter(Property.bldg_year_built >= min_year)
    
    if max_year:
        query = query.filter(Property.bldg_year_built <= max_year)
    
    if absentee == 'true':
        query = query.filter(Property.is_absentee_owner == True)
    elif absentee == 'false':
        query = query.filter(Property.is_absentee_owner == False)
    
    if homestead == 'true':
        query = query.filter(Property.homestead_flag == True)
    elif homestead == 'false':
        query = query.filter(Property.homestead_flag == False)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Property, sort, Property.created_date)
    if order == 'desc':
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()
    
    # Format response
    data = []
    for prop, lead_status, lead_id in results:
        prop_dict = prop.to_dict()
        prop_dict['lead_status'] = lead_status
        prop_dict['lead_id'] = lead_id
        data.append(prop_dict)
    
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get property statistics"""
    total = db.query(func.count(Property.id)).scalar()
    
    # Lead status counts
    lead_counts = db.query(
        Lead.lead_status,
        func.count(Lead.id)
    ).group_by(Lead.lead_status).all()
    
    lead_stats = {status: count for status, count in lead_counts}
    
    # High equity count
    high_equity = db.query(func.count(Property.id)).filter(
        Property.potential_equity >= 100000
    ).scalar()
    
    # Absentee count
    absentee = db.query(func.count(Property.id)).filter(
        Property.is_absentee_owner == True
    ).scalar()
    
    return {
        "total": total,
        "new_leads": lead_stats.get("New", 0),
        "skip_trace": lead_stats.get("Skip Trace", 0),
        "contacted": lead_stats.get("Contacted", 0),
        "offer_made": lead_stats.get("Offer Made", 0),
        "under_contract": lead_stats.get("Under Contract", 0),
        "sold": lead_stats.get("Sold", 0),
        "dead_lead": lead_stats.get("Dead Lead", 0),
        "high_equity": high_equity,
        "absentee": absentee
    }


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    """Get list of unique cities"""
    cities = db.query(Property.situs_city).distinct().filter(
        Property.situs_city.isnot(None)
    ).order_by(Property.situs_city).all()
    
    return [city[0] for city in cities if city[0]]


@router.get("/use-types")
def get_use_types(db: Session = Depends(get_db)):
    """Get list of unique use types"""
    types = db.query(Property.use_type).distinct().filter(
        Property.use_type.isnot(None)
    ).order_by(Property.use_type).all()
    
    return [t[0] for t in types if t[0]]


@router.get("/{folio_number}")
def get_property(folio_number: str, db: Session = Depends(get_db)):
    """Get a single property by folio number"""
    property = db.query(Property).filter(Property.folio_number == folio_number).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get associated lead if exists
    lead = db.query(Lead).filter(Lead.folio_number == folio_number).first()
    
    result = property.to_dict()
    result['lead'] = lead.to_dict() if lead else None
    
    return result

