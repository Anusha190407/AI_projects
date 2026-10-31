import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTwinData } from '../../context/TwinDataContext';
import {
  Activity,
  Database,
  Truck,
  Sliders,
  ShieldCheck,
  Bell,
  BookOpen,
  LogOut,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

export type NavPage =
  | 'dashboard'
  | 'datamanager'
  | 'backups'
  | 'simulation'
  | 'recovery'
  | 'alerts'
  | 'knowledge';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const { user, logout } = useAuth();
  const { mode, activeDisruption, impactResult, data } = useTwinData();

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity, badge: activeDisruption ? 'Alert' : null },
    { id: 'datamanager', label: 'Data Manager', icon: Database },
    { id: 'backups', label: 'Backup Suppliers', icon: Truck },
    { id: 'simulation', label: 'What-If Simulator', icon: Sliders, badge: mode === 'SIMULATION' ? 'Active' : null },
    { id: 'recovery', label: 'Recovery Planner', icon: ShieldCheck, badge: activeDisruption ? `${impactResult.late_orders} at risk` : null },
    { id: 'alerts', label: 'Alerts & History', icon: Bell, badge: data.alerts.filter(a => a.status === 'Open').length || null },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-[#0b132b] text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 flex-shrink-0">
              CT
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                  ChainTwin <span className="text-teal-400 font-mono text-xs px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Autonomous Digital Twin</span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            title="Toggle Sidebar"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Mode Indicator Banner */}
        <div className="p-3">
          <div
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              mode === 'LIVE'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-purple-950/40 border-purple-500/30 text-purple-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
              {!collapsed && (
                <span>{mode === 'LIVE' ? 'LIVE NETWORK' : 'SIMULATION MODE'}</span>
              )}
            </div>
            {!collapsed && (
              <span className="text-[10px] opacity-75 font-mono">
                {mode === 'LIVE' ? 'REALTIME' : 'SANDBOX'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1.5 mt-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as NavPage)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badge === 'Alert' || String(item.badge).includes('at risk')
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & footer */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-teal-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            {!collapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user?.role}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
