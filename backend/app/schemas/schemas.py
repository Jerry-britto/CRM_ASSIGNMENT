from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models import TicketStatus


class TicketCreate(BaseModel):
    customer_name: str = Field(..., max_length=255, description="Name of the customer reporting the issue")
    customer_email: EmailStr = Field(..., description="Email address of the customer")
    subject: str = Field(..., max_length=255, description="Brief summary of the issue")
    description: str = Field(..., max_length=2000, description="Detailed explanation of the issue")


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: TicketStatus
    created_at: datetime

    class Config:
        from_attributes = True


class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: TicketStatus
    notes: Optional[str] = None  # Text of the single associated note

    class Config:
        from_attributes = True


class TicketUpdateRequest(BaseModel):
    status: TicketStatus
    notes: Optional[str] = Field(None, max_length=2000, description="Text for the single ticket note")


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime
