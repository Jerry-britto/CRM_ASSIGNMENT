from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TicketStatus
from app.schemas import (
    TicketCreate,
    TicketCreateResponse,
    TicketListResponse,
    TicketDetailResponse,
    TicketUpdateRequest,
    TicketUpdateResponse,
)
from app.services import ticket_service

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("/", response_model=TicketCreateResponse, status_code=status.HTTP_201_CREATED)
def create_new_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    """
    Creates a new customer ticket. Automatically generates a unique, sequential ticket ID (e.g. TKT-001).
    """
    ticket = ticket_service.create_ticket(db, ticket_data=ticket_in)
    return {
        "ticket_id": ticket.ticket_id,
        "created_at": ticket.created_at
    }


@router.get("/", response_model=List[TicketListResponse])
def list_and_filter_tickets(
    status: Optional[TicketStatus] = Query(None, description="Filter tickets by their current status"),
    search: Optional[str] = Query(None, description="Search for tickets by customer name"),
    db: Session = Depends(get_db)
):
    """
    Retrieves all tickets. Supports optional query filters to search by customer name or filter by status.
    """
    tickets = ticket_service.get_tickets(db, status=status, search=search)
    return tickets


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket_details(ticket_id: str, db: Session = Depends(get_db)):
    """
    Fetches the complete details of a specific ticket by its string 'ticket_id' (e.g. 'TKT-001').
    Includes the content of the single associated note if present.
    """
    ticket = ticket_service.get_ticket_by_id(db, ticket_id=ticket_id)
    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "notes": ticket.note.note_text if ticket.note else None
    }


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket_status_and_notes(
    ticket_id: str,
    update_in: TicketUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the status of a ticket and manages its single associated note text (create or update).
    """
    updated_ticket = ticket_service.update_ticket(db, ticket_id=ticket_id, update_data=update_in)
    return {
        "success": True,
        "updated_at": updated_ticket.updated_at
    }


@router.delete("/{ticket_id}", status_code=status.HTTP_200_OK)
def delete_ticket_and_note(ticket_id: str, db: Session = Depends(get_db)):
    """
    Deletes a ticket along with its associated note from the system.
    """
    ticket_service.delete_ticket(db, ticket_id=ticket_id)
    return {
        "success": True,
        "message": f"Ticket {ticket_id} and its associated note have been successfully deleted."
    }
