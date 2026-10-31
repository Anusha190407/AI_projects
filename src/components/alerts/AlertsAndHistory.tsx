import React from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import {
  Bell,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  History,
  ArrowRight
} from 'lucide-react';

export const AlertsAndHistory: React.FC<{ onNavigateToRecovery: () => void }> = ({
  onNavigateToRecovery
}) => {
  const { data, reportDisruption, undoLastAction, currentDate } = useTwinData();

  const handleConfirmDisruption = (alt: any) => {
    reportDisruption({
      supplier_id: 'SUP-01',
      start_date: currentDate,
      duration_days: 7,
      capacity_loss_pct: 100,
      reason: `Confirmed from early warning alert: ${alt.title} — ${alt.message}`
    });
  };

  const patternInsights = [
    {
      id: 'PAT-01',
      title: 'Spinning Mill Outage Recurrence Correlation',
      text: 'Historical records show power-grid fluctuations in the Coimbatore-Tiruppur corridor correlate with a 3-day delay every November.',
      confidence: 'High (3 past occurrences)',
      recommendation: 'Pre-allocate buffer yarn in FAC-2 prior to seasonal peak.'
    },
    {
      id: 'PAT-02',
      title: 'Backup Supplier Reliability Drift',
      text: 'Salem Fine Spinners (SUP-07) quotes have remained unconfirmed estimates for 14+ days.',
      confidence: 'Medium',
      recommendation: 'Dispatch an RFQ renewal via Backup Supplier Matrix.'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Early Warning Sensing & Traceability
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Operational Alerts & Immutable Audit History
          </h2>
        </div>

        <button
          onClick={undoLastAction}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          title="Rollback most recent state change"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo Previous Action</span>
        </button>
      </div>

      {/* Early Warning Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Proactive Early Warning Signals ({data.alerts.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Signals require human confirmation before triggering disruption recovery
          </span>
        </div>

        <div className="space-y-3">
          {data.alerts.map(alt => (
            <div
              key={alt.id}
              className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {alt.title}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {alt.severity} severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {alt.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleConfirmDisruption(alt)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Confirm as Real Disruption
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Pattern Insights */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Autonomous Pattern Insights & Vulnerability Trends
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patternInsights.map(p => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{p.title}</span>
                <span className="text-[10px] text-purple-500 font-semibold">{p.confidence}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {p.text}
              </p>
              <div className="pt-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                &bull; Suggested: {p.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disruption & Audit History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Immutable State & Recovery Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {data.audit_history.length} audit records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3.5 pl-6">Timestamp</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5 pr-6">Operational Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {data.audit_history.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 pl-6 font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      {item.action_type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {item.user_email}
                  </td>
                  <td className="p-3.5 pr-6 text-slate-700 dark:text-slate-200">
                    {item.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

