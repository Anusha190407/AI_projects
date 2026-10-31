export type DataStatus = 'Known' | 'Assumption';

export interface Setting {
  key: string;
  value: string;
  description: string;
  data_status: DataStatus;
}

export interface Supplier {
  supplier_id: string;
  name: string;
  city: string;
  state: string;
  type: 'Primary' | 'Backup';
  contact_person: string;
  contact_email: string;
  reliability_pct: number;
  reliability_basis: string;
  distance_to_tiruppur_km: number;
}

export interface Material {
  material_id: string;
  name: string;
  unit: string;
  category: string;
  note: string;
}

export interface SupplierMaterial {
  supplier_id: string;
  material_id: string;
  role: 'Primary' | 'Backup';
  unit_price: number;
  price_unit: string;
  lead_time_days: number;
  weekly_capacity: number;
  capacity_unit: string;
  quote_status: 'Contract' | 'Confirmed quote' | 'Unconfirmed estimate' | 'Not contacted' | 'Requested';
  quote_date?: string;
  data_status: DataStatus;
}

export interface Product {
  product_id: string;
  name: string;
  packed_weight_kg: number;
  selling_price_inr: number;
}

export interface BOMItem {
  product_id: string;
  material_id: string;
  qty_per_piece: number;
}

export interface Location {
  location_id: string;
  name: string;
  type: 'Factory' | 'Distribution Centre' | 'Store';
  city: string;
  state: string;
  normal_capacity_pcs_per_day?: number;
  max_capacity_pcs_per_day?: number;
  customer_id?: string;
}

export interface ProductionRate {
  factory_id: string;
  product_id: string;
  daily_qty: number;
  from_date: string;
  to_date: string;
}

export interface InventoryItem {
  location_id: string;
  item_type: 'Material' | 'Product';
  item_id: string;
  quantity: number;
  unit: string;
  daily_outflow?: number;
  as_of_date: string;
}

export interface Customer {
  customer_id: string;
  name: string;
  city: string;
  priority: 'High' | 'Medium' | 'Low';
  late_penalty_pct_per_day: number;
  note: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  store_id: string;
  dc_id: string;
  factory_id: string;
  product_id: string;
  quantity: number;
  unit_price_inr: number;
  order_date: string;
  promised_date: string;
}

export type StageName =
  | 'Supplier dispatch'
  | 'Material received'
  | 'Production'
  | 'At distribution centre'
  | 'At store'
  | 'Delivered to customer';

export interface OrderStage {
  order_id: string;
  stage_no: number;
  stage_name: StageName;
  planned_start: string;
  planned_end: string;
  actual_end?: string;
  status_as_of_file: 'Done' | 'In progress' | 'Waiting' | 'At risk' | 'Will be late' | 'Rerouted';
}

export interface InboundPO {
  po_id: string;
  supplier_id: string;
  material_id: string;
  quantity: number;
  unit: string;
  to_factory: string;
  po_date: string;
  expected_arrival: string;
  status: 'Received' | 'In transit' | 'Ordered' | 'Planned' | 'Delayed' | 'Cancelled';
  linked_order: string;
  data_status: DataStatus;
}

export interface Route {
  route_id: string;
  from_id: string;
  to_id: string;
  mode: 'Road' | 'Rail';
  distance_km: number;
  transit_days: number;
  cost_per_tonne_inr: number;
  co2_kg_per_tonne: number;
  status: 'Active' | 'Alternative' | 'Disrupted' | 'Selected';
  data_status: DataStatus;
}

export interface Substitute {
  original_material: string;
  substitute_material: string;
  allowed_products: string;
  quality_note: string;
  needs_buyer_approval: 'Yes' | 'No';
  approval_status: 'Not requested' | 'Requested' | 'Approved' | 'Rejected';
  data_status: DataStatus;
}

export interface DisruptionReport {
  id: string;
  supplier_id: string;
  material_id?: string;
  start_date: string;
  duration_days: number;
  capacity_loss_pct: number;
  reason?: string;
  reported_at: string;
  status: 'Active' | 'Mitigated' | 'Resolved';
  is_simulation?: boolean;
}

