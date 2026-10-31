import {
  SupplyChainData,
  DisruptionReport,
  NetworkImpactResult,
  OrderImpactSummary,
  Order,
  OrderStage,
  Customer,
  Supplier,
  Material
} from '../types';

// Helper to add days to a 'YYYY-MM-DD' date string
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().split('T')[0];
}

// Helper to compute difference in days between two 'YYYY-MM-DD' dates (d2 - d1)
export function daysDiff(d1Str: string, d2Str: string): number {
  const d1 = new Date(d1Str);
  const d2 = new Date(d2Str);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateNetworkImpact(
  data: SupplyChainData,
  disruption: DisruptionReport | null,
  nowDate: string = data.as_of_date
): NetworkImpactResult {
  // If no disruption is active, baseline evaluation
  const activeDisruption: DisruptionReport = disruption || {
    id: 'NONE',
    supplier_id: '',
    start_date: nowDate,
    duration_days: 0,
    capacity_loss_pct: 0,
    reported_at: nowDate,
    status: 'Mitigated'
  };

  // Step 1: Identify affected supplier and materials
  const affectedSuppliers: Supplier[] = [];
  const affectedMaterials: Material[] = [];

  if (activeDisruption.supplier_id) {
    const sup = data.suppliers.find(s => s.supplier_id === activeDisruption.supplier_id);
    if (sup) affectedSuppliers.push(sup);

    const supMaterials = data.supplier_materials.filter(
      sm => sm.supplier_id === activeDisruption.supplier_id
    );
    for (const sm of supMaterials) {
      const mat = data.materials.find(m => m.material_id === sm.material_id);
      if (mat && !affectedMaterials.some(m => m.material_id === mat.material_id)) {
        affectedMaterials.push(mat);
      }
    }
  }

  // Step 2: Identify delayed inbound POs
  const delayedPOs = data.inbound_pos.map(po => {
    if (
      activeDisruption.supplier_id &&
      po.supplier_id === activeDisruption.supplier_id &&
      po.status !== 'Received'
    ) {
      const revArrival = addDays(po.expected_arrival, activeDisruption.duration_days);
      return {
        ...po,
        expected_arrival: revArrival,
        status: (activeDisruption.duration_days > 0 ? 'Delayed' : po.status) as any
      };
    }
    return po;
  });

  // Step 3: Project inventory & stockout dates for affected factories
  const factoryStockouts: NetworkImpactResult['factory_stockouts'] = [];

  const factories = data.locations.filter(l => l.type === 'Factory');
  for (const fac of factories) {
    for (const mat of affectedMaterials) {
      const invRecord = data.inventory.find(
        i => i.location_id === fac.location_id && i.item_id === mat.material_id
      );
      const openingStock = invRecord ? invRecord.quantity : 0;

      // Calculate daily consumption from production rates and BOM
      let dailyConsumption = 0;
      const rates = data.production_rates.filter(pr => pr.factory_id === fac.location_id);
      for (const rate of rates) {
        const bomItem = data.bom.find(
          b => b.product_id === rate.product_id && b.material_id === mat.material_id
        );
        if (bomItem) {
          dailyConsumption += rate.daily_qty * bomItem.qty_per_piece;
        }
      }

      const daysOfCover = dailyConsumption > 0 ? +(openingStock / dailyConsumption).toFixed(1) : 999;
      const stockoutDate = dailyConsumption > 0 ? addDays(nowDate, Math.floor(daysOfCover)) : '2099-12-31';

      factoryStockouts.push({
        factory_id: fac.location_id,
        material_id: mat.material_id,
        stockout_date: stockoutDate,
        days_of_cover: daysOfCover,
        current_stock: openingStock,
        daily_consumption: +dailyConsumption.toFixed(2)
      });
    }
  }

  // Step 5: Evaluate each order
  let totalPenalties = 0;
  let productionShortfall = 0;
  const orderImpacts: OrderImpactSummary[] = [];

  for (const ord of data.orders) {
    const customer = data.customers.find(c => c.customer_id === ord.customer_id) || {
      customer_id: ord.customer_id,
      name: 'Standard Customer',
      city: 'Unknown',
      priority: 'Medium',
      late_penalty_pct_per_day: 1.0,
      note: ''
    };

    const stages = data.order_stages.filter(s => s.order_id === ord.order_id).sort((a, b) => a.stage_no - b.stage_no);
    const stage2 = stages.find(s => s.stage_no === 2); // Material received
    const currentActiveStage = stages.find(s => s.status_as_of_file === 'In progress') ||
      stages.find(s => s.status_as_of_file === 'Waiting') ||
      stages[stages.length - 1];

    // Check if order uses affected material
    const orderBom = data.bom.filter(b => b.product_id === ord.product_id);
    const usesAffectedMaterial = orderBom.some(b =>
      affectedMaterials.some(m => m.material_id === b.material_id)
    );

    // Dependency Path: Supplier -> Material -> Factory -> DC -> Store -> Customer
    const primarySupplier = affectedSuppliers[0]?.name || 'Sri Kumaran Spinning Mills';
    const primaryMaterial = orderBom[0]?.material_id || 'MAT-01';
    const matName = data.materials.find(m => m.material_id === primaryMaterial)?.name || primaryMaterial;
    const facName = data.locations.find(l => l.location_id === ord.factory_id)?.name || ord.factory_id;
    const dcName = data.locations.find(l => l.location_id === ord.dc_id)?.name || ord.dc_id;
    const storeName = data.locations.find(l => l.location_id === ord.store_id)?.name || ord.store_id;

    const dependencyPath = [
      primarySupplier,
      matName,
      facName,
      dcName,
      storeName,
      customer.name
    ];

    let status: OrderImpactSummary['status'] = 'Done';
    let delayDays = 0;
    let expectedDelivery = ord.promised_date;

    const isAllDone = stages.every(s => s.status_as_of_file === 'Done');
    const isMaterialReceived = stage2 && stage2.status_as_of_file === 'Done';

    if (isAllDone) {
      status = 'Done';
      expectedDelivery = ord.promised_date;
      delayDays = 0;
    } else if (isMaterialReceived) {
      // RULE: Orders whose Material Received stage is already completed must remain SAFE
      status = 'Safe';
      expectedDelivery = ord.promised_date;
      delayDays = 0;
    } else if (!usesAffectedMaterial || activeDisruption.duration_days === 0) {
      // Unaffected by disruption
      status = currentActiveStage.status_as_of_file === 'In progress' ? 'In progress' : 'Waiting';
      expectedDelivery = ord.promised_date;
      delayDays = 0;
    } else {
      // Disrupted: calculate delay based on stockout and supplier outage
      const stockoutInfo = factoryStockouts.find(
        f => f.factory_id === ord.factory_id && orderBom.some(b => b.material_id === f.material_id)
      );

      // Revised delay is the outage duration minus whatever buffer remains
      const bufferDays = stockoutInfo ? Math.max(0, stockoutInfo.days_of_cover) : 0;
      delayDays = Math.max(0, Math.ceil(activeDisruption.duration_days - bufferDays));

      expectedDelivery = addDays(ord.promised_date, delayDays);

      if (delayDays > 0) {
        status = 'Will be late';
        productionShortfall += ord.quantity;
      } else {
        status = 'At risk';
      }
    }

    const orderValue = ord.quantity * ord.unit_price_inr;
    const penaltyRate = customer.late_penalty_pct_per_day / 100;
    const latePenalty = delayDays > 0 ? orderValue * penaltyRate * delayDays : 0;

    totalPenalties += latePenalty;

    orderImpacts.push({
      order: ord,
      customer,
      current_stage: currentActiveStage,
      expected_delivery: expectedDelivery,
      delay_days: delayDays,
      status,
      order_value_inr: orderValue,
      late_penalty_inr: Math.round(latePenalty),
      dependency_path: dependencyPath,
      bottleneck_stage: delayDays > 0 ? 'Production' : undefined
    });
  }

  const safeOrders = orderImpacts.filter(o => o.status === 'Safe' || o.status === 'Done' || o.status === 'In progress').length;
  const atRiskOrders = orderImpacts.filter(o => o.status === 'At risk').length;
  const lateOrders = orderImpacts.filter(o => o.status === 'Will be late').length;
  const totalValueInFlight = orderImpacts.reduce((acc, o) => acc + o.order_value_inr, 0);

  return {
    disruption: activeDisruption,
    affected_suppliers: affectedSuppliers,
    affected_materials: affectedMaterials,
    delayed_pos: delayedPOs,
    factory_stockouts: factoryStockouts,
    order_impacts: orderImpacts,
    total_orders: data.orders.length,
    safe_orders: safeOrders,
    at_risk_orders: atRiskOrders,
    late_orders: lateOrders,
    total_value_in_flight: totalValueInFlight,
    total_penalties_inr: Math.round(totalPenalties),
    production_shortfall_pcs: productionShortfall,
    evaluated_at: nowDate
  };
}

