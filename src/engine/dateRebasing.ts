import { SupplyChainData } from '../types';
import { addDays, daysDiff } from './calculationEngine';

export function rebaseDatasetDates(
  data: SupplyChainData,
  targetDate: string, // 'YYYY-MM-DD'
  userEmail: string = 'manager@chaintwin.ai'
): { updatedData: SupplyChainData; daysShifted: number } {
  const currentRef = data.as_of_date;
  const daysShifted = daysDiff(currentRef, targetDate);

  if (daysShifted === 0) {
    return { updatedData: data, daysShifted: 0 };
  }

  const shift = (d?: string) => (d ? addDays(d, daysShifted) : d);

  const updatedOrders = data.orders.map(o => ({
    ...o,
    order_date: shift(o.order_date)!,
    promised_date: shift(o.promised_date)!
  }));

  const updatedStages = data.order_stages.map(s => ({
    ...s,
    planned_start: shift(s.planned_start)!,
    planned_end: shift(s.planned_end)!,
    actual_end: s.actual_end ? shift(s.actual_end) : undefined
  }));

  const updatedPOs = data.inbound_pos.map(po => ({
    ...po,
    po_date: shift(po.po_date)!,
    expected_arrival: shift(po.expected_arrival)!
  }));

  const updatedInventory = data.inventory.map(inv => ({
    ...inv,
    as_of_date: shift(inv.as_of_date)!
  }));

  const updatedProdRates = data.production_rates.map(pr => ({
    ...pr,
    from_date: shift(pr.from_date)!,
    to_date: shift(pr.to_date)!
  }));

  const updatedSupplierMaterials = data.supplier_materials.map(sm => ({
    ...sm,
    quote_date: sm.quote_date ? shift(sm.quote_date) : undefined
  }));

  const updatedSettings = data.settings.map(st => {
    if (st.key === 'as_of_date') {
      return { ...st, value: targetDate };
    }
    return st;
  });

  const auditEntry = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user_email: userEmail,
    action_type: 'DATE_REBASED' as const,
    details: `Rebased reference date from ${currentRef} to ${targetDate} (shifted all temporal records by ${daysShifted > 0 ? '+' : ''}${daysShifted} days).`
  };

  const updatedData: SupplyChainData = {
    ...data,
    as_of_date: targetDate,
    orders: updatedOrders,
    order_stages: updatedStages,
    inbound_pos: updatedPOs,
    inventory: updatedInventory,
    production_rates: updatedProdRates,
    supplier_materials: updatedSupplierMaterials,
    settings: updatedSettings,
    audit_history: [auditEntry, ...data.audit_history]
  };

  return { updatedData, daysShifted };
}

