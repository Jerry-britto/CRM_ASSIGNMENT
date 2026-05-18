from datetime import datetime
import enum
from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TicketStatus(str,enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ticket_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False) 
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus, native_enum=False),
        default=TicketStatus.OPEN,
        nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), server_default=func.now(), nullable=False
    )

    # One-to-One Relationship (Each ticket has at most one optional note)
    note: Mapped[Optional["Note"]] = relationship(
        "Note", back_populates="ticket", cascade="all, delete-orphan"
    )


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # unique=True enforces the One-to-One constraint at the database integrity level
    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    note_text: Mapped[str] = mapped_column(String(2000), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )

    # Relationship back to the parent Ticket
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="note")
