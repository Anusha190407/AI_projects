import React from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { NavPage } from './Sidebar';
import {
  Clock,
  Globe,
  Calendar,
  Command,
  Sun,
  Moon,
  FileText,
  Bell,
  RefreshCw
} from 'lucide-react';

interface TopNavProps {
  currentPage: NavPage;
  onOpenCommandPalette: () => void;
  onOpenExecutiveReport: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onOpenCommandPalette,
  onOpenExecutiveReport,
  darkMode,
  onToggleTheme
}) => {
  const {
    mode,
    currentClock,
    timeZone,
    currentDate,
    setCurrentDate,
    data,
    activeDisruption,
    undoLastAction
  } = useTwinData();

  const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Digital Twin Command Centre',
      subtitle: 'Real-time supply chain observability & autonomous disruption sensing'
    },
    datamanager: {
      title: 'Supply Network Schema & Data Manager',
      subtitle: 'Schema-driven CRUD, multi-sheet Excel/CSV ingestion & temporal date rebasing'
    },
    backups: {
      title: 'Tier-2 Sourcing & Backup Supplier Matrix',
      subtitle: 'Qualified alternative vendors, RFQ drafting & material substitution governance'
    },
    simulation: {
      title: 'What-If Supply Chain Sandbox',
      subtitle: 'Isolated stress-testing environment with synthetic time-travel controls'
    },
    recovery: {
      title: 'Autonomous Recovery Plan Optimizer',
      subtitle: 'Multi-objective candidate generation, 6-dimensional scoring & finalisation'
    },
    alerts: {
      title: 'Early Warning Signals & Audit Log',
      subtitle: 'Proactive SLA breach alerts, disruption timeline & state rollback'
    },
    knowledge: {
      title: 'RAG Knowledge Base & Contract Store',
      subtitle: 'Vector semantic search across supplier SLAs, force majeure & substitution rules'
    }
  };

  const currentInfo = pageTitles[currentPage];

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 z-20">
      {/* Title & subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {currentInfo.title}
          </h1>
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              mode === 'LIVE'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
            }`}
          >
            {mode === 'LIVE' ? '● LIVE' : '◆ SIMULATION'}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real Live Clock & Timezone */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>{currentClock || '12:00:00'}</span>
          <span className="text-[10px] opacity-60 font-sans">{timeZone.replace('_', ' ')}</span>
        </div>

        {/* Date Projection Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            title="Evaluation Projection Date"
          />
        </div>

        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
        >
          <Command className="w-3.5 h-3.5" />
          <span>Quick Actions</span>
          <kbd className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Executive Report Button */}
        <button
          onClick={onOpenExecutiveReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Executive Report</span>
        </button>

        {/* Undo Button */}
        <button
          onClick={undoLastAction}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Undo Last Recovery / Edit State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Dark / Light Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

