import React, { useState } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { parseDisruptionPrompt } from '../../services/aiService';
import { AlertTriangle, Sparkles, X, ArrowRight, ShieldAlert } from 'lucide-react';

interface DisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const DisruptionModal: React.FC<DisruptionModalProps> = ({
  isOpen,
  onClose,
  onSubmitted
}) => {
  const { data, currentDate, reportDisruption } = useTwinData();

  const [naturalQuery, setNaturalQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(data.suppliers[0]?.supplier_id || 'SUP-01');
  const [startDate, setStartDate] = useState(currentDate);
  const [durationDays, setDurationDays] = useState(10);
  const [capacityLossPct, setCapacityLossPct] = useState(100);
  const [reason, setReason] = useState('Critical machinery breakdown at spinning ring frame section');

  if (!isOpen) return null;

  const handleParseNatural = () => {
    if (!naturalQuery.trim()) return;
    const parsed = parseDisruptionPrompt(naturalQuery, data, currentDate);
    if (parsed.supplier_id) setSelectedSupplier(parsed.supplier_id);
    if (parsed.start_date) setStartDate(parsed.start_date);
    if (parsed.duration_days) setDurationDays(parsed.duration_days);
    if (parsed.capacity_loss_pct) setCapacityLossPct(parsed.capacity_loss_pct);
    if (parsed.reason) setReason(parsed.reason);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportDisruption({
      supplier_id: selectedSupplier,
      start_date: startDate,
      duration_days: Number(durationDays),
      capacity_loss_pct: Number(capacityLossPct),
      reason
    });
    onClose();
    if (onSubmitted) onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Report Supply Disruption Event
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger autonomous dependency impact calculation across network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Natural Language Assistant Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Natural Language AI Disruption Parser:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Sri Kumaran spinning mill will be shut down for 10 days starting next Monday"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleParseNatural}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Structured Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Affected Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {data.suppliers.map(s => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_id} — {s.name} ({s.city}, {s.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Disruption Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Outage Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Capacity Loss Percentage</span>
              <span className="text-rose-500">{capacityLossPct}% Outage</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={capacityLossPct}
              onChange={(e) => setCapacityLossPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Disruption Cause / Operational Context
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
            >
              <span>Submit & Calculate Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

