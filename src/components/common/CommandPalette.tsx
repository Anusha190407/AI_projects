import React, { useState, useEffect } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { NavPage } from '../layout/Sidebar';
import { Search, Activity, Database, Truck, Sliders, ShieldCheck, Bell, BookOpen, AlertCircle } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: NavPage) => void;
  onOpenDisruptionModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenDisruptionModal
}) => {
  const [query, setQuery] = useState('');
  const { data, setMode } = useTwinData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Report New Disruption', icon: AlertCircle, action: () => { onClose(); onOpenDisruptionModal(); }, category: 'Actions' },
    { label: 'Switch to What-If Simulation', icon: Sliders, action: () => { setMode('SIMULATION'); onNavigate('simulation'); onClose(); }, category: 'Actions' },
    { label: 'Switch to Live Network Mode', icon: Activity, action: () => { setMode('LIVE'); onNavigate('dashboard'); onClose(); }, category: 'Actions' },
    { label: 'Go to Live Dashboard', icon: Activity, action: () => { onNavigate('dashboard'); onClose(); }, category: 'Navigation' },
    { label: 'Go to Data Manager', icon: Database, action: () => { onNavigate('datamanager'); onClose(); }, category: 'Navigation' },
    { label: 'Go to Backup Suppliers Matrix', icon: Truck, action: () => { onNavigate('backups'); onClose(); }, category: 'Navigation' },
    { label: 'Go to Recovery Planner', icon: ShieldCheck, action: () => { onNavigate('recovery'); onClose(); }, category: 'Navigation' },
    { label: 'Go to Early Alerts & History', icon: Bell, action: () => { onNavigate('alerts'); onClose(); }, category: 'Navigation' },
    { label: 'Go to Knowledge Base', icon: BookOpen, action: () => { onNavigate('knowledge'); onClose(); }, category: 'Navigation' },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search entities (e.g. Report Disruption, ORD-1001)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{item.category}</span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching actions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

