import React, { createContext, useContext, useState, useEffect } from 'react';

export type TicketStatus = 'Open' | 'In Progress' | 'Closed';

export interface Note {
  id: number;
  ticket_id: number;
  note_text: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  note?: Note | null;
}

export type PageType = 'home' | 'add' | 'detail' | 'update';

interface CRMContextType {
  tickets: Ticket[];
  currentPage: PageType;
  activeTicketId: string | null;
  notification: { message: string; type: 'success' | 'info' | 'danger' } | null;
  addTicket: (ticketData: Omit<Ticket, 'id' | 'ticket_id' | 'status' | 'created_at' | 'updated_at' | 'note'>) => void;
  updateTicket: (ticketId: string, status: TicketStatus, noteText: string) => void;
  deleteTicket: (ticketId: string) => void;
  navigateTo: (page: PageType, ticketId?: string | null) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000/api/tickets';

const mapApiTicketToFrontend = (apiTicket: any): Ticket => {
  return {
    id: apiTicket.id || 0,
    ticket_id: apiTicket.ticket_id,
    customer_name: apiTicket.customer_name,
    customer_email: apiTicket.customer_email,
    subject: apiTicket.subject,
    description: apiTicket.description,
    status: apiTicket.status,
    created_at: apiTicket.created_at,
    updated_at: apiTicket.created_at,
    note: apiTicket.notes ? {
      id: apiTicket.id || 0,
      ticket_id: apiTicket.id || 0,
      note_text: apiTicket.notes,
      created_at: apiTicket.created_at
    } : null
  };
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(mapApiTicketToFrontend);
        setTickets(mapped);
      } else {
        console.error('Failed to fetch tickets from live API');
      }
    } catch (err) {
      console.error('Failed to connect to the backend server:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Self-clearing notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync state from hash on mount and when browser back/forward buttons are clicked
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#/' || hash === '#/home' || hash === '#home') {
        setCurrentPage('home');
        setActiveTicketId(null);
      } else if (hash === '#/add' || hash === '#add') {
        setCurrentPage('add');
        setActiveTicketId(null);
      } else if (hash.startsWith('#/detail/') || hash.startsWith('#detail/')) {
        const parts = hash.split('/');
        const id = parts[parts.length - 1];
        setCurrentPage('detail');
        setActiveTicketId(id);
      } else if (hash.startsWith('#/update/') || hash.startsWith('#update/')) {
        const parts = hash.split('/');
        const id = parts[parts.length - 1];
        setCurrentPage('update');
        setActiveTicketId(id);
      }
    };

    // Run on initial page load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'ticket_id' | 'status' | 'created_at' | 'updated_at' | 'note'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      if (res.ok) {
        const data = await res.json();
        setNotification({ message: `Ticket ${data.ticket_id} created successfully!`, type: 'success' });
        await fetchTickets();
        window.location.hash = '';
      } else {
        setNotification({ message: 'Failed to create ticket on server.', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Server connection error during ticket creation.', type: 'danger' });
    }
  };

  const updateTicket = async (ticketId: string, status: TicketStatus, noteText: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          notes: noteText.trim() || null
        })
      });
      if (res.ok) {
        setNotification({ message: `Ticket ${ticketId} updated successfully!`, type: 'success' });
        await fetchTickets();
        window.location.hash = `/detail/${ticketId}`;
      } else {
        setNotification({ message: 'Failed to update ticket status on server.', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Server connection error during ticket update.', type: 'danger' });
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${ticketId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotification({ message: `Ticket ${ticketId} deleted successfully!`, type: 'danger' });
        await fetchTickets();
        window.location.hash = '';
      } else {
        setNotification({ message: 'Failed to delete ticket on server.', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Server connection error during ticket deletion.', type: 'danger' });
    }
  };

  const navigateTo = (page: PageType, ticketId: string | null = null) => {
    if (page === 'home') {
      window.location.hash = '';
    } else if (page === 'add') {
      window.location.hash = '/add';
    } else if (page === 'detail' && ticketId) {
      window.location.hash = `/detail/${ticketId}`;
    } else if (page === 'update' && ticketId) {
      window.location.hash = `/update/${ticketId}`;
    }
  };

  return (
    <CRMContext.Provider value={{
      tickets,
      currentPage,
      activeTicketId,
      notification,
      addTicket,
      updateTicket,
      deleteTicket,
      navigateTo
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
