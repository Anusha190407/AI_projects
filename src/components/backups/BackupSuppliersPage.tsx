import React, { useState } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { draftSupplierRFQ } from '../../services/aiService';
import {
  Truck,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const BackupSuppliersPage: React.FC = () => {
  const { data, updateRecord, currentDate } = useTwinData();

  const [selectedMaterial, setSelectedMaterial] = useState('MAT-01');
  const [rfqModalSupplier, setRfqModalSupplier] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [replyPrice, setReplyPrice] = useState('275');
  const [replyLeadTime, setReplyLeadTime] = useState('4');

  // Backup suppliers for selected material
  const backupSupplierMaterials = data.supplier_materials.filter(
    sm => sm.material_id === selectedMaterial && sm.role === 'Backup'
  );

  const handleOpenRFQ = (sm: any, sup: any) => {
    const mat = data.materials.find(m => m.material_id === sm.material_id);
    const rfq = draftSupplierRFQ(
      {
        name: sup.name,
        contact_person: sup.contact_person,
        contact_email: sup.contact_email,
        city: sup.city
      },
      mat?.name || 'Raw Material',
      5000,
      '2026-11-06',
      'Tiruppur Unit 1'
    );

    setRfqModalSupplier({
      ...sup,
      ...sm,
      subject: rfq.subject,
      body: rfq.body,
      mailtoUrl: rfq.mailtoUrl
    });
  };

  const handleCopy = () => {
    if (!rfqModalSupplier) return;
    navigator.clipboard.writeText(rfqModalSupplier.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmReply = () => {
    if (!rfqModalSupplier) return;
    // Update supplier_material record to Confirmed quote / Known
    updateRecord(
      'supplier_materials',
      'supplier_id',
      rfqModalSupplier.supplier_id,
      {
        quote_status: 'Confirmed quote',
        unit_price: parseFloat(replyPrice) || rfqModalSupplier.unit_price,
        lead_time_days: parseInt(replyLeadTime, 10) || rfqModalSupplier.lead_time_days,
        quote_date: currentDate,
        data_status: 'Known'
      }
    );
    setRfqModalSupplier(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resilient Sourcing & Tier-2 Vendor Matrix
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Backup Supplier Directory & RFQ Dispatcher
          </h2>
        </div>

        {/* Material Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Material:</span>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
          >
            {data.materials.map(m => (
              <option key={m.material_id} value={m.material_id}>
                {m.material_id} — {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backupSupplierMaterials.map(sm => {
          const sup = data.suppliers.find(s => s.supplier_id === sm.supplier_id);
          if (!sup) return null;

          const isConfirmed = sm.quote_status === 'Confirmed quote';

          return (
            <div
              key={sm.supplier_id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {sup.supplier_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isConfirmed
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {sm.quote_status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {sup.name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {sup.city}, {sup.state} &bull; {sup.distance_to_tiruppur_km} km away
                </div>

                {/* Sourcing Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Unit Price</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{sm.unit_price} / {sm.price_unit.split(' ')[2] || 'unit'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Lead Time</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {sm.lead_time_days} Days
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Weekly Capacity</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sm.weekly_capacity.toLocaleString()} {sm.capacity_unit.split(' ')[0]}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Reliability</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {sup.reliability_pct}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  Contact: <span className="text-slate-700 dark:text-slate-300 font-medium">{sup.contact_person}</span> ({sup.contact_email})
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${sm.data_status === 'Known' ? 'text-emerald-500' : 'text-amber-500 border-b border-dotted border-amber-500'}`}>
                  {sm.data_status} Basis
                </span>

                <button
                  onClick={() => handleOpenRFQ(sm, sup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Request RFQ Quote</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Substitute Materials Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Alternative Material Substitution Policy & Approvals
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Governed under Buyer Specification Contracts &mdash; unapproved substitutions are tagged as ASSUMPTIONS until customer sign-off.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.substitutes.map((sub, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-600 dark:text-indigo-400">
                  {sub.original_material} &rarr; {sub.substitute_material}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  sub.approval_status === 'Approved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  Approval: {sub.approval_status}
                </span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300">
                {sub.quality_note}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Allowed Lines: <strong>{sub.allowed_products}</strong></span>
                <span className="border-b border-dotted border-amber-500 text-amber-500 font-semibold text-[10px]">
                  ASSUMPTION STATUS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RFQ Modal */}
      {rfqModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                AI-Drafted RFQ Quotation Request &bull; {rfqModalSupplier.name}
              </div>
              <button onClick={() => setRfqModalSupplier(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Subject</label>
                <input
                  type="text"
                  readOnly
                  value={rfqModalSupplier.subject}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Message Body</label>
                <textarea
                  readOnly
                  rows={8}
                  value={rfqModalSupplier.body}
                  className="w-full text-xs font-mono p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>

                <a
                  href={rfqModalSupplier.mailtoUrl}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Open in Mail Client</span>
                </a>
              </div>

              {/* Log Supplier Confirmation */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Record Supplier Response & Confirm Quote (Upgrades to KNOWN):
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500">Agreed Unit Price (INR)</label>
                    <input
                      type="number"
                      value={replyPrice}
                      onChange={(e) => setReplyPrice(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Guaranteed Lead Time (Days)</label>
                    <input
                      type="number"
                      value={replyLeadTime}
                      onChange={(e) => setReplyLeadTime(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                    />
                  </div>
                </div>
                <button
                  onClick={handleConfirmReply}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm Supplier Quote as Verified KNOWN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

