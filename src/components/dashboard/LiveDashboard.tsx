import React, { useState } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { NetworkGraph } from '../network/NetworkGraph';
import { DisruptionModal } from './DisruptionModal';
import { Order } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Flame,
  ChevronRight,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const LiveDashboard: React.FC<{ onNavigateToRecovery: () => void }> = ({
  onNavigateToRecovery
}) => {
  const {
    data,
    activeDisruption,
    impactResult,
    resolveDisruption,
    mode
  } = useTwinData();

  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const kpis = [
    {
      label: 'Total Orders in Flight',
      value: impactResult.total_orders,
      sub: `₹${(impactResult.total_value_in_flight / 100000).toFixed(1)}L Active Value`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: 'Orders On Track',
      value: impactResult.safe_orders,
      sub: `${Math.round((impactResult.safe_orders / (impactResult.total_orders || 1)) * 100)}% On-Time SLA`,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      label: 'Orders At Risk',
      value: impactResult.at_risk_orders,
      sub: 'Tight Inventory Buffers',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      label: 'Delayed / Late Orders',
      value: impactResult.late_orders,
      sub: `₹${impactResult.total_penalties_inr.toLocaleString()} Est. Penalties`,
      icon: AlertTriangle,
      color: impactResult.late_orders > 0 ? 'text-rose-500 font-bold' : 'text-slate-400',
      bg: impactResult.late_orders > 0 ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-slate-50 dark:bg-slate-800'
    },
    {
      label: 'Open Disruptions',
      value: activeDisruption ? 1 : 0,
      sub: activeDisruption ? `${activeDisruption.supplier_id} (${activeDisruption.duration_days}d)` : 'Nominal Operations',
      icon: ShieldAlert,
      color: activeDisruption ? 'text-rose-500' : 'text-emerald-500',
      bg: activeDisruption ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real-Time Network Observability
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Tiruppur Apparel Digital Twin Network
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showHeatmap
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/40'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Risk Heatmap</span>
          </button>

          {activeDisruption ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToRecovery}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition animate-pulse"
              >
                <span>View Recovery Strategies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => resolveDisruption(activeDisruption.id)}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-xs font-semibold transition"
              >
                Clear Disruption
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDisruptionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition hover:scale-102"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Disruption Event</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {kpi.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disruption Alert Notice (if active) */}
      {activeDisruption && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Active Tier-1 Outage Detected
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {activeDisruption.supplier_id} (Sri Kumaran Mills) — {activeDisruption.duration_days} Days Outage starting {activeDisruption.start_date}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Affects Cotton Yarn (MAT-01). Unit 1 stocks out in {impactResult.factory_stockouts[0]?.days_of_cover || 2.4} days. {impactResult.late_orders} orders facing SLA breach.
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToRecovery}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
          >
            <span>Launch Recovery Optimizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Topology Graph */}
      <NetworkGraph
        highlightOrder={selectedOrder}
        showHeatmap={showHeatmap}
        onSelectNode={(node) => {}}
      />

      {/* Order Tracking Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              End-to-End Order Progress & Delivery Commitments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click an order to trace its physical route across factories, DCs, and retail stores
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {impactResult.order_impacts.length} orders tracked
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-6">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product & Qty</th>
                <th className="p-3.5">Production Flow (6-Stage)</th>
                <th className="p-3.5">Promised Date</th>
                <th className="p-3.5">Expected Delivery</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6">Value / Penalties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {impactResult.order_impacts.map(item => {
                const isSelected = selectedOrder?.order_id === item.order.order_id;
                const stages = data.order_stages.filter(s => s.order_id === item.order.order_id).sort((a, b) => a.stage_no - b.stage_no);

                return (
                  <tr
                    key={item.order.order_id}
                    onClick={() => setSelectedOrder(isSelected ? null : item.order)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3.5 pl-6 font-bold text-blue-600 dark:text-blue-400">
                      {item.order.order_id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.customer.name}</div>
                      <div className="text-[10px] text-slate-400">{item.customer.city} &bull; Priority: {item.customer.priority}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{item.order.quantity.toLocaleString()} pcs</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.order.product_id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        {stages.map(stg => (
                          <div
                            key={stg.stage_no}
                            title={`${stg.stage_name}: ${stg.status_as_of_file}`}
                            className={`w-4 h-2 rounded-sm ${
                              stg.status_as_of_file === 'Done'
                                ? 'bg-emerald-500'
                                : stg.status_as_of_file === 'In progress'
                                ? 'bg-blue-500 animate-pulse'
                                : item.status === 'Will be late' && stg.stage_no >= 3
                                ? 'bg-rose-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                          {item.current_stage.stage_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {item.order.promised_date}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className={item.delay_days > 0 ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                        {item.expected_delivery}
                        {item.delay_days > 0 && ` (+${item.delay_days}d)`}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Done'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'Safe'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'In progress'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : item.status === 'Will be late'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-6">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{item.order_value_inr.toLocaleString()}
                      </div>
                      {item.late_penalty_inr > 0 ? (
                        <div className="text-[10px] text-rose-500 font-bold">
                          -₹{item.late_penalty_inr.toLocaleString()} penalty
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-500">
                          SLA protected
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disruption Modal */}
      <DisruptionModal
        isOpen={isDisruptionModalOpen}
        onClose={() => setIsDisruptionModalOpen(false)}
        onSubmitted={() => onNavigateToRecovery()}
      />
    </div>
  );
};

