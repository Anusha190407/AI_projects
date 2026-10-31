import { KnowledgeDoc, KnowledgeChunk, SearchResult } from '../types';

export const initialDocs: KnowledgeDoc[] = [
  {
    id: 'DOC-01',
    name: 'Supplier_Contract_Terms_SriKumaran.pdf',
    type: 'PDF',
    uploaded_at: '2026-10-15T09:00:00Z',
    size_kb: 142,
    chunks_count: 3
  },
  {
    id: 'DOC-02',
    name: 'Customer_SLA_and_Penalty_Policy.pdf',
    type: 'PDF',
    uploaded_at: '2026-10-18T11:30:00Z',
    size_kb: 98,
    chunks_count: 3
  },
  {
    id: 'DOC-03',
    name: 'Supply_Disruption_Response_Playbook.md',
    type: 'MD',
    uploaded_at: '2026-10-20T14:15:00Z',
    size_kb: 64,
    chunks_count: 3
  },
  {
    id: 'DOC-04',
    name: 'Incident_Report_Nov2025_Yarn_Shortage.txt',
    type: 'TXT',
    uploaded_at: '2026-10-22T16:00:00Z',
    size_kb: 45,
    chunks_count: 2
  },
  {
    id: 'DOC-05',
    name: 'Buyer_Approval_Rules_Yarn_Substitution.docx',
    type: 'DOCX',
    uploaded_at: '2026-10-25T10:00:00Z',
    size_kb: 85,
    chunks_count: 2
  }
];

export const initialChunks: KnowledgeChunk[] = [
  {
    id: 'CHK-01-1',
    doc_id: 'DOC-01',
    doc_name: 'Supplier_Contract_Terms_SriKumaran.pdf',
    chunk_index: 1,
    tokens_estimate: 420,
    content: `SECTION 4: DELIVERY SCHEDULE AND LEAD TIME COMMITMENTS
4.1 Primary Supplier Sri Kumaran Spinning Mills commits to maintaining weekly dispatch capacity of not less than 18,000 kg of Combed Cotton Yarn 30s (MAT-01).
4.2 Standard contractual delivery lead time to Tiruppur Unit 1 (Veerapandi) and Unit 2 (Palladam) shall be three (3) calendar days from receipt of electronic Purchase Order.
4.3 Force Majeure: In the event of machinery breakdown, factory strike, or power disruption exceeding 48 hours, Supplier must issue formal notice within 12 hours.`
  },
  {
    id: 'CHK-01-2',
    doc_id: 'DOC-01',
    doc_name: 'Supplier_Contract_Terms_SriKumaran.pdf',
    chunk_index: 2,
    tokens_estimate: 460,
    content: `SECTION 8: LIQUIDATED DAMAGES FOR UNANNOUNCED OUTAGES
8.1 Where delivery delay exceeds four (4) business days without prior verified force majeure notice, Buyer reserves the right to procure emergency alternative volume from designated secondary suppliers (including Erode Cotton Yarns or Salem Fine Spinners).
8.2 Any cost differential up to 15% above the contracted base rate of ₹265/kg shall be deducted from pending invoices.
8.3 Primary supplier guarantees minimum tensile strength of 18.5 Rkm and CSP above 2850 for combed yarn lots.`
  },
  {
    id: 'CHK-02-1',
    doc_id: 'DOC-02',
    doc_name: 'Customer_SLA_and_Penalty_Policy.pdf',
    chunk_index: 1,
    tokens_estimate: 480,
    content: `RETAIL CUSTOMER SLA FRAMEWORK — FESTIVE & PEAK WINDOWS
Category A Customers (High Priority: Madras Mart Retail CUS-01, Hyderabad Hues Fashion CUS-04):
Orders tagged under festive promotions carry a non-negotiable promised delivery window. Daily delay penalty is assessed at exactly 2.0% of the total purchase order invoice value per calendar day of delay.
Failure to deliver within 5 days of promised date grants buyer right of order cancellation with 100% loss absorption by manufacturer.`
  },
  {
    id: 'CHK-02-2',
    doc_id: 'DOC-02',
    doc_name: 'Customer_SLA_and_Penalty_Policy.pdf',
    chunk_index: 2,
    tokens_estimate: 390,
    content: `Category B Customers (Medium Priority: Southern Style Stores CUS-02, Kerala Kids Corner CUS-03):
Standard contract penalty is 1.0% to 1.5% per day of delay up to a maximum cap of 15% of invoice value.
Flexible delivery rescheduling: If notice is provided at least 5 days prior to store delivery date, penalty can be waived with store manager written consent.`
  },
  {
    id: 'CHK-03-1',
    doc_id: 'DOC-03',
    doc_name: 'Supply_Disruption_Response_Playbook.md',
    chunk_index: 1,
    tokens_estimate: 450,
    content: `STANDARD OPERATING PROCEDURE: SUPPLIER DISRUPTION RESPONSE
Level 1 Escalation (Internal Recovery):
1. Immediately audit buffer inventory across both factories. FAC-2 (Palladam) typically maintains lower daily draw and can transfer up to 2,500 kg to FAC-1 via inter-factory shuttle (RT-06/RT-03 link).
2. Authorize up to 20% overtime shifts (up to maximum factory capacity of 7,500 pcs/day at FAC-1).
3. If internal actions prevent SLA breaches, avoid activating expensive external backup suppliers.`
  },
  {
    id: 'CHK-03-2',
    doc_id: 'DOC-03',
    doc_name: 'Supply_Disruption_Response_Playbook.md',
    chunk_index: 2,
    tokens_estimate: 440,
    content: `Level 2 Escalation (External Procurement & Substitution):
Trigger Condition: If projected customer late penalties exceed ₹500,000 INR or more than 2 high-priority orders breach SLA.
1. Primary Backup Sourcing: Issue PO to Erode Cotton Yarns (SUP-06) at ₹278/kg. Lead time: 4 days, weekly capacity: 8,000 kg.
2. Sourcing from Salem Fine Spinners (SUP-07) requires price confirmation as quote is currently an Assumption.
3. Rerouting via Rail (RT-19/RT-21) reduces freight carbon emissions by over 60% compared to road freight.`
  },
  {
    id: 'CHK-04-1',
    doc_id: 'DOC-04',
    doc_name: 'Incident_Report_Nov2025_Yarn_Shortage.txt',
    chunk_index: 1,
    tokens_estimate: 380,
    content: `POST-INCIDENT REVIEW: NOVEMBER 2025 COIMBATORE MILL FLOODING
During the 8-day spinning mill shutdown in Nov 2025, rapid activation of Erode Cotton Yarns (SUP-06) saved 9,000 units of export tees.
Key Takeaway: SUP-06 delivered within 4 days exactly as quoted. Sourcing from Gujarat Polyfibre was attempted but took 9 days due to interstate road transit, resulting in store stockout at Bangalore. Recommendation: Prioritize suppliers within 100 km radius for emergency replenishment.`
  },
  {
    id: 'CHK-05-1',
    doc_id: 'DOC-05',
    doc_name: 'Buyer_Approval_Rules_Yarn_Substitution.docx',
    chunk_index: 1,
    tokens_estimate: 410,
    content: `POLICY ON MATERIAL SUBSTITUTION: COTTON-POLY BLEND (MAT-06)
1. Permitted Products: Cotton-Poly Blend 30s (65/35) may ONLY be substituted on basic promotional lines (specifically PRD-01 Men's Basic Tee).
2. Prohibited Products: NOT permitted on Women's V-Neck (PRD-02) or Kids Printed Tee (PRD-03) due to soft-feel hand-feel specifications.
3. Mandatory Buyer Sign-off: Formal written signoff must be obtained from client merchandising lead before cutting begins. Without signed waiver, substitution is classified as an unapproved Assumption.`
  }
];

