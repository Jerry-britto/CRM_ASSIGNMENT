import React, { useState } from 'react';
import { useCRM, type TicketStatus } from '../context/CRMContext.tsx';

export const HomeView: React.FC = () => {
  const { tickets, navigateTo, loading } = useCRM();
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate reactive stats
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const progressCount = tickets.filter(t => t.status === 'In Progress').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

  // 2. Perform advanced quick search and filtering
  const filteredTickets = tickets.filter(t => {
    // Status filter match
    const statusMatch = selectedStatus === 'All' || t.status === selectedStatus;
    
    // Comprehensive quick search across Name, ID, Email, Subject, and Description
    const query = searchQuery.toLowerCase().trim();
    if (!query) return statusMatch;
    
    const searchMatch = 
      t.ticket_id.toLowerCase().includes(query) ||
      t.customer_name.toLowerCase().includes(query) ||
      t.customer_email.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  });

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'var(--color-open)';
      case 'In Progress': return 'var(--color-progress)';
      case 'Closed': return 'var(--color-closed)';
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '10px 0 40px' }}>
      
      {/* 1. Industrial Tech Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          
          <h2 style={{ fontSize: '32px', color: 'var(--text-main)', letterSpacing: '0.05em' }}>CRM  Dashboard</h2>
        </div>
        
        <button className="btn-primary" onClick={() => navigateTo('add')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Ticket
        </button>
      </div>

      {/* 2. Numeric Statistics HUD Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div className="hud-box" style={{ padding: '20px', borderLeft: '3px solid var(--text-muted)' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
          <div className="meta-text">Total Tickets</div>
          <div style={{ fontSize: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px' }}>
            {totalCount.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="hud-box" style={{ padding: '20px', borderLeft: '3px solid var(--color-open)' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
          <div className="meta-text" style={{ color: 'var(--color-open)' }}>Open Tickets</div>
          <div style={{ fontSize: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-open)', marginTop: '8px' }}>
            {openCount.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="hud-box" style={{ padding: '20px', borderLeft: '3px solid var(--color-progress)' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
          <div className="meta-text" style={{ color: 'var(--color-progress)' }}>In Progress</div>
          <div style={{ fontSize: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-progress)', marginTop: '8px' }}>
            {progressCount.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="hud-box" style={{ padding: '20px', borderLeft: '3px solid var(--color-closed)' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
          <div className="meta-text" style={{ color: 'var(--color-closed)' }}>Closed Tickets</div>
          <div style={{ fontSize: '36px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-closed)', marginTop: '8px' }}>
            {closedCount.toString().padStart(2, '0')}
          </div>
        </div>

      </div>

      {/* 3. Search and Filtering Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', backgroundColor: 'var(--bg-dark)', padding: '16px', border: '1px solid var(--border-dim)', borderRadius: '4px' }}>
        
        {/* Real-time Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['All', 'Open', 'In Progress', 'Closed'] as const).map((status) => {
            const count = status === 'All' ? totalCount : tickets.filter(t => t.status === status).length;
            const isActive = selectedStatus === status;
            return (
              <button 
                key={status}
                className={`btn-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
                <span style={{ fontSize: '11px', opacity: 0.6, background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-darker)', padding: '2px 6px', borderRadius: '10px' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Multi-Field Quick Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            placeholder="Search names, IDs, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              ×
            </button>
          )}
        </div>

      </div>

      {/* 4. Filter Results List */}
      {loading ? (
        <div className="hud-box" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
          
          <span className="spinner-dot" style={{
            width: '28px',
            height: '28px',
            border: '3px solid rgba(2, 132, 199, 0.1)',
            borderTopColor: 'var(--border-active)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite'
          }}></span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              FETCHING SYSTEM TICKETS...
            </h3>
          </div>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredTickets.map((ticket) => {
            const statusColor = getStatusColor(ticket.status);
            return (
              <div 
                key={ticket.ticket_id} 
                className="hud-box"
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderLeft: `3px solid ${statusColor}`
                }}
                onClick={() => navigateTo('detail', ticket.ticket_id)}
              >
                {/* Corner Indicators */}
                <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
                <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
                
                {/* Top Metabar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="font-tech" style={{ fontSize: '15px', color: statusColor, fontWeight: 'bold' }}>
                      [{ticket.ticket_id}]
                    </span>
                    <span className="meta-text">
                      BY: {ticket.customer_name} ({ticket.customer_email})
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="meta-text">
                      CREATED: {formatDate(ticket.created_at)}
                    </span>
                    <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      <span className="pulse-dot" style={{ backgroundColor: statusColor }}></span>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '0.02em', textTransform: 'none', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
                    {ticket.subject}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    {ticket.description.length > 120 
                      ? ticket.description.substring(0, 120) + '....' 
                      : ticket.description}
                  </p>
                </div>

                {/* Footer Micro-indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.02)' }}>
                  <div className="meta-text" style={{ fontSize: '11px' }}>
                    {ticket.note ? '★ Has Note' : 'No notes'}
                  </div>
                  <span className="meta-text" style={{ color: 'var(--border-active)', fontSize: '11px' }}>
                    View Details →
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State Indicator */
        <div className="hud-box" style={{ textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>
          
          <div style={{ color: 'var(--text-muted)', fontSize: '48px', marginBottom: '16px' }}>⚙</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {tickets.length === 0 ? 'No Tickets Registered' : 'No tickets found'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {tickets.length === 0 
              ? 'Click the Create Ticket button at the top right to submit your first system record.' 
              : 'Modify your filters or enter a different search query.'}
          </p>
        </div>
      )}

    </div>
  );
};
