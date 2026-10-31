import React, { useState, useMemo } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { Location, Supplier, Material, Customer, Order } from '../../types';
import { KnownAssumptionBadge } from '../common/KnownAssumptionBadge';
import { 
  Building2, 
  Factory, 
  Warehouse, 
  Store, 
  Users, 
  Layers, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Flame,
  ArrowRight
} from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  type: 'Supplier' | 'Material' | 'Factory' | 'DC' | 'Store' | 'Customer';
  column: number;
  row: number;
  status: 'healthy' | 'at_risk' | 'disrupted' | 'recovered';
  details: any;
  inventory?: number;
  coverDays?: number;
  orderCount: number;
}

interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  status: 'normal' | 'disrupted' | 'recovery';
  label?: string;
}

export const NetworkGraph: React.FC<{
  highlightOrder?: Order | null;
  onSelectNode?: (node: NetworkNode) => void;
  showHeatmap?: boolean;
}> = ({ highlightOrder, onSelectNode, showHeatmap = false }) => {
  const { data, activeDisruption, impactResult, previewedPlan } = useTwinData();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Build network nodes
  const nodes = useMemo(() => {
    const list: NetworkNode[] = [];

    // Col 0: Primary Suppliers + Backups
    const primarySuppliers = data.suppliers.filter(s => s.type === 'Primary').slice(0, 4);
    primarySuppliers.forEach((sup, idx) => {
      const isDisrupted = activeDisruption?.supplier_id === sup.supplier_id;
      list.push({
        id: sup.supplier_id,
        name: sup.name,
        type: 'Supplier',
        column: 0,
        row: idx,
        status: isDisrupted ? 'disrupted' : 'healthy',
        details: sup,
        orderCount: data.inbound_pos.filter(p => p.supplier_id === sup.supplier_id).length
      });
    });

    // Col 1: Materials
    const keyMaterials = data.materials.slice(0, 4);
    keyMaterials.forEach((mat, idx) => {
      const isAffected = impactResult.affected_materials.some(m => m.material_id === mat.material_id);
      list.push({
        id: mat.material_id,
        name: mat.name,
        type: 'Material',
        column: 1,
        row: idx,
        status: isAffected ? 'at_risk' : 'healthy',
        details: mat,
        orderCount: data.bom.filter(b => b.material_id === mat.material_id).length
      });
    });

    // Col 2: Factories
    const factories = data.locations.filter(l => l.type === 'Factory');
    factories.forEach((fac, idx) => {
      const stockout = impactResult.factory_stockouts.find(f => f.factory_id === fac.location_id);
      const isDisrupted = stockout && stockout.days_of_cover < 3;
      list.push({
        id: fac.location_id,
        name: fac.name,
        type: 'Factory',
        column: 2,
        row: idx * 1.5,
        status: isDisrupted ? 'at_risk' : 'healthy',
        details: fac,
        coverDays: stockout?.days_of_cover || 14,
        orderCount: data.orders.filter(o => o.factory_id === fac.location_id).length
      });
    });

    // Col 3: Distribution Centres
    const dcs = data.locations.filter(l => l.type === 'Distribution Centre');
    dcs.forEach((dc, idx) => {
      list.push({
        id: dc.location_id,
        name: dc.name,
        type: 'DC',
        column: 3,
        row: idx,
        status: 'healthy',
        details: dc,
        orderCount: data.orders.filter(o => o.dc_id === dc.location_id).length
      });
    });

    // Col 4: Stores
    const stores = data.locations.filter(l => l.type === 'Store').slice(0, 4);
    stores.forEach((st, idx) => {
      list.push({
        id: st.location_id,
        name: st.name,
        type: 'Store',
        column: 4,
        row: idx,
        status: 'healthy',
        details: st,
        orderCount: data.orders.filter(o => o.store_id === st.location_id).length
      });
    });

    // Col 5: Customers
    const customers = data.customers.slice(0, 4);
    customers.forEach((cus, idx) => {
      const lateOrder = impactResult.order_impacts.some(
        o => o.customer.customer_id === cus.customer_id && o.status === 'Will be late'
      );
      list.push({
        id: cus.customer_id,
        name: cus.name,
        type: 'Customer',
        column: 5,
        row: idx,
        status: lateOrder ? 'at_risk' : 'healthy',
        details: cus,
        orderCount: data.orders.filter(o => o.customer_id === cus.customer_id).length
      });
    });

    return list;
  }, [data, activeDisruption, impactResult]);

  // Edges between columns
  const edges = useMemo(() => {
    const edgeList: NetworkEdge[] = [];

    // Supplier -> Material
    data.supplier_materials.slice(0, 5).forEach(sm => {
      const isDisrupted = activeDisruption?.supplier_id === sm.supplier_id;
      edgeList.push({
        id: `e-${sm.supplier_id}-${sm.material_id}`,
        from: sm.supplier_id,
        to: sm.material_id,
        status: isDisrupted ? 'disrupted' : 'normal',
        label: `${sm.lead_time_days}d`
      });
    });

    // Material -> Factory
    data.bom.slice(0, 6).forEach(b => {
      edgeList.push({
        id: `e-${b.material_id}-FAC-1`,
        from: b.material_id,
        to: 'FAC-1',
        status: 'normal'
      });
      edgeList.push({
        id: `e-${b.material_id}-FAC-2`,
        from: b.material_id,
        to: 'FAC-2',
        status: 'normal'
      });
    });

    // Factory -> DC
    data.routes.filter(r => r.from_id.startsWith('FAC') && r.to_id.startsWith('DC') && r.status === 'Active').forEach(r => {
      edgeList.push({
        id: `e-${r.from_id}-${r.to_id}`,
        from: r.from_id,
        to: r.to_id,
        status: 'normal',
        label: `${r.transit_days}d (${r.mode})`
      });
    });

    // DC -> Store
    data.routes.filter(r => r.from_id.startsWith('DC') && r.to_id.startsWith('ST')).slice(0, 6).forEach(r => {
      edgeList.push({
        id: `e-${r.from_id}-${r.to_id}`,
        from: r.from_id,
        to: r.to_id,
        status: 'normal',
        label: `${r.transit_days}d`
      });
    });

    // Store -> Customer
    data.locations.filter(l => l.type === 'Store' && l.customer_id).slice(0, 4).forEach(st => {
      edgeList.push({
        id: `e-${st.location_id}-${st.customer_id}`,
        from: st.location_id,
        to: st.customer_id!,
        status: 'normal'
      });
    });

    // If previewing a plan with recovery routes (e.g. dashed teal)
    if (previewedPlan) {
      previewedPlan.actions.forEach(act => {
        if (act.category === 'Reroute') {
          edgeList.push({
            id: `e-recovery-${act.id}`,
            from: 'FAC-1',
            to: 'DC-CHN',
            status: 'recovery',
            label: 'Eco Rail (Recovery)'
          });
        }
      });
    }

    return edgeList;
  }, [data, activeDisruption, previewedPlan]);

  // Dimensions
  const colWidth = 190;
  const rowHeight = 90;
  const startX = 60;
  const startY = 60;

  const getNodePos = (node: NetworkNode) => ({
    x: startX + node.column * colWidth,
    y: startY + node.row * rowHeight
  });

  const columns = ['Supplier', 'Material', 'Factory', 'Distribution Centre', 'Store', 'Customer'];

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      {/* Network Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Supply Chain Digital Twin Topology
            {showHeatmap && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Flame className="w-3.5 h-3.5" /> Risk Heatmap Active
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            End-to-end synchronized nodes from Raw Sourcing to Retail Consumers
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Healthy
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Stockout Risk
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Disrupted
          </span>
          {previewedPlan && (
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-teal-500"></span> Recovery Route
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-x-auto p-4 select-none">
        <svg width={1180} height={420} className="w-full">
          {/* Column Category Labels */}
          {columns.map((col, idx) => (
            <g key={col} transform={`translate(${startX + idx * colWidth + 10}, 24)`}>
              <text
                className="text-[11px] font-bold fill-slate-400 dark:fill-slate-500 uppercase tracking-wider"
                textAnchor="middle"
              >
                {col}
              </text>
            </g>
          ))}

          {/* Edges */}
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const p1 = getNodePos(fromNode);
            const p2 = getNodePos(toNode);

            const isRecovery = edge.status === 'recovery';
            const isDisrupted = edge.status === 'disrupted';

            const strokeColor = isRecovery
              ? '#0d9488'
              : isDisrupted
              ? '#ef4444'
              : '#94a3b8';

            return (
              <g key={edge.id}>
                <line
                  x1={p1.x + 40}
                  y1={p1.y + 15}
                  x2={p2.x - 10}
                  y2={p2.y + 15}
                  stroke={strokeColor}
                  strokeWidth={isRecovery ? 2.5 : 1.5}
                  strokeDasharray={isRecovery ? '5,5' : undefined}
                  className="transition-all duration-300"
                />
                {edge.label && (
                  <text
                    x={(p1.x + p2.x) / 2 + 15}
                    y={(p1.y + p2.y) / 2 + 10}
                    className="text-[9px] fill-slate-400 dark:fill-slate-500"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = getNodePos(node);
            const isSelected = selectedNode?.id === node.id;
            const isDisrupted = node.status === 'disrupted';
            const isAtRisk = node.status === 'at_risk';

            let bgColor = 'bg-slate-50 dark:bg-slate-800';
            let borderColor = 'border-slate-200 dark:border-slate-700';
            let textColor = 'text-slate-800 dark:text-slate-100';

            if (showHeatmap && node.type === 'Factory' && (node.coverDays || 0) < 3) {
              bgColor = 'bg-rose-50 dark:bg-rose-950/60';
              borderColor = 'border-rose-500 ring-2 ring-rose-500/30';
            } else if (isDisrupted) {
              bgColor = 'bg-rose-50 dark:bg-rose-950/60';
              borderColor = 'border-rose-500';
              textColor = 'text-rose-600 dark:text-rose-300';
            } else if (isAtRisk) {
              bgColor = 'bg-amber-50 dark:bg-amber-950/60';
              borderColor = 'border-amber-500';
              textColor = 'text-amber-600 dark:text-amber-300';
            }

            return (
              <foreignObject
                key={node.id}
                x={pos.x - 45}
                y={pos.y - 12}
                width={150}
                height={68}
                className="overflow-visible"
              >
                <div
                  onClick={() => handleNodeClick(node)}
                  className={`cursor-pointer transition-all duration-200 p-2.5 rounded-xl border shadow-sm flex flex-col justify-between ${bgColor} ${borderColor} ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md scale-105' : 'hover:border-blue-400 hover:shadow'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {node.id}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDisrupted ? 'bg-rose-500 animate-ping' : isAtRisk ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className={`text-xs font-semibold truncate ${textColor}`} title={node.name}>
                    {node.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    {node.coverDays !== undefined ? (
                      <span className={node.coverDays < 3 ? 'text-rose-500 font-bold' : ''}>
                        {node.coverDays}d cover
                      </span>
                    ) : (
                      <span>{node.type}</span>
                    )}
                    <span>{node.orderCount} orders</span>
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      {/* Node Inspection Drawer */}
      {selectedNode && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between transition-all animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {selectedNode.type === 'Supplier' ? <Building2 className="w-5 h-5" /> :
               selectedNode.type === 'Factory' ? <Factory className="w-5 h-5" /> :
               selectedNode.type === 'DC' ? <Warehouse className="w-5 h-5" /> :
               selectedNode.type === 'Store' ? <Store className="w-5 h-5" /> :
               selectedNode.type === 'Customer' ? <Users className="w-5 h-5" /> :
               <Layers className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedNode.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {selectedNode.id}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  selectedNode.status === 'disrupted' ? 'bg-rose-500/20 text-rose-500' :
                  selectedNode.status === 'at_risk' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedNode.type} Entity &bull; {selectedNode.orderCount} linked active production dependencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

