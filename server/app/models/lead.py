from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    folio_number = Column(String(50), ForeignKey("properties.folio_number"), nullable=False, index=True)
    
    property_address = Column(String(500))
    owner_name = Column(String(255))
    
    lead_status = Column(String(50), default="New", index=True)
    assigned_to = Column(String(255))
    follow_up_date = Column(String(20), index=True)
    notes = Column(Text)
    
    offer_amount = Column(Float)
    contract_price = Column(Float)
    assignment_fee = Column(Float)
    
    updated_by_name = Column(String(255))
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "folio_number": self.folio_number,
            "property_address": self.property_address,
            "owner_name": self.owner_name,
            "lead_status": self.lead_status,
            "assigned_to": self.assigned_to,
            "follow_up_date": self.follow_up_date,
            "notes": self.notes,
            "offer_amount": self.offer_amount,
            "contract_price": self.contract_price,
            "assignment_fee": self.assignment_fee,
            "updated_by_name": self.updated_by_name,
            "created_date": str(self.created_date) if self.created_date else None,
            "updated_date": str(self.updated_date) if self.updated_date else None,
        }



