import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TwinDataProvider, useTwinData } from './context/TwinDataContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { LiveDashboard } from './components/dashboard/LiveDashboard';
import { DataManager } from './components/datamanager/DataManager';
import { BackupSuppliersPage } from './components/backups/BackupSuppliersPage';
import { WhatIfSimulator } from './components/simulation/WhatIfSimulator';
import { RecoveryPlanner } from './components/recovery/RecoveryPlanner';
import { AlertsAndHistory } from './components/alerts/AlertsAndHistory';
import { KnowledgeBasePage } from './components/knowledge/KnowledgeBasePage';
import { AuthPage } from './components/auth/AuthPage';
import { CommandPalette } from './components/common/CommandPalette';
import { ExecutiveReportModal } from './components/common/ExecutiveReportModal';
import { FloatingChat } from './components/common/FloatingChat';
import { DisruptionModal } from './components/dashboard/DisruptionModal';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global keyboard shortcuts (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopNav
          currentPage={currentPage}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenExecutiveReport={() => setIsExecutiveReportOpen(true)}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <LiveDashboard onNavigateToRecovery={() => setCurrentPage('recovery')} />
          )}
          {currentPage === 'datamanager' && <DataManager />}
          {currentPage === 'backups' && <BackupSuppliersPage />}
          {currentPage === 'simulation' && (
            <WhatIfSimulator onNavigateToRecovery={() => setCurrentPage('recovery')} />
          )}
          {currentPage === 'recovery' && <RecoveryPlanner />}
          {currentPage === 'alerts' && (
            <AlertsAndHistory onNavigateToRecovery={() => setCurrentPage('recovery')} />
          )}
          {currentPage === 'knowledge' && <KnowledgeBasePage />}
        </main>
      </div>

      {/* Global Modals & Floating Components */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(p) => setCurrentPage(p)}
        onOpenDisruptionModal={() => setIsDisruptionModalOpen(true)}
      />

      <ExecutiveReportModal
        isOpen={isExecutiveReportOpen}
        onClose={() => setIsExecutiveReportOpen(false)}
      />

      <DisruptionModal
        isOpen={isDisruptionModalOpen}
        onClose={() => setIsDisruptionModalOpen(false)}
        onSubmitted={() => setCurrentPage('recovery')}
      />

      {/* Floating AI Copilot */}
      <FloatingChat currentPage={currentPage} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TwinDataProvider>
          <MainLayout />
        </TwinDataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

