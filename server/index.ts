import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initialSeedData } from '../src/data/seedData';
import { calculateNetworkImpact } from '../src/engine/calculationEngine';
import { generateRecoveryPlans } from '../src/engine/recoveryOptimizer';
import { searchKnowledgeChunks } from '../src/engine/ragEngine';
import { runAgentQuery, draftSupplierRFQ } from '../src/services/aiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory state with persistence backup
let currentData = { ...initialSeedData };

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ChainTwin AI Digital Twin Engine',
    as_of_date: currentData.as_of_date
  });
});

// Snapshot endpoint
app.get('/api/data/snapshot', (req, res) => {
  res.json(currentData);
});

// Deterministic impact calculation endpoint
app.post('/api/calculate', (req, res) => {
  const { disruption, as_of_date } = req.body;
  const result = calculateNetworkImpact(currentData, disruption || null, as_of_date || currentData.as_of_date);
  res.json(result);
});

// Recovery Plan Optimizer endpoint
app.post('/api/optimize', (req, res) => {
  const { disruption, weights } = req.body;
  const plans = generateRecoveryPlans(currentData, disruption, weights);
  res.json(plans);
});

// RAG Knowledge search endpoint
app.post('/api/rag/search', (req, res) => {
  const { query } = req.body;
  const results = searchKnowledgeChunks(query);
  res.json(results);
});

// Agent reasoning endpoint
app.post('/api/ai/agent', async (req, res) => {
  const { query, disruption, now } = req.body;
  const response = await runAgentQuery(query, currentData, disruption || null, now || currentData.as_of_date);
  res.json(response);
});

// RFQ Draft endpoint
app.post('/api/ai/rfq', (req, res) => {
  const { supplier, materialName, quantity, deadline, factory } = req.body;
  const rfq = draftSupplierRFQ(supplier, materialName, quantity, deadline, factory);
  res.json(rfq);
});

let currentPort = Number(PORT);

const server = app.listen(currentPort, () => {
  console.log(`[ChainTwin AI Server] Running on http://localhost:${currentPort}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    currentPort += 1;
    console.log(`[ChainTwin AI Server] Port busy, attempting port ${currentPort}...`);
    server.listen(currentPort);
  } else {
    console.error('[ChainTwin AI Server] Server error:', err);
  }
});

