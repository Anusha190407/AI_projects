import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { initialSeedData } from '../src/data/seedData';

const outputDir = path.resolve(process.cwd(), 'public', 'sample');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const wb = XLSX.utils.book_new();

// 1. Settings
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.settings), 'Settings');
// 2. Suppliers
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.suppliers), 'Suppliers');
// 3. Materials
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.materials), 'Materials');
// 4. Supplier_Materials
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.supplier_materials), 'Supplier_Materials');
// 5. Products
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.products), 'Products');
// 6. BOM
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.bom), 'BOM');
// 7. Locations
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.locations), 'Locations');
// 8. Production_Rate
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.production_rates), 'Production_Rate');
// 9. Inventory
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.inventory), 'Inventory');
// 10. Customers
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.customers), 'Customers');
// 11. Orders
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.orders), 'Orders');
// 12. Order_Stages
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.order_stages), 'Order_Stages');
// 13. Inbound_POs
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.inbound_pos), 'Inbound_POs');
// 14. Routes
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.routes), 'Routes');
// 15. Substitutes
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initialSeedData.substitutes), 'Substitutes');

const filePath = path.join(outputDir, 'tiruppur_tshirt_supply_chain_data.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`[Generated] Excel sample workbook created at: ${filePath}`);

