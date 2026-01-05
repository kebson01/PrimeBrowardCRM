from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Index
from sqlalchemy.sql import func
from .database import Base

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    folio_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Owner info
    name_line_1 = Column(String(255))
    name_line_2 = Column(String(255))
    
    # Mailing address
    mailing_address_line_1 = Column(String(255))
    mailing_address_line_2 = Column(String(255))
    mailing_city = Column(String(100))
    mailing_state = Column(String(10))
    mailing_zip = Column(String(20))
    mailing_zip4 = Column(String(10))
    
    # Situs (property) address
    situs_street_number = Column(String(50))
    situs_street_name = Column(String(255))
    situs_street_type = Column(String(50))
    situs_city = Column(String(100), index=True)
    situs_zip = Column(String(20))
    
    # Property details
    use_code = Column(String(20))
    use_type = Column(String(100), index=True)
    bldg_year_built = Column(Integer)
    bldg_tot_sq_footage = Column(Integer)
    beds = Column(Integer)
    baths = Column(Float)
    
    # Values
    just_land_value = Column(Float)
    just_building_value = Column(Float)
    just_value = Column(Float, index=True)
    
    # Exemptions
    homestead_flag = Column(Boolean, default=False)
    exemption_amount = Column(Float)
    owners_domicile = Column(String(10))
    
    # Sale history
    sale_date_1 = Column(String(20))
    deed_type_1 = Column(String(10))
    stamp_amount_1 = Column(Float)
    
    # Calculated fields
    estimated_purchase_price = Column(Float)
    calc_confidence = Column(String(20))
    potential_equity = Column(Float, index=True)
    is_absentee_owner = Column(Boolean, default=False, index=True)
    
    # Timestamps
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Composite indexes for common queries
    __table_args__ = (
        Index('idx_city_use_type', 'situs_city', 'use_type'),
        Index('idx_value_equity', 'just_value', 'potential_equity'),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "folio_number": self.folio_number,
            "name_line_1": self.name_line_1,
            "name_line_2": self.name_line_2,
            "mailing_address_line_1": self.mailing_address_line_1,
            "mailing_address_line_2": self.mailing_address_line_2,
            "mailing_city": self.mailing_city,
            "mailing_state": self.mailing_state,
            "mailing_zip": self.mailing_zip,
            "situs_street_number": self.situs_street_number,
            "situs_street_name": self.situs_street_name,
            "situs_street_type": self.situs_street_type,
            "situs_city": self.situs_city,
            "situs_zip": self.situs_zip,
            "use_code": self.use_code,
            "use_type": self.use_type,
            "bldg_year_built": self.bldg_year_built,
            "bldg_tot_sq_footage": self.bldg_tot_sq_footage,
            "beds": self.beds,
            "baths": self.baths,
            "just_land_value": self.just_land_value,
            "just_building_value": self.just_building_value,
            "just_value": self.just_value,
            "homestead_flag": self.homestead_flag,
            "exemption_amount": self.exemption_amount,
            "owners_domicile": self.owners_domicile,
            "sale_date_1": self.sale_date_1,
            "deed_type_1": self.deed_type_1,
            "stamp_amount_1": self.stamp_amount_1,
            "estimated_purchase_price": self.estimated_purchase_price,
            "calc_confidence": self.calc_confidence,
            "potential_equity": self.potential_equity,
            "is_absentee_owner": self.is_absentee_owner,
            "created_date": str(self.created_date) if self.created_date else None,
            "updated_date": str(self.updated_date) if self.updated_date else None,
        }



