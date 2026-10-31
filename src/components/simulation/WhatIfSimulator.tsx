import React, { useState } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { NetworkGraph } from '../network/NetworkGraph';
import { addDays } from '../../engine/calculationEngine';
import {
  Sliders,
  Calendar,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const WhatIfSimulator: React.FC<{ onNavigateToRecovery: () => void }> = ({
  onNavigateToRecovery
}) => {
  const {
    simData,
    setMode,
    reportDisruption,
    resetSimulationToLive,
    reportSimAsReal,
    impactResult,
    currentDate
  } = useTwinData();

  const [simDaysOffset, setSimDaysOffset] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState(simData.suppliers[0]?.supplier_id || 'SUP-01');
  const [durationDays, setDurationDays] = useState(12);
  const [capacityLoss, setCapacityLoss] = useState(100);

  const simulatedDate = addDays(currentDate, simDaysOffset);

  const handleApplySimDisruption = () => {
    reportDisruption({
      supplier_id: selectedSupplier,
      start_date: simulatedDate,
      duration_days: durationDays,
      capacity_loss_pct: capacityLoss,
      reason: `Synthetic What-If Simulation (${durationDays} days @ ${capacityLoss}% loss)`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Prominent Simulation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold flex-shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-purple-500 text-slate-950 px-2 py-0.5 rounded">
                SIMULATION SANDBOX
              </span>
              <span className="text-xs text-purple-200">
                The live production network is isolated & protected.
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Synthetic What-If Stress-Testing Environment
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={resetSimulationToLive}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-950 text-purple-200 border border-purple-700/50 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Live</span>
          </button>

          <button
            onClick={reportSimAsReal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Report This as Real</span>
          </button>
        </div>
      </div>

      {/* Time-Travel & Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Time Travel Slider */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-500" />
              Time-Travel Controls
            </span>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
              +{simDaysOffset} Days ({simulatedDate})
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Advance Projection Timeline:</span>
              <span>{simDaysOffset} / 30 Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={simDaysOffset}
              onChange={(e) => setSimDaysOffset(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Projected Network State on {simulatedDate}:
            </div>
            <div>&bull; Unit 1 Cotton Yarn: {Math.max(0, 8800 - simDaysOffset * 960).toLocaleString()} kg remaining</div>
            <div>&bull; Late deliveries incurred: {impactResult.late_orders} orders</div>
          </div>
        </div>

        {/* Center: Disruption Experimenter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Simulate Synthetic Disruption
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold text-slate-800 dark:text-white"
              >
                {simData.suppliers.map(s => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Outage Days</label>
              <input
                type="number"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Capacity Loss</label>
              <select
                value={capacityLoss}
                onChange={(e) => setCapacityLoss(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold text-slate-800 dark:text-white"
              >
                <option value="100">100% Total Shutdown</option>
                <option value="75">75% Major Outage</option>
                <option value="50">50% Half Capacity</option>
                <option value="25">25% Minor Delay</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              Evaluates stockout cascading across {simData.orders.length} orders
            </div>
            <button
              onClick={handleApplySimDisruption}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
            >
              <span>Apply Simulated Shock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Network Graph */}
      <NetworkGraph showHeatmap={true} />

      {/* Simulated Recovery Options Button */}
      <div className="flex justify-end">
        <button
          onClick={onNavigateToRecovery}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xl transition"
        >
          <span>Examine Recovery Plans for this Simulation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

