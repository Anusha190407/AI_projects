import React, { useState, useMemo } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { SupplyChainData } from '../../types';
import * as XLSX from 'xlsx';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Search,
  Check,
  X,
  FileSpreadsheet,
  RefreshCw,
  Calendar
} from 'lucide-react';

type EntityKey = keyof Omit<SupplyChainData, 'disruptions' | 'plans' | 'audit_history' | 'alerts' | 'as_of_date'>;

export const DataManager: React.FC = () => {
  const {
    data,
    updateRecord,
    addRecord,
    deleteRecord,
    loadSampleWorkbook,
    exportEntireDatasetJSON,
    rebaseDatesTo,
    currentDate
  } = useTwinData();

  const [selectedEntity, setSelectedEntity] = useState<EntityKey>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFormData, setNewFormData] = useState<any>({});
  const [rebaseDateInput, setRebaseDateInput] = useState(currentDate);

  const entityConfig: Record<EntityKey, { label: string; idKey: string }> = {
    orders: { label: 'Orders', idKey: 'order_id' },
    order_stages: { label: 'Order Stages', idKey: 'order_id' },
    suppliers: { label: 'Suppliers', idKey: 'supplier_id' },
    materials: { label: 'Materials', idKey: 'material_id' },
    supplier_materials: { label: 'Supplier Materials', idKey: 'supplier_id' },
    products: { label: 'Products', idKey: 'product_id' },
    bom: { label: 'Bill of Materials (BOM)', idKey: 'product_id' },
    locations: { label: 'Locations (Factories & DCs)', idKey: 'location_id' },
    production_rates: { label: 'Production Rates', idKey: 'factory_id' },
    inventory: { label: 'Inventory Stocks', idKey: 'location_id' },
    customers: { label: 'Customers', idKey: 'customer_id' },
    inbound_pos: { label: 'Inbound POs', idKey: 'po_id' },
    routes: { label: 'Routes & Transport', idKey: 'route_id' },
    substitutes: { label: 'Material Substitutes', idKey: 'original_material' },
    settings: { label: 'Settings & Weights', idKey: 'key' }
  };

  const currentRecords = useMemo(() => {
    const records = (data[selectedEntity] as any[]) || [];
    if (!searchQuery.trim()) return records;
    return records.filter(rec =>
      JSON.stringify(rec).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, selectedEntity, searchQuery]);

  const columns = useMemo(() => {
    const records = (data[selectedEntity] as any[]) || [];
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  }, [data, selectedEntity]);

  const idField = entityConfig[selectedEntity].idKey;

  const handleStartEdit = (rec: any) => {
    setEditingId(rec[idField]);
    setEditFormData({ ...rec });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateRecord(selectedEntity, idField, editingId, editFormData);
    setEditingId(null);
  };

  const handleSaveNew = () => {
    addRecord(selectedEntity, newFormData);
    setIsAddingNew(false);
    setNewFormData({});
  };

  const handleDelete = (idVal: any) => {
    if (confirm(`Are you sure you want to delete this record (${idVal})?`)) {
      deleteRecord(selectedEntity, idField, idVal);
    }
  };

  // Export current table to Excel
  const exportCurrentTableToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data[selectedEntity] as any[]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedEntity);
    XLSX.writeFile(wb, `ChainTwin_${selectedEntity}_${data.as_of_date}.xlsx`);
  };

  // Excel / CSV File Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // If sheet name matches current entity or first sheet
        const sheetName = wb.SheetNames.find(n => n.toLowerCase() === selectedEntity.toLowerCase()) || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(ws);

        if (Array.isArray(importedData) && importedData.length > 0) {
          alert(`Successfully parsed ${importedData.length} records for ${selectedEntity} from ${file.name}.`);
          // Batch replace or add
          importedData.forEach((row: any) => {
            addRecord(selectedEntity, row);
          });
        }
      } catch (err) {
        alert('Failed to parse file: ' + String(err));
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Rebase Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Digital Twin Database Architecture
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Generic Schema-Driven Data Manager
          </h2>
        </div>

        {/* Temporal Date Rebasing Controls */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <Calendar className="w-4 h-4 text-amber-500 ml-1" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            Rebase Dates to:
          </div>
          <input
            type="date"
            value={rebaseDateInput}
            onChange={(e) => setRebaseDateInput(e.target.value)}
            className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 border border-amber-500/40 text-slate-900 dark:text-white"
          />
          <button
            onClick={() => rebaseDatesTo(rebaseDateInput)}
            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition"
          >
            Rebase All
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Entity Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl py-1">
          {(Object.keys(entityConfig) as EntityKey[]).map(key => (
            <button
              key={key}
              onClick={() => {
                setSelectedEntity(key);
                setEditingId(null);
                setIsAddingNew(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedEntity === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {entityConfig[key].label}
            </button>
          ))}
        </div>

        {/* Global Dataset Utilities */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel/CSV</span>
            <input type="file" accept=".xlsx,.csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={exportCurrentTableToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Sheet</span>
          </button>

          <button
            onClick={loadSampleWorkbook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition"
            title="Reload default Tiruppur Cotton T-Shirt dataset"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Reset Sample</span>
          </button>

          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Row</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${entityConfig[selectedEntity].label}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Schema Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3 pl-4">Actions</th>
                {columns.map(col => (
                  <th key={col} className="p-3 uppercase text-[10px] tracking-wider">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {/* Inline Add Row */}
              {isAddingNew && (
                <tr className="bg-blue-50/50 dark:bg-blue-950/30">
                  <td className="p-3 pl-4 flex items-center gap-1">
                    <button onClick={handleSaveNew} className="p-1 rounded bg-emerald-600 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsAddingNew(false)} className="p-1 rounded bg-slate-300 dark:bg-slate-700 text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  {columns.map(col => (
                    <td key={col} className="p-2">
                      <input
                        type="text"
                        placeholder={col}
                        value={newFormData[col] || ''}
                        onChange={(e) => setNewFormData({ ...newFormData, [col]: e.target.value })}
                        className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </td>
                  ))}
                </tr>
              )}

              {/* Data Rows */}
              {currentRecords.map((rec: any, idx) => {
                const isEditing = editingId === rec[idField];

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 pl-4 flex items-center gap-1.5 whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEdit} className="p-1 rounded bg-emerald-600 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(rec)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec[idField])}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>

                    {columns.map(col => {
                      const val = rec[col];
                      const isAssumption = rec.data_status === 'Assumption' && (col === 'unit_price' || col === 'reliability_pct' || col === 'lead_time_days');

                      return (
                        <td key={col} className="p-3 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData[col] !== undefined ? editFormData[col] : ''}
                              onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                              className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                            />
                          ) : isAssumption ? (
                            <span className="border-b-2 border-dotted border-amber-500 text-amber-600 dark:text-amber-400 font-semibold">
                              {String(val)} <span className="text-[9px] uppercase px-1 rounded bg-amber-500/20">Assumption</span>
                            </span>
                          ) : (
                            <span className="text-slate-700 dark:text-slate-300">
                              {String(val !== undefined && val !== null ? val : '')}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