// Lightweight tokenization and TF-IDF / BM25 style similarity search
export function searchKnowledgeChunks(query: string, chunks: KnowledgeChunk[] = initialChunks): SearchResult[] {
  if (!query || !query.trim()) return [];

  const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const chunk of chunks) {
    const text = chunk.content.toLowerCase();
    let matchCount = 0;
    let exactPhraseBonus = 0;

    if (text.includes(query.toLowerCase().trim())) {
      exactPhraseBonus = 5;
    }

    for (const term of queryTerms) {
      const occurrences = (text.match(new RegExp(`\\b${term}`, 'g')) || []).length;
      if (occurrences > 0) {
        matchCount += Math.min(occurrences, 4);
      }
    }

    if (matchCount > 0 || exactPhraseBonus > 0) {
      const rawScore = (matchCount * 1.5) + exactPhraseBonus;
      const normalizedScore = +(Math.min(0.99, (rawScore / (queryTerms.length * 3 + 4)) * 0.95 + 0.05)).toFixed(2);

      results.push({
        chunk,
        score: normalizedScore
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

// Function to chunk uploaded user documents
export function processUploadedDocument(docName: string, text: string, docType: KnowledgeDoc['type']): { doc: KnowledgeDoc; chunks: KnowledgeChunk[] } {
  const docId = `DOC-${Date.now()}`;
  const rawChunks = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);

  const chunks: KnowledgeChunk[] = rawChunks.map((cText, idx) => ({
    id: `CHK-${docId}-${idx + 1}`,
    doc_id: docId,
    doc_name: docName,
    chunk_index: idx + 1,
    content: cText.trim(),
    tokens_estimate: Math.round(cText.length / 4)
  }));

  const doc: KnowledgeDoc = {
    id: docId,
    name: docName,
    type: docType,
    uploaded_at: new Date().toISOString(),
    size_kb: Math.round(text.length / 1024) || 1,
    chunks_count: chunks.length
  };

  return { doc, chunks };
}

