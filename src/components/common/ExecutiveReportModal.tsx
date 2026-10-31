import React from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { Printer, Download, X, CheckCircle, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

export const ExecutiveReportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { data, activeDisruption, impactResult, selectedPlan, currentClock, currentDate, timeZone } = useTwinData();

  if (!isOpen) return null;

  const plan = selectedPlan || (data.plans.length > 0 ? data.plans[0] : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Top Action Bar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Executive Recovery Briefing & Digital Twin Audit
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 space-y-6 text-slate-800 dark:text-slate-200" id="executive-report">
          {/* Document Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                CHAINTWIN AI <span className="text-blue-600 text-sm font-semibold tracking-normal">&bull; Autonomous Recovery Report</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tiruppur Apparel Supply Chain Network &bull; Digital Twin Incident Audit
              </div>
            </div>
            <div className="text-right text-xs space-y-0.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Generated: {currentDate} {currentClock}</div>
              <div className="text-slate-400 font-mono text-[11px]">Timezone: {timeZone}</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                Deterministic Engine Verified
              </div>
            </div>
          </div>

          {/* Incident Overview Card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold uppercase text-slate-400">Disruption Status</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {activeDisruption ? `${activeDisruption.supplier_id} (${activeDisruption.duration_days} Days)` : 'Nominal (No Active Outage)'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {activeDisruption ? `Started ${activeDisruption.start_date}` : 'All 5 primary suppliers active'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold uppercase text-slate-400">At-Risk Orders</div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                {impactResult.late_orders} / {impactResult.total_orders} Orders
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Unmitigated Penalties: ₹{impactResult.total_penalties_inr.toLocaleString()} INR
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold uppercase text-slate-400">Selected Strategy</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1 truncate">
                {plan?.name || 'Awaiting Plan Selection'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Composite Score: {plan?.scores.composite || 100}/100
              </div>
            </div>
          </div>

          {/* Selected Plan Details */}
          {plan ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2 dark:border-slate-800">
                Recovery Action Implementation Matrix
              </h3>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Action Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">Lead Time</th>
                      <th className="p-3">Cost (INR)</th>
                      <th className="p-3">Status Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {plan.actions.map(act => (
                      <tr key={act.id}>
                        <td className="p-3 max-w-xs">{act.description}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold">
                            {act.category}
                          </span>
                        </td>
                        <td className="p-3">{act.target_entity}</td>
                        <td className="p-3">{act.lead_time_days} days</td>
                        <td className="p-3 font-semibold">₹{act.cost_inr.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold uppercase ${act.data_status === 'Known' ? 'text-emerald-500' : 'text-amber-500 border-b border-dotted border-amber-500'}`}>
                            {act.data_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 6D Scores Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Six-Dimensional Optimization Scorecard:
                </div>
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">Cost</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{plan.scores.cost}/100</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">SLA</div>
                    <div className="font-bold text-sm text-emerald-500">{plan.scores.sla}/100</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">Speed</div>
                    <div className="font-bold text-sm text-blue-500">{plan.scores.recovery_time}/100</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">Customer</div>
                    <div className="font-bold text-sm text-purple-500">{plan.scores.customer_impact}/100</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">Risk</div>
                    <div className="font-bold text-sm text-amber-500">{plan.scores.operational_risk}/100</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">Carbon</div>
                    <div className="font-bold text-sm text-teal-500">{plan.scores.sustainability}/100</div>
                  </div>
                </div>
              </div>

              {/* Assumptions vs Knowns */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Known Information
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {plan.knowns.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20">
                  <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Recorded Operational Assumptions
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {plan.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No recovery plan selected. Trigger a disruption in the Live Dashboard to generate candidate plans.
            </div>
          )}

          {/* Footer Sign-off */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>Approved by: ________________________ (Supply Chain Lead)</div>
            <div>ChainTwin AI Engine v1.0 &bull; Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

