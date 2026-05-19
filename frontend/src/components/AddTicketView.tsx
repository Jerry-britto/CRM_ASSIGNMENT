import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';

export const AddTicketView: React.FC = () => {
  const { addTicket, navigateTo, isSubmitting } = useCRM();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  // Validation State
  const [error, setError] = useState<string | null>(null);

  // Email format regex
  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check if any field is completely empty
    if (!customerName.trim() || !customerEmail.trim() || !subject.trim() || !description.trim()) {
      setError('All fields are required');
      return;
    }

    // 2. Check minimum length requirements
    if (customerName.trim().length < 2) {
      setError('Customer Name must be at least 2 characters');
      return;
    }

    if (customerEmail.trim().length < 5) {
      setError('Customer Email must be at least 5 characters');
      return;
    }

    if (!isEmailValid(customerEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setError(null);

    // Call service to add the ticket dynamically
    addTicket({
      customer_name: customerName,
      customer_email: customerEmail,
      subject,
      description
    });
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '10px 0 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Back to Home Button */}
      <div>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => navigateTo('home')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Industrial HUD Form Block */}
      <div className="hud-box" style={{ padding: '32px' }}>
        <div className="hud-corner corner-tl"></div><div className="hud-corner corner-tr"></div>
        <div className="hud-corner corner-bl"></div><div className="hud-corner corner-br"></div>

        {/* Section Title */}
        <div style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '16px', marginBottom: '28px' }}>
          <div className="meta-text" style={{ marginBottom: '4px' }}>
            <span className="pulse-dot" style={{ backgroundColor: 'var(--border-accent)' }}></span>
            New Ticket Form
          </div>
          <h2 style={{ fontSize: '24px', color: 'var(--text-main)' }}>Create New Ticket</h2>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="terminal-block" style={{ borderLeftColor: '#ef4444', color: '#f87171', marginBottom: '24px', padding: '14px 20px' }}>
            <div className="terminal-header" style={{ color: 'rgba(239, 68, 68, 0.5)', borderBottomColor: 'rgba(239, 68, 68, 0.15)' }}>
              <span>[VALIDATION CHECK]</span>
            </div>
            <div className="terminal-body">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label">
                <span>Customer Name</span>
                <span style={{ color: customerName.trim().length >= 2 ? 'var(--color-closed)' : 'var(--text-muted)' }}>
                  {customerName.trim().length >= 2 ? '✓ READY' : '* MIN 2 CHARS'}
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Customer Email */}
            <div className="form-group">
              <label className="form-label">
                <span>Customer Email</span>
                <span style={{ color: (customerEmail.trim().length >= 5 && isEmailValid(customerEmail)) ? 'var(--color-closed)' : 'var(--text-muted)' }}>
                  {(customerEmail.trim().length >= 5 && isEmailValid(customerEmail)) ? '✓ VALID' : '* MIN 5 CHARS'}
                </span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. j.doe@domain.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Ticket Subject */}
          <div className="form-group">
            <label className="form-label">
              <span>Subject</span>
              <span style={{ color: subject.trim().length >= 5 ? 'var(--color-closed)' : 'var(--text-muted)' }}>
                {subject.trim().length >= 5 ? '✓ READY' : '* MIN 5 CHARS'}
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. SSO Login throws 403 Forbidden error"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Issue Description */}
          <div className="form-group">
            <label className="form-label">
              <span>Description</span>
              <span style={{ color: description.trim().length >= 10 ? 'var(--color-closed)' : 'var(--text-muted)' }}>
                {description.trim().length >= 10 ? '✓ READY' : '* MIN 10 CHARS'}
              </span>
            </label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border-dim)', paddingTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={() => navigateTo('home')} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-dot" style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                    marginRight: '8px'
                  }}></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Create Ticket
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
