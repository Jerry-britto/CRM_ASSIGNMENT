import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { HomeView } from './components/HomeView';
import { AddTicketView } from './components/AddTicketView';
import { TicketDetailView } from './components/TicketDetailView';
import { UpdateTicketView } from './components/UpdateTicketView';

// Sub-component to consume CRM Context and swap page views reactively
const AppContent: React.FC = () => {
  const { currentPage, notification } = useCRM();

  const renderActiveView = () => {
    switch (currentPage) {
      case 'home':
        return <HomeView />;
      case 'add':
        return <AddTicketView />;
      case 'detail':
        return <TicketDetailView />;
      case 'update':
        return <UpdateTicketView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {/* 1. Main Viewport Container */}
      <main 
        style={{
          flexGrow: 1,
          width: '1200px',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {renderActiveView()}
      </main>

      {/* 2. Floating Notification Snackbar */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            border: `1px solid ${notification.type === 'danger' ? '#fecaca' : '#bae6fd'}`,
            borderLeft: `4px solid ${notification.type === 'danger' ? '#ef4444' : '#0284c7'}`,
            borderRadius: '6px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
            animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Status Dot */}
          <span 
            className="pulse-dot" 
            style={{ 
              backgroundColor: notification.type === 'danger' ? '#ef4444' : '#0284c7',
              margin: 0
            }}
          ></span>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span 
              className="font-tech" 
              style={{ 
                fontSize: '10px', 
                color: notification.type === 'danger' ? '#ef4444' : '#0284c7',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
              }}
            >
              [{notification.type.toUpperCase()}]
            </span>
            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500', marginTop: '2px' }}>
              {notification.message}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

// Top-level entry wrapping the entire app inside the CRM Global Context State
function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}

export default App;
