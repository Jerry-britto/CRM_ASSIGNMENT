import React, { useState, useEffect } from 'react';
import { useCRM, type TicketStatus } from '../context/CRMContext';

export const UpdateTicketView: React.FC = () => {
  const { tickets, activeTicketId, updateTicket, navigateTo } = useCRM();

  // Find active ticket
  const ticket = tickets.find(t => t.ticket_id === activeTicketId);

  // Form states
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setNotes(ticket.note?.note_text || '');
    }
  }, [ticket]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTicket(ticket.ticket_id, status, notes);
  };

  const getStatusColor = (s: TicketStatus) => {
    switch (s) {
      case 'Open': return 'var(--color-open)';
      case 'In Progress': return 'var(--color-progress)';
      case 'Closed': return 'var(--color-closed)';
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '10px 0 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Navigation Ribbon */}
      <div>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => navigateTo('detail', ticket.ticket_id)}>
          ← Back to Details
        </button>
      </div>

      {/* Editor Box */}
      <div className="hud-box" style={{ padding: '32px' }}>
        <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
        <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>

        {/* Header Section */}
        <div style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '16px', marginBottom: '28px' }}>
          <div className="meta-text" style={{ marginBottom: '4px' }}>
            <span className="pulse-dot" style={{ backgroundColor: 'var(--border-active)' }}></span>
            Ticket ID: {ticket.ticket_id}
          </div>
          <h2 style={{ fontSize: '24px', color: 'var(--text-main)' }}>Update Ticket</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. Status Selection Panel (Segmented controls) */}
          <div className="form-group">
            <label className="form-label">
              <span>Status</span>
              <span className="font-tech" style={{ color: getStatusColor(status) }}>
                [SELECTED: {status.toUpperCase()}]
              </span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '4px' }}>
              {(['Open', 'In Progress', 'Closed'] as const).map((s) => {
                const isActive = status === s;
                const activeColor = getStatusColor(s);
                return (
                  <button
                    key={s}
                    type="button"
                    style={{
                      cursor: 'pointer',
                      padding: '14px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      backgroundColor: isActive ? 'var(--bg-dark)' : 'transparent',
                      border: `1px solid ${isActive ? activeColor : 'var(--border-dim)'}`,
                      color: isActive ? activeColor : 'var(--text-secondary)',
                      borderRadius: '4px',
                      boxShadow: isActive ? `0 0 14px ${activeColor}1e` : 'none',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setStatus(s)}
                  >
                    <span 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: activeColor, 
                        display: 'inline-block',
                        opacity: isActive ? 1 : 0.4
                      }}
                    ></span>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Monospace Note Terminal Editor */}
          <div className="form-group">
            <label className="form-label">
              <span>Note</span>
              <span style={{ color: notes.trim() ? 'var(--color-closed)' : 'var(--text-muted)' }}>
                {notes.length}/2000 CHARS
              </span>
            </label>

            <textarea
              className="form-input form-textarea"
              style={{
                fontFamily: 'var(--font-mono)',
                color: '#78350f', /* Monospace warm chocolate text */
                backgroundColor: '#fefcf0', /* Warm Vanilla paper background */
                border: '1px solid #fef3c7',
                padding: '20px',
                lineHeight: '1.6',
                minHeight: '160px'
              }}
              placeholder="Write a note about this ticket here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
            <div className="meta-text" style={{ fontSize: '11px', marginTop: '4px' }}>
              ℹ Leaving the note empty will delete any existing note.
            </div>
          </div>

          {/* 3. Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid var(--border-dim)', paddingTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={() => navigateTo('detail', ticket.ticket_id)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save Changes
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
