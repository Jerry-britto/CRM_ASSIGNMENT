import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { HomeView } from './components/HomeView';
import { AddTicketView } from './components/AddTicketView';
import { TicketDetailView } from './components/TicketDetailView';
import { UpdateTicketView } from './components/UpdateTicketView';

// Sub-component to consume CRM Context and swap page views reactively
const AppContent: React.FC = () => {
  const { currentPage } = useCRM();

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
