from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class LetterHistory(Base):
    __tablename__ = "letter_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    folio_number = Column(String(50), ForeignKey("properties.folio_number"), nullable=False)
    template_id = Column(Integer, ForeignKey("letter_templates.id"))
    generated_date = Column(DateTime, server_default=func.now())
    file_path = Column(String(500))
    
    def to_dict(self):
        return {
            "id": self.id,
            "folio_number": self.folio_number,
            "template_id": self.template_id,
            "generated_date": str(self.generated_date) if self.generated_date else None,
            "file_path": self.file_path,
        }



