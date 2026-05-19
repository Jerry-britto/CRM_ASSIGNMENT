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

const initialTickets: Ticket[] = [
  {
    id: 1,
    ticket_id: 'TKT-001',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah.j@techcorp.io',
    subject: 'Database migration timeout on production',
    description: 'The automated database migration script timed out after 30 seconds while applying indices to the transactions table. The lock contention appears high due to concurrent user traffic during standard operational hours.',
    status: 'Open',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    note: {
      id: 101,
      ticket_id: 1,
      note_text: 'Investigating the database connection pool size. It seems SQLite is locked due to high concurrent writes. We should temporarily throttle bulk updates.',
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    }
  },
  {
    id: 2,
    ticket_id: 'TKT-002',
    customer_name: 'David Miller',
    customer_email: 'd.miller@shopflow.dev',
    subject: 'Unable to process stripe checkout session callbacks',
    description: 'We are receiving successful Stripe checkout webhook events (200 OK), but the internal client checkout state remains in "pending". The cart checkout flow is interrupted and clients are experiencing delays in shipping confirmations.',
    status: 'In Progress',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    note: {
      id: 102,
      ticket_id: 2,
      note_text: 'Webhooks are reaching our secondary logging endpoints successfully. However, our main application router is discarding the payload due to a missing session header. Debugging router logic.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    }
  },
  {
    id: 3,
    ticket_id: 'TKT-003',
    customer_name: 'Elena Rostova',
    customer_email: 'elena.r@enterprise.net',
    subject: 'SSO login authentication failure with Okta integration',
    description: 'Enterprise SSO federation is throwing error code SSO_403 on logins originating from the Australian office subnet. The redirection flow is broken and users are redirected to a blank login page.',
    status: 'Closed',
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(), // 8 days ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    note: {
      id: 103,
      ticket_id: 3,
      note_text: 'Issue resolved. The redirect URI domain mismatch inside Okta developer portal configuration was updated to match our live regional subdomain. Verified all login handshakes are succeeding now.',
      created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    }
  }
];

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('crm_tickets');
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

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

  useEffect(() => {
    localStorage.setItem('crm_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'ticket_id' | 'status' | 'created_at' | 'updated_at' | 'note'>) => {
    const nextId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const ticketIdNum = tickets.length > 0 ? Math.max(...tickets.map(t => {
      const match = t.ticket_id.match(/TKT-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })) + 1 : 1;
    const ticket_id = `TKT-${String(ticketIdNum).padStart(3, '0')}`;

    const newTicket: Ticket = {
      ...ticketData,
      id: nextId,
      ticket_id,
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      note: null
    };

    setTickets(prev => [newTicket, ...prev]);
    setNotification({ message: `Ticket ${ticket_id} created successfully!`, type: 'success' });
    // Navigate home by changing hash (triggers browser history push and handleHashChange)
    window.location.hash = '';
  };

  const updateTicket = (ticketId: string, status: TicketStatus, noteText: string) => {
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId) {
        const existingNote = t.note;
        const updatedNote: Note | null = noteText.trim() ? {
          id: existingNote?.id || Math.floor(Math.random() * 10000),
          ticket_id: t.id,
          note_text: noteText,
          created_at: existingNote?.created_at || new Date().toISOString()
        } : null;

        return {
          ...t,
          status,
          updated_at: new Date().toISOString(),
          note: updatedNote
        };
      }
      return t;
    }));
    setNotification({ message: `Ticket ${ticketId} updated successfully!`, type: 'success' });
    // Navigate to detail by changing hash
    window.location.hash = `/detail/${ticketId}`;
  };

  const deleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.ticket_id !== ticketId));
    setNotification({ message: `Ticket ${ticketId} deleted successfully!`, type: 'danger' });
    // Navigate home by changing hash
    window.location.hash = '';
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
