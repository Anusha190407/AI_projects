import React, { useState } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { RecoveryPlan } from '../../types';
import { NetworkGraph } from '../network/NetworkGraph';
import { KnownAssumptionBadge } from '../common/KnownAssumptionBadge';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
  X,
  FileCheck,
  Percent,
  Leaf
} from 'lucide-react';

export const RecoveryPlanner: React.FC = () => {
  const {
    activePlans,
    selectedPlan,
    setSelectedPlan,
    previewedPlan,
    previewPlan,
    cancelPreview,
    finalisePlan,
    undoLastAction,
    weights,
    setWeights,
    mode,
    activeDisruption,
    data
  } = useTwinData();

  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [showWhyDrawer, setShowWhyDrawer] = useState(false);
  const [editingAssumption, setEditingAssumption] = useState<string | null>(null);

  if (!activeDisruption && activePlans.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Supply Network is Healthy & Operating at Nominal Capacity
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No active disruption events are currently detected. You can report a disruption on the Live Dashboard or run a scenario in the What-If Simulator.
        </p>
      </div>
    );
  }

  const currentPlan = selectedPlan || activePlans[0];

  const handleSliderChange = (key: keyof typeof weights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Strategy Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Multi-Objective Network Recovery
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Autonomous Recovery Plan Optimizer
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showWeightSliders
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/40'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-500" />
            <span>Customize 6D Weights</span>
          </button>

          <button
            onClick={() => setShowWhyDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-100 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Why This Plan?</span>
          </button>
        </div>
      </div>

      {/* Weight Tuning Sliders Panel */}
      {showWeightSliders && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-500/30 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configure Multi-Objective Optimization Dimension Weights:
            </span>
            <span className="text-xs text-blue-500 font-semibold">
              Live Recalculation Active
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Cost Weight:</span>
                <span>{Math.round(weights.cost * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={weights.cost}
                onChange={(e) => handleSliderChange('cost', Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>SLA Weight:</span>
                <span>{Math.round(weights.sla * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={weights.sla}
                onChange={(e) => handleSliderChange('sla', Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Speed Weight:</span>
                <span>{Math.round(weights.recovery_time * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={weights.recovery_time}
                onChange={(e) => handleSliderChange('recovery_time', Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Customer Weight:</span>
                <span>{Math.round(weights.customer_impact * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={weights.customer_impact}
                onChange={(e) => handleSliderChange('customer_impact', Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Risk Weight:</span>
                <span>{Math.round(weights.operational_risk * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={weights.operational_risk}
                onChange={(e) => handleSliderChange('operational_risk', Number(e.target.value))}
                className="w-full accent-amber-600 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Carbon Weight:</span>
                <span>{Math.round(weights.sustainability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={weights.sustainability}
                onChange={(e) => handleSliderChange('sustainability', Number(e.target.value))}
                className="w-full accent-teal-600 h-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activePlans.map(plan => {
          const isSelected = currentPlan?.id === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    plan.tag === 'Baseline'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : plan.tag === 'Internal'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {plan.tag}
                  </span>
                  {plan.recommended && (
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      ★ Recommended
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {plan.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {plan.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Score</span>
                  <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                    {plan.scores.composite}/100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Net Avoided Loss</span>
                  <span className="font-bold text-xs text-emerald-500">
                    ₹{plan.net_benefit_inr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Plan Details & Action Matrix */}
      {currentPlan && (
        <div className="space-y-6">
          {/* Action Header Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentPlan.name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold">
                    {currentPlan.actions.length} Action Directives
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {currentPlan.description}
                </p>
              </div>

              {/* Approval Buttons: Proposed -> Previewed -> Finalised */}
              <div className="flex items-center gap-3">
                {previewedPlan?.id === currentPlan.id ? (
                  <>
                    <button
                      onClick={cancelPreview}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      Exit Preview
                    </button>
                    <button
                      onClick={() => finalisePlan(currentPlan)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Finalise Strategy to Live</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => previewPlan(currentPlan)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <span>Preview Changes on Network</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 6D Optimization Metric Badges */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Cost Index</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{currentPlan.scores.cost}/100</span>
                <span className="text-[10px] text-slate-500 block">₹{currentPlan.scores.raw_cost_inr.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">SLA Commitment</span>
                <span className="font-bold text-sm text-emerald-500">{currentPlan.scores.sla}/100</span>
                <span className="text-[10px] text-slate-500 block">{currentPlan.scores.raw_sla_pct}% on-time</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recovery Speed</span>
                <span className="font-bold text-sm text-blue-500">{currentPlan.scores.recovery_time}/100</span>
                <span className="text-[10px] text-slate-500 block">{currentPlan.scores.raw_recovery_days} days</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Customer Impact</span>
                <span className="font-bold text-sm text-purple-500">{currentPlan.scores.customer_impact}/100</span>
                <span className="text-[10px] text-slate-500 block">{currentPlan.scores.raw_late_orders} orders late</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Risk Score</span>
                <span className="font-bold text-sm text-amber-500">{currentPlan.scores.operational_risk}/100</span>
                <span className="text-[10px] text-slate-500 block">{currentPlan.assumptions.length} assumptions</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Carbon CO2</span>
                <span className="font-bold text-sm text-teal-500">{currentPlan.scores.sustainability}/100</span>
                <span className="text-[10px] text-slate-500 block">{currentPlan.scores.raw_co2_kg} kg CO2</span>
              </div>
            </div>

            {/* Actions Table */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3 pl-4">Directive</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Lead Time</th>
                    <th className="p-3">Additional Cost</th>
                    <th className="p-3 pr-4">Data Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {currentPlan.actions.map(act => (
                    <tr key={act.id}>
                      <td className="p-3 pl-4">{act.description}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold">
                          {act.category}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{act.target_entity}</td>
                      <td className="p-3">{act.lead_time_days} days</td>
                      <td className="p-3 font-semibold">₹{act.cost_inr.toLocaleString()}</td>
                      <td className="p-3 pr-4">
                        <KnownAssumptionBadge status={act.data_status}>
                          {act.data_status}
                        </KnownAssumptionBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Network Graph with Preview Routes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recovery Network Simulation Topology:
              </span>
              {previewedPlan && (
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Previewing Teal Dashed Recovery Links
                </span>
              )}
            </div>
            <NetworkGraph />
          </div>
        </div>
      )}

      {/* "Why This Plan" Drawer Modal */}
      {showWhyDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Why Was This Strategy Selected?
                </h3>
              </div>
              <button onClick={() => setShowWhyDrawer(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-500/20">
                <strong>Strategic Multi-Objective Trade-Off:</strong>
                <p className="mt-1">
                  Plan A achieves a composite rating of <strong>{currentPlan?.scores.composite}/100</strong> by eliminating festive SLA penalties for high-priority accounts (Madras Mart & Hyderabad Hues). While Plan B is ₹23,800 cheaper, it forces an SLA breach on ORD-1011.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  Knowledge Base & Contract Citations:
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 block">
                      Customer_SLA_and_Penalty_Policy.pdf (Section 2.1)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      "High-priority festive retail orders incur a non-negotiable 2.0% daily penalty on invoice value. Plan A safeguards all ₹3,500,000 in festive commitments."
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 block">
                      Supply_Disruption_Response_Playbook.md (Clause 4.2)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      "When losses exceed ₹500,000 threshold, Level 2 escalation mandates issuing PO to verified regional backup (SUP-06 Erode) within 100 km radius."
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Residual Risk:
                </span>
                <p className="text-[11px] text-slate-500">
                  Plan A relies on 1 operational assumption: SUP-06 delivering within 4 days. If transit is delayed, factory overtime shifts provide a 1.5-day safety cushion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