export interface PlanAction {
  id: string;
  category: 'Internal' | 'Backup Supplier' | 'Substitution' | 'Reroute' | 'Inventory Reallocation';
  description: string;
  cost_inr: number;
  lead_time_days: number;
  target_entity: string;
  data_status: DataStatus;
  status: 'Proposed' | 'Previewed' | 'Finalised';
}

export interface PlanScore {
  cost: number;              // 0 - 100
  sla: number;               // 0 - 100
  recovery_time: number;     // 0 - 100
  customer_impact: number;   // 0 - 100
  operational_risk: number;  // 0 - 100
  sustainability: number;    // 0 - 100
  composite: number;         // 0 - 100 weighted
  // Raw units
  raw_cost_inr: number;
  raw_sla_pct: number;
  raw_recovery_days: number;
  raw_late_orders: number;
  raw_penalty_inr: number;
  raw_co2_kg: number;
}

export interface RecoveryPlan {
  id: string;
  name: string;
  tag: 'Internal' | 'Uses backup supplier' | 'Baseline' | 'Custom';
  description: string;
  actions: PlanAction[];
  scores: PlanScore;
  net_benefit_inr: number;
  protected_orders_count: number;
  late_deliveries_avoided: number;
  assumptions: string[];
  knowns: string[];
  recommended: boolean;
  status: 'Proposed' | 'Previewed' | 'Finalised';
  is_simulation?: boolean;
}

export interface OrderImpactSummary {
  order: Order;
  customer: Customer;
  current_stage: OrderStage;
  expected_delivery: string;
  delay_days: number;
  status: 'Done' | 'In progress' | 'Waiting' | 'At risk' | 'Will be late' | 'Safe' | 'Rerouted';
  order_value_inr: number;
  late_penalty_inr: number;
  dependency_path: string[];
  bottleneck_stage?: string;
}

export interface NetworkImpactResult {
  disruption: DisruptionReport;
  affected_suppliers: Supplier[];
  affected_materials: Material[];
  delayed_pos: InboundPO[];
  factory_stockouts: {
    factory_id: string;
    material_id: string;
    stockout_date: string;
    days_of_cover: number;
    current_stock: number;
    daily_consumption: number;
  }[];
  order_impacts: OrderImpactSummary[];
  total_orders: number;
  safe_orders: number;
  at_risk_orders: number;
  late_orders: number;
  total_value_in_flight: number;
  total_penalties_inr: number;
  production_shortfall_pcs: number;
  evaluated_at: string;
}

export interface SupplyChainData {
  settings: Setting[];
  suppliers: Supplier[];
  materials: Material[];
  supplier_materials: SupplierMaterial[];
  products: Product[];
  bom: BOMItem[];
  locations: Location[];
  production_rates: ProductionRate[];
  inventory: InventoryItem[];
  customers: Customer[];
  orders: Order[];
  order_stages: OrderStage[];
  inbound_pos: InboundPO[];
  routes: Route[];
  substitutes: Substitute[];
  disruptions: DisruptionReport[];
  plans: RecoveryPlan[];
  audit_history: AuditRecord[];
  alerts: EarlyAlert[];
  as_of_date: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user_email: string;
  action_type: 'DISRUPTION_REPORTED' | 'PLAN_PREVIEWED' | 'PLAN_FINALISED' | 'PLAN_UNDONE' | 'DATA_EDIT' | 'DATE_REBASED' | 'SUPPLIER_QUOTE_UPDATED';
  details: string;
  snapshot_before?: any;
  snapshot_after?: any;
}

export interface EarlyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  type: 'PO_OVERDUE' | 'STAGE_OVERDUE' | 'LOW_STOCK' | 'SLA_RISK' | 'UNCONFIRMED_QUOTE';
  timestamp: string;
  entity_id: string;
  status: 'Open' | 'Dismissed' | 'Confirmed_Disruption';
}

export interface KnowledgeDoc {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'TXT' | 'MD';
  uploaded_at: string;
  size_kb: number;
  chunks_count: number;
}

export interface KnowledgeChunk {
  id: string;
  doc_id: string;
  doc_name: string;
  chunk_index: number;
  content: string;
  tokens_estimate: number;
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}

