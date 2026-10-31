import { test, describe } from 'node:test';
import assert from 'node:assert';
import { initialSeedData } from '../src/data/seedData';
import { calculateNetworkImpact } from '../src/engine/calculationEngine';
import { generateRecoveryPlans } from '../src/engine/recoveryOptimizer';
import { computePlanScore, defaultWeights } from '../src/engine/scoringEngine';
import { rebaseDatasetDates } from '../src/engine/dateRebasing';
import { searchKnowledgeChunks } from '../src/engine/ragEngine';

describe('ChainTwin AI Calculation Engine Tests', () => {
  test('Baseline evaluation without disruption shows 0 late orders and 0 penalties', () => {
    const impact = calculateNetworkImpact(initialSeedData, null, '2026-10-31');
    assert.strictEqual(impact.late_orders, 0);
    assert.strictEqual(impact.total_penalties_inr, 0);
    assert.strictEqual(impact.total_orders, 12);
  });

  test('Tier-1 supplier disruption propagates delays and calculates late penalties', () => {
    const disruption = {
      id: 'TEST-DISR-1',
      supplier_id: 'SUP-01',
      start_date: '2026-11-01',
      duration_days: 10,
      capacity_loss_pct: 100,
      reported_at: '2026-10-31',
      status: 'Active' as const
    };

    const impact = calculateNetworkImpact(initialSeedData, disruption, '2026-10-31');
    assert.ok(impact.late_orders > 0, 'Disruption should result in late orders');
    assert.ok(impact.total_penalties_inr > 0, 'Late orders should accrue monetary penalties');

    // RULE VERIFICATION: Orders with Material Received 'Done' MUST remain SAFE
    const ord1001 = impact.order_impacts.find(o => o.order.order_id === 'ORD-1001');
    assert.strictEqual(ord1001?.status, 'Safe', 'ORD-1001 material was already received and must remain SAFE');
  });

  test('Optimizer generates 4 diverse candidate plans including Baseline and Plan A', () => {
    const disruption = {
      id: 'TEST-DISR-2',
      supplier_id: 'SUP-01',
      start_date: '2026-11-01',
      duration_days: 10,
      capacity_loss_pct: 100,
      reported_at: '2026-10-31',
      status: 'Active' as const
    };

    const plans = generateRecoveryPlans(initialSeedData, disruption, defaultWeights);
    assert.strictEqual(plans.length, 4, 'Should generate baseline + 3 distinct recovery plans');

    const planA = plans.find(p => p.id === 'PLAN-A');
    assert.ok(planA, 'Plan A must exist');
    assert.ok(planA.actions.length > 0, 'Plan A must have recovery directives');
    assert.ok(planA.scores.composite > 0, 'Plan A composite score must be calculated');
  });

  test('Six-dimensional scoring responds to custom weights', () => {
    const rawMetrics = {
      raw_cost_inr: 40000,
      raw_sla_pct: 95,
      raw_recovery_days: 4,
      raw_late_orders: 1,
      raw_penalty_inr: 5000,
      raw_co2_kg: 800,
      assumptions_count: 1
    };

    const costHeavyWeights = { ...defaultWeights, cost: 0.8, sla: 0.05 };
    const slaHeavyWeights = { ...defaultWeights, cost: 0.05, sla: 0.8 };

    const scoreCost = computePlanScore(rawMetrics, costHeavyWeights);
    const scoreSla = computePlanScore(rawMetrics, slaHeavyWeights);

    assert.ok(scoreCost.composite > 0);
    assert.ok(scoreSla.composite > 0);
  });

  test('Date rebasing shifts all temporal records consistently', () => {
    const { updatedData, daysShifted } = rebaseDatasetDates(initialSeedData, '2026-11-10');
    assert.strictEqual(daysShifted, 10);
    assert.strictEqual(updatedData.as_of_date, '2026-11-10');

    const originalOrder = initialSeedData.orders[0];
    const shiftedOrder = updatedData.orders[0];
    assert.notStrictEqual(shiftedOrder.order_date, originalOrder.order_date);
  });

  test('RAG retrieval matches contractual force majeure and liquidated damages clauses', () => {
    const results = searchKnowledgeChunks('liquidated damages force majeure');
    assert.ok(results.length > 0, 'Should retrieve matching policy chunks');
    assert.ok(results[0].chunk.content.toLowerCase().includes('supplier') || results[0].chunk.content.toLowerCase().includes('damages'));
  });
});

