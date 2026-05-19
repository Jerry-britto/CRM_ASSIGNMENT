import React, { useState } from 'react';
import { useCRM, type TicketStatus } from '../context/CRMContext';

export const TicketDetailView: React.FC = () => {
  const { tickets, activeTicketId, deleteTicket, navigateTo } = useCRM();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find active ticket
  const ticket = tickets.find(t => t.ticket_id === activeTicketId);

  if (!ticket) {
    return (
      <div className="hud-box" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>SYSTEM RECOVERY FAIL</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Ticket record was not found or has been purged from system registries.</p>
        <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigateTo('home')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

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
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const statusColor = getStatusColor(ticket.status);

  return (
    <div style={{ padding: '10px 0 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Action Ribbon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => navigateTo('home')}>
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ backgroundColor: 'var(--border-accent)', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)' }} onClick={() => navigateTo('update', ticket.ticket_id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
            </svg>
            Edit Status & Note
          </button>
          
          <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete Ticket
          </button>
        </div>
      </div>

      {/* Main Splitted HUD Console */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        
        {/* Left Side: General Ticket Metadata */}
        <div className="hud-box" style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: `4px solid ${statusColor}` }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>

          {/* Ticket Header & Status Badge */}
          <div style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="font-tech" style={{ fontSize: '18px', color: statusColor, fontWeight: 'bold' }}>
                [{ticket.ticket_id}]
              </span>
              <h3 style={{ fontSize: '22px', color: 'var(--text-main)', marginTop: '4px', textTransform: 'none', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>
                {ticket.subject}
              </h3>
            </div>
            <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`} style={{ alignSelf: 'flex-start' }}>
              <span className="pulse-dot" style={{ backgroundColor: statusColor }}></span>
              {ticket.status}
            </span>
          </div>

          {/* Customer Dossier Box */}
          <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-dim)', borderRadius: '4px', padding: '16px' }}>
            <div className="meta-text" style={{ fontSize: '11px', marginBottom: '8px' }}>Customer Details</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              {ticket.customer_name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--border-active)', fontFamily: 'var(--font-mono)' }}>
              {ticket.customer_email}
            </div>
          </div>

          {/* Description Block */}
          <div>
            <div className="meta-text" style={{ fontSize: '11px', marginBottom: '8px' }}>Description</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg-darker)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-dim)' }}>
              {ticket.description}
            </p>
          </div>

          {/* Timestamp Registers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-dim)', paddingTop: '16px' }}>
            <div className="meta-text">
              <svg className="meta-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Created: {formatDate(ticket.created_at)}
            </div>
            <div className="meta-text">
              <svg className="meta-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Last Updated: {formatDate(ticket.updated_at)}
            </div>
          </div>

        </div>

        {/* Right Side: Single Note Terminal Block */}
        <div className="hud-box" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
          <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>

          <div>
            <div className="meta-text" style={{ marginBottom: '4px' }}>Associated Note</div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Note</h3>
          </div>

          {ticket.note ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="terminal-block">
                {/* Corner indicators inside terminal */}
                <div className="terminal-header">
                  <span>[TICKET NOTE]</span>
                  <span>REF: {ticket.ticket_id}</span>
                </div>
                <div className="terminal-body">
                  {ticket.note.note_text}
                </div>
              </div>
              <div className="meta-text">
                Note Saved: {formatDate(ticket.note.created_at)}
              </div>
            </div>
          ) : (
            <div className="terminal-block terminal-empty" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div className="terminal-header" style={{ width: '100%' }}>
                <span>[STATUS]</span>
                <span>EMPTY</span>
              </div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⎉</div>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>NO NOTE ATTACHED</div>
              <div style={{ opacity: 0.6, fontSize: '12px' }}>Every ticket supports one associated status note.</div>
            </div>
          )}

        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="hud-box" 
            style={{ 
              maxWidth: '440px', 
              width: '90%', 
              padding: '32px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
            }}
          >
            {/* Precise Corner indicators */}
            <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
            <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div 
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  color: '#dc2626', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>

              <div style={{ flexGrow: 1 }}>
                <h3 
                  style={{ 
                    fontSize: '18px', 
                    color: '#0f172a', 
                    marginBottom: '8px', 
                    fontFamily: 'var(--font-sans)', 
                    textTransform: 'none', 
                    fontWeight: 'bold',
                    letterSpacing: 'normal'
                  }}
                >
                  Delete Ticket?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                  Are you sure you want to delete this ticket? This action will permanently remove ticket <strong>{ticket.ticket_id}</strong> and its associated note.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-dim)', paddingTop: '16px' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button 
                className="btn-danger" 
                style={{ padding: '8px 16px' }} 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  deleteTicket(ticket.ticket_id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
