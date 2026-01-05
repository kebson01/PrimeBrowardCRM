from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class LetterTemplate(Base):
    __tablename__ = "letter_templates"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(500))
    body = Column(Text)
    template_type = Column(String(50), default="mail")  # mail, email
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subject": self.subject,
            "body": self.body,
            "template_type": self.template_type,
            "created_date": str(self.created_date) if self.created_date else None,
        }



