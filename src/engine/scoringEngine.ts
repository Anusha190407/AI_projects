import { PlanScore, Setting } from '../types';

export interface ScoreWeights {
  cost: number;
  sla: number;
  recovery_time: number;
  customer_impact: number;
  operational_risk: number;
  sustainability: number;
}

export const defaultWeights: ScoreWeights = {
  cost: 0.25,
  sla: 0.25,
  recovery_time: 0.15,
  customer_impact: 0.15,
  operational_risk: 0.10,
  sustainability: 0.10,
};

export function extractWeightsFromSettings(settings: Setting[]): ScoreWeights {
  const getWeight = (key: string, def: number) => {
    const s = settings.find(item => item.key === key);
    return s ? parseFloat(s.value) || def : def;
  };

  return {
    cost: getWeight('weight_cost', defaultWeights.cost),
    sla: getWeight('weight_sla', defaultWeights.sla),
    recovery_time: getWeight('weight_recovery_time', defaultWeights.recovery_time),
    customer_impact: getWeight('weight_customer_impact', defaultWeights.customer_impact),
    operational_risk: getWeight('weight_risk', defaultWeights.operational_risk),
    sustainability: getWeight('weight_sustainability', defaultWeights.sustainability),
  };
}

export function computePlanScore(
  raw: {
    raw_cost_inr: number;
    raw_sla_pct: number;
    raw_recovery_days: number;
    raw_late_orders: number;
    raw_penalty_inr: number;
    raw_co2_kg: number;
    assumptions_count?: number;
    high_priority_late_count?: number;
  },
  weights: ScoreWeights = defaultWeights
): PlanScore {
  // 1. Cost Score (0 - 100): baseline budget benchmark = 600,000 INR
  const totalCost = raw.raw_cost_inr + raw.raw_penalty_inr;
  const costScore = Math.max(0, Math.min(100, Math.round(100 - (totalCost / 600000) * 80)));

  // 2. SLA Score (0 - 100): directly corresponds to on-time %
  const slaScore = Math.max(0, Math.min(100, Math.round(raw.raw_sla_pct)));

  // 3. Recovery Time Score (0 - 100): 0 days = 100, 14+ days = ~20
  const recoveryScore = Math.max(0, Math.min(100, Math.round(100 - (raw.raw_recovery_days * 5.5))));

  // 4. Customer Impact Score (0 - 100): penalized heavily if high priority orders are late
  const hpPenalty = (raw.high_priority_late_count || 0) * 25;
  const standardPenalty = raw.raw_late_orders * 10;
  const customerImpactScore = Math.max(0, Math.min(100, Math.round(100 - hpPenalty - standardPenalty)));

  // 5. Operational Risk Score (0 - 100): unconfirmed assumptions and single sourcing penalize risk
  const assumptionDeduction = (raw.assumptions_count || 0) * 8;
  const operationalRiskScore = Math.max(10, Math.min(100, Math.round(95 - assumptionDeduction)));

  // 6. Sustainability Score (0 - 100): CO2 benchmark 1500 kg
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - (raw.raw_co2_kg / 2000) * 50)));

  // Weighted composite score
  const totalWeight = weights.cost + weights.sla + weights.recovery_time +
    weights.customer_impact + weights.operational_risk + weights.sustainability;

  const composite = Math.round(
    ((costScore * weights.cost) +
      (slaScore * weights.sla) +
      (recoveryScore * weights.recovery_time) +
      (customerImpactScore * weights.customer_impact) +
      (operationalRiskScore * weights.operational_risk) +
      (sustainabilityScore * weights.sustainability)) / (totalWeight || 1)
  );

  return {
    cost: costScore,
    sla: slaScore,
    recovery_time: recoveryScore,
    customer_impact: customerImpactScore,
    operational_risk: operationalRiskScore,
    sustainability: sustainabilityScore,
    composite,
    raw_cost_inr: raw.raw_cost_inr,
    raw_sla_pct: raw.raw_sla_pct,
    raw_recovery_days: raw.raw_recovery_days,
    raw_late_orders: raw.raw_late_orders,
    raw_penalty_inr: raw.raw_penalty_inr,
    raw_co2_kg: raw.raw_co2_kg,
  };
}

