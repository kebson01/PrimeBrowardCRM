import pandas as pd
import numpy as np
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Generator, Optional, Callable
import re

from ..models import Property
from ..config import settings


class CSVService:
    """Service for importing and exporting CSV data"""
    
    # Column name mapping - maps various CSV column names to our database columns
    COLUMN_MAPPING = {
        # Folio number variations
        'folio_number': 'folio_number',
        'folionumber': 'folio_number',
        'folio': 'folio_number',
        'parcel_id': 'folio_number',
        'parcelid': 'folio_number',
        'parcel': 'folio_number',
        
        # Owner name
        'name_line_1': 'name_line_1',
        'owner_name': 'name_line_1',
        'owner': 'name_line_1',
        'name_line_2': 'name_line_2',
        'owner_name_2': 'name_line_2',
        
        # Mailing address
        'address_line_1': 'mailing_address_line_1',
        'mailing_address_line_1': 'mailing_address_line_1',
        'mailing_address': 'mailing_address_line_1',
        'address_line_2': 'mailing_address_line_2',
        'mailing_address_line_2': 'mailing_address_line_2',
        'city': 'mailing_city',
        'mailing_city': 'mailing_city',
        'state': 'mailing_state',
        'mailing_state': 'mailing_state',
        'zip': 'mailing_zip',
        'mailing_zip': 'mailing_zip',
        'zip4': 'mailing_zip4',
        'mailing_zip4': 'mailing_zip4',
        
        # Situs address
        'situs_street_number': 'situs_street_number',
        'situs_street_name': 'situs_street_name',
        'situs_street_type': 'situs_street_type',
        'situs_city': 'situs_city',
        'situs_zip_code': 'situs_zip',
        'situs_zip': 'situs_zip',
        
        # Property details
        'use_code': 'use_code',
        'use_type': 'use_type',
        'property_type': 'use_type',
        'bldg_year_built': 'bldg_year_built',
        'year_built': 'bldg_year_built',
        'bldg_tot_sq_footage': 'bldg_tot_sq_footage',
        'sq_footage': 'bldg_tot_sq_footage',
        'square_footage': 'bldg_tot_sq_footage',
        'beds': 'beds',
        'bedrooms': 'beds',
        'baths': 'baths',
        'bathrooms': 'baths',
        
        # Values
        'just_land_value': 'just_land_value',
        'land_value': 'just_land_value',
        'just_building_value': 'just_building_value',
        'building_value': 'just_building_value',
        'just_value': 'just_value',
        'assessed_value': 'just_value',
        'total_value': 'just_value',
        
        # Exemptions
        'homestead_flag': 'homestead_flag',
        'homestead': 'homestead_flag',
        'exemption_amount': 'exemption_amount',
        'owners_domicile': 'owners_domicile',
        'domicile': 'owners_domicile',
        
        # Sale history
        'sale_date_1': 'sale_date_1',
        'last_sale_date': 'sale_date_1',
        'deed_type_1': 'deed_type_1',
        'deed_type': 'deed_type_1',
        'stamp_amount_1': 'stamp_amount_1',
        'doc_stamps': 'stamp_amount_1',
        'documentary_stamps': 'stamp_amount_1',
    }
    
    @staticmethod
    def normalize_column_name(col: str) -> str:
        """Normalize column name to match database fields"""
        # Remove BOM, quotes, extra spaces
        col = col.strip().strip('\ufeff').strip('"').strip("'")
        # Convert to lowercase
        col = col.lower()
        # Replace spaces and special chars with underscore
        col = re.sub(r'[^a-z0-9]+', '_', col)
        # Remove leading/trailing underscores
        col = col.strip('_')
        return col
    
    @staticmethod
    def calculate_doc_stamp_values(stamp_amount: float, deed_type: str) -> tuple:
        """Calculate estimated purchase price from documentary stamps"""
        if not stamp_amount or stamp_amount <= 0:
            return None, 'None'
        
        deed_type = (deed_type or '').upper()
        
        # Florida doc stamp rate: $0.70 per $100 = 0.007
        estimated_price = round(stamp_amount / 0.007)
        
        if deed_type in ['WD', 'SWD']:  # Warranty Deed
            confidence = 'High' if deed_type == 'WD' else 'Medium'
        else:
            confidence = 'Low'
        
        return estimated_price, confidence
    
    @staticmethod
    def is_absentee_owner(row: pd.Series) -> bool:
        """Determine if owner is absentee"""
        # Check domicile state
        domicile = str(row.get('owners_domicile', '')).upper()
        if domicile and domicile != 'FL':
            return True
        
        # Compare situs to mailing address
        situs = f"{row.get('situs_street_number', '')} {row.get('situs_street_name', '')}".lower().strip()
        mailing = f"{row.get('mailing_address_line_1', '')}".lower().strip()
        
        if situs and mailing and situs not in mailing and mailing not in situs:
            return True
        
        return False
    
    @classmethod
    def import_csv(
        cls,
        db: Session,
        file_path: Path,
        chunk_size: int = 5000,
        progress_callback: Optional[Callable] = None
    ) -> dict:
        """
        Import CSV file into database using chunked processing
        
        Args:
            db: Database session
            file_path: Path to CSV file
            chunk_size: Number of rows to process at once
            progress_callback: Optional callback for progress updates
            
        Returns:
            dict with import statistics
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"CSV file not found: {file_path}")
        
        # Get total row count for progress
        total_rows = sum(1 for _ in open(file_path, 'r', encoding='utf-8', errors='ignore')) - 1
        
        imported = 0
        updated = 0
        errors = []
        
        # Read CSV in chunks
        for chunk_num, chunk in enumerate(pd.read_csv(
            file_path,
            chunksize=chunk_size,
            dtype=str,  # Read all as string initially
            na_values=['', 'NA', 'N/A', 'null', 'NULL'],
            keep_default_na=True,
            encoding='utf-8',
            encoding_errors='ignore'
        )):
            # Normalize column names
            chunk.columns = [cls.normalize_column_name(c) for c in chunk.columns]
            
            # Map columns to database fields
            column_renames = {}
            for col in chunk.columns:
                if col in cls.COLUMN_MAPPING:
                    column_renames[col] = cls.COLUMN_MAPPING[col]
            
            chunk = chunk.rename(columns=column_renames)
            
            # Check for folio_number column
            if 'folio_number' not in chunk.columns:
                raise ValueError("CSV must contain a folio_number (or parcel_id) column")
            
            # Process each row
            for idx, row in chunk.iterrows():
                try:
                    folio = str(row.get('folio_number', '')).strip()
                    if not folio or folio == 'nan':
                        continue
                    
                    # Calculate derived fields
                    stamp_amount = pd.to_numeric(row.get('stamp_amount_1'), errors='coerce')
                    deed_type = str(row.get('deed_type_1', ''))
                    est_price, confidence = cls.calculate_doc_stamp_values(stamp_amount, deed_type)
                    
                    just_value = pd.to_numeric(row.get('just_value'), errors='coerce')
                    potential_equity = (just_value - est_price) if est_price and just_value else None
                    
                    # Build property data
                    property_data = {
                        'folio_number': folio,
                        'name_line_1': cls._clean_string(row.get('name_line_1')),
                        'name_line_2': cls._clean_string(row.get('name_line_2')),
                        'mailing_address_line_1': cls._clean_string(row.get('mailing_address_line_1')),
                        'mailing_address_line_2': cls._clean_string(row.get('mailing_address_line_2')),
                        'mailing_city': cls._clean_string(row.get('mailing_city')),
                        'mailing_state': cls._clean_string(row.get('mailing_state')),
                        'mailing_zip': cls._clean_string(row.get('mailing_zip')),
                        'situs_street_number': cls._clean_string(row.get('situs_street_number')),
                        'situs_street_name': cls._clean_string(row.get('situs_street_name')),
                        'situs_street_type': cls._clean_string(row.get('situs_street_type')),
                        'situs_city': cls._clean_string(row.get('situs_city')),
                        'situs_zip': cls._clean_string(row.get('situs_zip')),
                        'use_code': cls._clean_string(row.get('use_code')),
                        'use_type': cls._clean_string(row.get('use_type')),
                        'bldg_year_built': cls._to_int(row.get('bldg_year_built')),
                        'bldg_tot_sq_footage': cls._to_int(row.get('bldg_tot_sq_footage')),
                        'beds': cls._to_int(row.get('beds')),
                        'baths': cls._to_float(row.get('baths')),
                        'just_land_value': cls._to_float(row.get('just_land_value')),
                        'just_building_value': cls._to_float(row.get('just_building_value')),
                        'just_value': just_value if pd.notna(just_value) else None,
                        'homestead_flag': cls._to_bool(row.get('homestead_flag')),
                        'exemption_amount': cls._to_float(row.get('exemption_amount')),
                        'owners_domicile': cls._clean_string(row.get('owners_domicile')),
                        'sale_date_1': cls._clean_string(row.get('sale_date_1')),
                        'deed_type_1': cls._clean_string(row.get('deed_type_1')),
                        'stamp_amount_1': stamp_amount if pd.notna(stamp_amount) else None,
                        'estimated_purchase_price': est_price,
                        'calc_confidence': confidence,
                        'potential_equity': potential_equity,
                        'is_absentee_owner': cls.is_absentee_owner(row),
                    }
                    
                    # Upsert: update if exists, insert if not
                    existing = db.query(Property).filter(Property.folio_number == folio).first()
                    
                    if existing:
                        for key, value in property_data.items():
                            if key != 'folio_number':
                                setattr(existing, key, value)
                        updated += 1
                    else:
                        db.add(Property(**property_data))
                        imported += 1
                    
                except Exception as e:
                    errors.append({
                        'row': idx,
                        'folio': row.get('folio_number'),
                        'error': str(e)
                    })
            
            # Commit each chunk
            db.commit()
            
            # Report progress
            processed = (chunk_num + 1) * chunk_size
            if progress_callback:
                progress_callback({
                    'processed': min(processed, total_rows),
                    'total': total_rows,
                    'percent': min(100, round((processed / total_rows) * 100)),
                    'imported': imported,
                    'updated': updated
                })
        
        return {
            'total_rows': total_rows,
            'imported': imported,
            'updated': updated,
            'errors': errors[:100],  # Limit error list
            'error_count': len(errors)
        }
    
    @staticmethod
    def _clean_string(value) -> Optional[str]:
        """Clean and validate string value"""
        if pd.isna(value):
            return None
        value = str(value).strip()
        return value if value and value.lower() != 'nan' else None
    
    @staticmethod
    def _to_int(value) -> Optional[int]:
        """Convert to integer"""
        try:
            if pd.isna(value):
                return None
            return int(float(str(value).replace(',', '')))
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def _to_float(value) -> Optional[float]:
        """Convert to float"""
        try:
            if pd.isna(value):
                return None
            return float(str(value).replace(',', '').replace('$', ''))
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def _to_bool(value) -> bool:
        """Convert to boolean"""
        if pd.isna(value):
            return False
        return str(value).lower() in ['yes', 'true', '1', 'y']
    
    @classmethod
    def export_csv(cls, db: Session, filters: dict = None) -> Path:
        """Export properties to CSV file"""
        from datetime import datetime
        
        query = db.query(Property)
        
        # Apply filters if provided
        if filters:
            if filters.get('city'):
                query = query.filter(Property.situs_city == filters['city'])
            if filters.get('use_type'):
                query = query.filter(Property.use_type == filters['use_type'])
            if filters.get('min_value'):
                query = query.filter(Property.just_value >= filters['min_value'])
            if filters.get('absentee'):
                query = query.filter(Property.is_absentee_owner == True)
        
        # Convert to DataFrame
        properties = query.all()
        data = [p.to_dict() for p in properties]
        df = pd.DataFrame(data)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"bcpa_export_{timestamp}.csv"
        filepath = settings.EXPORTS_DIR / filename
        
        df.to_csv(filepath, index=False)
        
        return filepath



