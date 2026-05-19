import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import Ticket, Note, TicketStatus
from app.schemas import TicketCreate, TicketUpdateRequest
from app.utils.logger import logger
from app.utils.exceptions import TicketNotFoundException, DatabaseException, AppException

def generate_next_ticket_id(db: Session) -> str:
    """
    Sequentially generates the next ticket ID in the format TKT-001, TKT-002, etc.
    """
    try:
        # Get the ticket with the highest database primary key ID
        last_ticket = db.query(Ticket).order_by(desc(Ticket.id)).first()
        if not last_ticket:
            return "TKT-001"

        # Parse the ticket_id (e.g., TKT-042) to find the integer value
        match = re.match(r"TKT-(\d+)", last_ticket.ticket_id)
        if not match:
            # Fallback if the last ticket ID didn't follow the pattern
            return "TKT-001"

        next_num = int(match.group(1)) + 1
        return f"TKT-{next_num:03d}"
    except Exception as e:
        db.rollback()
        logger.error(f"Error generating sequential ticket ID: {str(e)}")
        raise DatabaseException(e)


def create_ticket(db: Session, ticket_data: TicketCreate) -> Ticket:
    """
    Creates a new Ticket in the database.
    """
    logger.info(f"Received request to create ticket for: {ticket_data.customer_email}")
    try:
        next_id = generate_next_ticket_id(db)
        
        db_ticket = Ticket(
            ticket_id=next_id,
            customer_name=ticket_data.customer_name,
            customer_email=ticket_data.customer_email,
            subject=ticket_data.subject,
            description=ticket_data.description,
            status=TicketStatus.OPEN
        )
        
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        logger.info(f"Successfully created ticket {db_ticket.ticket_id} (ID: {db_ticket.id})")
        return db_ticket
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create ticket: {str(e)}")
        raise DatabaseException(e)


def get_tickets(db: Session, status: Optional[TicketStatus] = None, search: Optional[str] = None) -> List[Ticket]:
    """
    Retrieves a list of tickets, applying optional status and search (customer_name) filters.
    """
    logger.info(f"Retrieving tickets list (Filter - Status: {status}, Search: {search})")
    try:
        query = db.query(Ticket)
        
        if status:
            query = query.filter(Ticket.status == status)
            
        if search:
            # Case-insensitive SQL LIKE search against customer name
            query = query.filter(Ticket.customer_name.ilike(f"%{search}%"))
            
        tickets = query.order_by(desc(Ticket.created_at)).all()
        logger.info(f"Successfully retrieved {len(tickets)} tickets")
        return tickets
    except Exception as e:
        logger.error(f"Failed to query tickets list: {str(e)}")
        raise DatabaseException(e)


def get_ticket_by_id(db: Session, ticket_id: str) -> Ticket:
    """
    Fetches a specific ticket by its string 'ticket_id' (e.g. 'TKT-001').
    Raises TicketNotFoundException if the ticket is not found.
    """
    logger.info(f"Fetching ticket details for: {ticket_id}")
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    
    if not ticket:
        logger.warning(f"Ticket not found: {ticket_id}")
        raise TicketNotFoundException(ticket_id)
        
    logger.info(f"Successfully retrieved details for ticket: {ticket_id}")
    return ticket


def update_ticket(db: Session, ticket_id: str, update_data: TicketUpdateRequest) -> Ticket:
    """
    Updates a ticket's status and its associated single note.
    """
    logger.info(f"Updating ticket {ticket_id} (Status: {update_data.status})")
    try:
        ticket = get_ticket_by_id(db, ticket_id)

        if not ticket:
            logger.warning(f"Ticket not found: {ticket_id}")
            raise TicketNotFoundException(ticket_id)
        
        # Update the ticket's status
        ticket.status = update_data.status
        
        # Handle the one-to-one note update
        if update_data.notes is not None:
            if ticket.note:
                # Update existing note text
                logger.info(f"Updating existing note for ticket {ticket_id}")
                ticket.note.note_text = update_data.notes
            else:
                # Create a new note record
                logger.info(f"Creating new note for ticket {ticket_id}")
                ticket.note = Note(note_text=update_data.notes)
        
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        logger.info(f"Successfully updated ticket: {ticket_id}")
        return ticket
    except AppException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update ticket {ticket_id}: {str(e)}")
        raise DatabaseException(e)


def delete_ticket(db: Session, ticket_id: str) -> None:
    """
    Deletes a ticket along with its associated note (handled automatically by cascade delete).
    """
    logger.info(f"Attempting to delete ticket: {ticket_id}")
    try:
        ticket = get_ticket_by_id(db, ticket_id)

        if not ticket:
            logger.warning(f"Ticket not found: {ticket_id}")
            raise TicketNotFoundException(ticket_id)
        
        db.delete(ticket)
        db.commit()
        
        logger.info(f"Successfully deleted ticket {ticket_id} and its associated note.")
    except AppException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete ticket {ticket_id}: {str(e)}")
        raise DatabaseException(e)
