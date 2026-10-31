import {
  SupplyChainData,
  DisruptionReport,
  RecoveryPlan,
  PlanAction,
  NetworkImpactResult
} from '../types';
import { calculateNetworkImpact } from './calculationEngine';
import { computePlanScore, ScoreWeights, defaultWeights } from './scoringEngine';

export function generateRecoveryPlans(
  data: SupplyChainData,
  disruption: DisruptionReport,
  weights: ScoreWeights = defaultWeights
): RecoveryPlan[] {
  // If no disruption, return baseline
  const baselineImpact = calculateNetworkImpact(data, disruption);

  // 1. Plan Baseline: "Do Nothing"
  const baselineLateCount = baselineImpact.late_orders;
  const baselinePenalty = baselineImpact.total_penalties_inr;
  const baselineSlaPct = baselineImpact.total_orders > 0
    ? +(((baselineImpact.total_orders - baselineLateCount) / baselineImpact.total_orders) * 100).toFixed(1)
    : 100;

  const baselineScores = computePlanScore({
    raw_cost_inr: 0,
    raw_sla_pct: baselineSlaPct,
    raw_recovery_days: disruption.duration_days,
    raw_late_orders: baselineLateCount,
    raw_penalty_inr: baselinePenalty,
    raw_co2_kg: 850,
    assumptions_count: 0,
    high_priority_late_count: baselineImpact.order_impacts.filter(o => o.status === 'Will be late' && o.customer.priority === 'High').length
  }, weights);

  const baselinePlan: RecoveryPlan = {
    id: 'PLAN-BASELINE',
    name: 'Do Nothing Baseline',
    tag: 'Baseline',
    description: 'No corrective action taken. Production delays propagate downstream, incurring standard customer SLA penalties.',
    actions: [
      {
        id: 'ACT-BASE-01',
        category: 'Internal',
        description: 'Absorb supplier outage delay and wait for primary supplier restoration',
        cost_inr: 0,
        lead_time_days: disruption.duration_days,
        target_entity: disruption.supplier_id || 'SUP-01',
        data_status: 'Known',
        status: 'Proposed'
      }
    ],
    scores: baselineScores,
    net_benefit_inr: 0,
    protected_orders_count: 0,
    late_deliveries_avoided: 0,
    assumptions: ['Supplier outage ends exactly on day ' + disruption.duration_days],
    knowns: ['Existing inventory in FAC-1 and FAC-2', 'Contractual penalty rate of 2% per day for CUS-01 & CUS-04'],
    recommended: false,
    status: 'Proposed'
  };

  // Find backup suppliers for affected materials
  const backupSupplierMaterials = data.supplier_materials.filter(
    sm => sm.role === 'Backup' && sm.material_id === 'MAT-01'
  );
  const confirmedBackup = backupSupplierMaterials.find(sm => sm.quote_status === 'Confirmed quote') || backupSupplierMaterials[0];
  const confirmedSup = data.suppliers.find(s => s.supplier_id === (confirmedBackup?.supplier_id || 'SUP-06'));

  // 2. Plan A: Best Overall (Internal Overtime + Confirmed Backup Supplier Procurement)
  // Protects almost all orders, minimizes high-priority customer SLA breach
  const planACost = 48500; // procurement delta + overtime wages
  const planAPenalty = 0; // protects all orders on time!
  const planASlaPct = 100;
  const planARecoveryDays = 4;
  const planALateOrders = 0;
  const planAScores = computePlanScore({
    raw_cost_inr: planACost,
    raw_sla_pct: planASlaPct,
    raw_recovery_days: planARecoveryDays,
    raw_late_orders: planALateOrders,
    raw_penalty_inr: planAPenalty,
    raw_co2_kg: 920,
    assumptions_count: 1,
    high_priority_late_count: 0
  }, weights);

  const planA: RecoveryPlan = {
    id: 'PLAN-A',
    name: 'Plan A: Balanced Recovery (Optimal)',
    tag: 'Uses backup supplier',
    description: 'Procure emergency yarn from verified backup supplier SUP-06 (Erode) with weekend overtime at FAC-1. Completely prevents SLA breaches for all high-priority festive orders.',
    actions: [
      {
        id: 'ACT-A-01',
        category: 'Backup Supplier',
        description: `Issue emergency Purchase Order to ${confirmedSup?.name || 'Erode Cotton Yarns'} (SUP-06) for 5,000 kg Cotton Yarn at ₹278/kg (Lead time: 4 days).`,
        cost_inr: 35000,
        lead_time_days: 4,
        target_entity: 'SUP-06',
        data_status: confirmedBackup?.data_status || 'Known',
        status: 'Proposed'
      },
      {
        id: 'ACT-A-02',
        category: 'Internal',
        description: 'Activate 15% overtime shift at FAC-1 (Veerapandi) increasing daily capacity from 6,000 to 7,200 pcs/day for 5 days.',
        cost_inr: 13500,
        lead_time_days: 1,
        target_entity: 'FAC-1',
        data_status: 'Known',
        status: 'Proposed'
      },
      {
        id: 'ACT-A-03',
        category: 'Internal',
        description: 'Prioritize production run for high-priority customer CUS-01 (Madras Mart ORD-1001 & ORD-1007).',
        cost_inr: 0,
        lead_time_days: 0,
        target_entity: 'ORD-1001',
        data_status: 'Known',
        status: 'Proposed'
      }
    ],
    scores: planAScores,
    net_benefit_inr: Math.max(0, baselinePenalty - planACost),
    protected_orders_count: baselineLateCount,
    late_deliveries_avoided: baselineLateCount,
    assumptions: ['Backup supplier SUP-06 delivers within confirmed 4 days lead time', 'FAC-1 overtime operates at 95% efficiency'],
    knowns: ['SUP-06 confirmed quote dated 2026-10-20', 'FAC-1 max capacity is 7,500 pcs/day'],
    recommended: true,
    status: 'Proposed'
  };

  // 3. Plan B: Cost-Focused Alternative (Zero External Procurement, Factory Inventory Transfer + Overtime)
  // Low cost, but absorbs minor delay on 1 low-priority order
  const planBCost = 16200;
  const planBPenalty = 8500;
  const planBSlaPct = 91.7; // 11 of 12 orders on time
  const planBRecoveryDays = 6;
  const planBLateOrders = 1;
  const planBScores = computePlanScore({
    raw_cost_inr: planBCost,
    raw_sla_pct: planBSlaPct,
    raw_recovery_days: planBRecoveryDays,
    raw_late_orders: planBLateOrders,
    raw_penalty_inr: planBPenalty,
    raw_co2_kg: 680,
    assumptions_count: 2,
    high_priority_late_count: 0
  }, weights);

  const planB: RecoveryPlan = {
    id: 'PLAN-B',
    name: 'Plan B: Low-Cost Internal Reallocation',
    tag: 'Internal',
    description: 'Avoid external backup supplier costs. Transfer 2,200 kg buffer yarn from FAC-2 to FAC-1, shift non-critical batches, and utilize low-emission rail transit.',
    actions: [
      {
        id: 'ACT-B-01',
        category: 'Inventory Reallocation',
        description: 'Transfer 2,200 kg surplus Cotton Yarn from FAC-2 (Palladam) to FAC-1 (Veerapandi) via road shuttle (20 km).',
        cost_inr: 4200,
        lead_time_days: 1,
        target_entity: 'FAC-2 -> FAC-1',
        data_status: 'Known',
        status: 'Proposed'
      },
      {
        id: 'ACT-B-02',
        category: 'Internal',
        description: 'Reschedule ORD-1011 (Coimbatore Cotton Club, Low priority) delivery window by 3 days with customer agreement.',
        cost_inr: 0,
        lead_time_days: 3,
        target_entity: 'ORD-1011',
        data_status: 'Assumption',
        status: 'Proposed'
      },
      {
        id: 'ACT-B-03',
        category: 'Reroute',
        description: 'Switch outbound transit from FAC-1 to DC-CHN to Eco Rail route RT-19, reducing CO2 by 70%.',
        cost_inr: 12000,
        lead_time_days: 3,
        target_entity: 'RT-19',
        data_status: 'Assumption',
        status: 'Proposed'
      }
    ],
    scores: planBScores,
    net_benefit_inr: Math.max(0, baselinePenalty - (planBCost + planBPenalty)),
    protected_orders_count: baselineLateCount - 1,
    late_deliveries_avoided: baselineLateCount - 1,
    assumptions: ['CUS-05 accepts 3-day flexible reschedule without breach', 'Rail wagon available on route RT-19'],
    knowns: ['FAC-2 currently holds 5,100 kg inventory', 'Inter-unit distance is only 20 km'],
    recommended: false,
    status: 'Proposed'
  };

  // 4. Plan C: Speed / SLA Priority (Multi-Supplier Emergency Sourcing + Air/Express Freight)
  // Recovers the network in minimum days (2.5 days), protects 100% of orders, but carries higher premium
  const planCCost = 78000;
  const planCPenalty = 0;
  const planCSlaPct = 100;
  const planCRecoveryDays = 2.5;
  const planCLateOrders = 0;
  const planCScores = computePlanScore({
    raw_cost_inr: planCCost,
    raw_sla_pct: planCSlaPct,
    raw_recovery_days: planCRecoveryDays,
    raw_late_orders: planCLateOrders,
    raw_penalty_inr: planCPenalty,
    raw_co2_kg: 1100,
    assumptions_count: 2,
    high_priority_late_count: 0
  }, weights);

  const planC: RecoveryPlan = {
    id: 'PLAN-C',
    name: 'Plan C: Maximum Speed & Resilience',
    tag: 'Uses backup supplier',
    description: 'Split procurement across SUP-06 (Erode) and SUP-07 (Salem) with expedited same-day express trucking to achieve full material recovery in under 3 days.',
    actions: [
      {
        id: 'ACT-C-01',
        category: 'Backup Supplier',
        description: 'Dual emergency order: 3,500 kg from SUP-06 (Erode) and 2,500 kg from SUP-07 (Salem) with expedited pickup surcharge.',
        cost_inr: 58000,
        lead_time_days: 3,
        target_entity: 'SUP-06 & SUP-07',
        data_status: 'Assumption',
        status: 'Proposed'
      },
      {
        id: 'ACT-C-02',
        category: 'Internal',
        description: 'Deploy maximum overtime at both FAC-1 and FAC-2 (weekend double shift).',
        cost_inr: 20000,
        lead_time_days: 2,
        target_entity: 'FAC-1 & FAC-2',
        data_status: 'Known',
        status: 'Proposed'
      }
    ],
    scores: planCScores,
    net_benefit_inr: Math.max(0, baselinePenalty - planCCost),
    protected_orders_count: baselineLateCount,
    late_deliveries_avoided: baselineLateCount,
    assumptions: ['SUP-07 can deliver in 3 days on express freight (normally 5 days)', 'Weekend shifts meet 100% quality pass rate'],
    knowns: ['Combined weekly backup capacity is 14,000 kg', 'High priority order values exceed ₹3,500,000'],
    recommended: false,
    status: 'Proposed'
  };

  // Rank and return plans
  const candidates = [baselinePlan, planA, planB, planC];
  candidates.sort((a, b) => b.scores.composite - a.scores.composite);

  // Set top non-baseline candidate as recommended
  const topCandidate = candidates.find(c => c.tag !== 'Baseline') || planA;
  candidates.forEach(c => {
    c.recommended = c.id === topCandidate.id;
  });

  return candidates;
}

