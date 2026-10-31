import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  SupplyChainData,
  DisruptionReport,
  RecoveryPlan,
  NetworkImpactResult,
  AuditRecord
} from '../types';
import { initialSeedData } from '../data/seedData';
import { calculateNetworkImpact } from '../engine/calculationEngine';
import { generateRecoveryPlans } from '../engine/recoveryOptimizer';
import { ScoreWeights, defaultWeights, extractWeightsFromSettings } from '../engine/scoringEngine';
import { rebaseDatasetDates } from '../engine/dateRebasing';
import { useAuth } from './AuthContext';

interface TwinDataContextType {
  mode: 'LIVE' | 'SIMULATION';
  setMode: (m: 'LIVE' | 'SIMULATION') => void;
  data: SupplyChainData;
  liveData: SupplyChainData;
  simData: SupplyChainData;
  activeDisruption: DisruptionReport | null;
  activePlans: RecoveryPlan[];
  selectedPlan: RecoveryPlan | null;
  setSelectedPlan: (p: RecoveryPlan | null) => void;
  previewedPlan: RecoveryPlan | null;
  impactResult: NetworkImpactResult;
  weights: ScoreWeights;
  setWeights: React.Dispatch<React.SetStateAction<ScoreWeights>>;
  currentClock: string;
  timeZone: string;
  setTimeZone: (tz: string) => void;
  currentDate: string;
  setCurrentDate: (d: string) => void;
  reportDisruption: (d: Omit<DisruptionReport, 'id' | 'reported_at' | 'status'>) => void;
  resolveDisruption: (id: string) => void;
  previewPlan: (plan: RecoveryPlan) => void;
  cancelPreview: () => void;
  finalisePlan: (plan: RecoveryPlan) => void;
  undoLastAction: () => void;
  rebaseDatesTo: (targetDate: string) => void;
  resetSimulationToLive: () => void;
  reportSimAsReal: () => void;
  updateRecord: <K extends keyof SupplyChainData>(entityName: K, idField: string, idVal: any, updatedFields: any) => void;
  addRecord: <K extends keyof SupplyChainData>(entityName: K, record: any) => void;
  deleteRecord: <K extends keyof SupplyChainData>(entityName: K, idField: string, idVal: any) => void;
  loadSampleWorkbook: () => void;
  exportEntireDatasetJSON: () => void;
  lastUpdatedTimestamp: string;
}

const TwinDataContext = createContext<TwinDataContextType | undefined>(undefined);

export const TwinDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'LIVE' | 'SIMULATION'>('LIVE');

  // Real-time live device clock
  const [currentClock, setCurrentClock] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  });

  // Current explicit evaluation date (from device or rebased)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentClock(
        now.toLocaleTimeString('en-US', {
          timeZone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  // Persistent storage for live data
  const [liveData, setLiveData] = useState<SupplyChainData>(() => {
    try {
      const saved = localStorage.getItem('chaintwin_livedata');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.suppliers)) {
          return parsed;
        }
      }
      return initialSeedData;
    } catch {
      return initialSeedData;
    }
  });

  // State history for Undo
  const [historyStack, setHistoryStack] = useState<SupplyChainData[]>([]);

  // What-If Simulation Sandbox State (deep copy)
  const [simData, setSimData] = useState<SupplyChainData>(() => JSON.parse(JSON.stringify(liveData)));

  const [previewedPlan, setPreviewedPlan] = useState<RecoveryPlan | null>(null);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string>(new Date().toISOString());

  // Score weights
  const [weights, setWeights] = useState<ScoreWeights>(() => extractWeightsFromSettings(liveData.settings));

  // Active dataset depending on mode
  const data = useMemo(() => {
    return mode === 'LIVE' ? liveData : simData;
  }, [mode, liveData, simData]);

  // Persist live data
  useEffect(() => {
    localStorage.setItem('chaintwin_livedata', JSON.stringify(liveData));
    setLastUpdatedTimestamp(new Date().toISOString());
  }, [liveData]);

  // Multi-tab sync via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('chaintwin_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'DATA_UPDATED' && event.data.payload) {
          setLiveData(event.data.payload);
        }
      };
    } catch (e) {
      // BroadcastChannel unsupported or sandbox
    }
    return () => {
      channel?.close();
    };
  }, []);

  const broadcastChange = useCallback((updated: SupplyChainData) => {
    try {
      const channel = new BroadcastChannel('chaintwin_sync');
      channel.postMessage({ type: 'DATA_UPDATED', payload: updated });
      channel.close();
    } catch {}
  }, []);

  // Active disruption
  const activeDisruption = useMemo(() => {
    return data.disruptions.find(d => d.status === 'Active') || null;
  }, [data.disruptions]);

  // Impact calculation
  const impactResult = useMemo(() => {
    return calculateNetworkImpact(data, activeDisruption, currentDate);
  }, [data, activeDisruption, currentDate]);

  // Recovery plans generated dynamically
  const activePlans = useMemo(() => {
    if (!activeDisruption) return [];
    return generateRecoveryPlans(data, activeDisruption, weights);
  }, [data, activeDisruption, weights]);

  const [selectedPlan, setSelectedPlan] = useState<RecoveryPlan | null>(null);

  // Auto-select recommended plan
  useEffect(() => {
    if (activePlans.length > 0) {
      const rec = activePlans.find(p => p.recommended) || activePlans[0];
      setSelectedPlan(rec);
    } else {
      setSelectedPlan(null);
    }
  }, [activePlans]);

  // Snapshot helper for Undo
  const pushHistorySnapshot = (prev: SupplyChainData) => {
    setHistoryStack(stk => [JSON.parse(JSON.stringify(prev)), ...stk.slice(0, 10)]);
  };

  // Disruption reporting
  const reportDisruption = (d: Omit<DisruptionReport, 'id' | 'reported_at' | 'status'>) => {
    const newDisruption: DisruptionReport = {
      ...d,
      id: `DISR-${Date.now()}`,
      reported_at: new Date().toISOString(),
      status: 'Active',
      is_simulation: mode === 'SIMULATION'
    };

    const audit: AuditRecord = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_email: user?.email || 'manager@chaintwin.ai',
      action_type: 'DISRUPTION_REPORTED',
      details: `Reported disruption on supplier ${d.supplier_id} for ${d.duration_days} days starting ${d.start_date}.`
    };

    if (mode === 'LIVE') {
      pushHistorySnapshot(liveData);
      const updated: SupplyChainData = {
        ...liveData,
        disruptions: [newDisruption, ...liveData.disruptions],
        audit_history: [audit, ...liveData.audit_history]
      };
      setLiveData(updated);
      broadcastChange(updated);
    } else {
      setSimData(prev => ({
        ...prev,
        disruptions: [newDisruption, ...prev.disruptions],
        audit_history: [audit, ...prev.audit_history]
      }));
    }
  };

  const resolveDisruption = (id: string) => {
    const updater = (prev: SupplyChainData) => ({
      ...prev,
      disruptions: prev.disruptions.map(d => d.id === id ? { ...d, status: 'Resolved' as const } : d)
    });
    if (mode === 'LIVE') {
      pushHistorySnapshot(liveData);
      const updated = updater(liveData);
      setLiveData(updated);
      broadcastChange(updated);
    } else {
      setSimData(updater);
    }
  };

  const previewPlan = (plan: RecoveryPlan) => {
    setPreviewedPlan({ ...plan, status: 'Previewed' });
  };

  const cancelPreview = () => {
    setPreviewedPlan(null);
  };

  const finalisePlan = (plan: RecoveryPlan) => {
    if (mode === 'SIMULATION') {
      alert('Finalisation is disabled in SIMULATION mode. Use "Report This as Real" first if you wish to apply to the live network.');
      return;
    }

    pushHistorySnapshot(liveData);

    const audit: AuditRecord = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_email: user?.email || 'manager@chaintwin.ai',
      action_type: 'PLAN_FINALISED',
      details: `Finalised recovery strategy: ${plan.name}. Net protected orders: ${plan.protected_orders_count}. Avoided penalty: ₹${plan.net_benefit_inr.toLocaleString()} INR.`
    };

    // Apply plan actions: update routes, orders, POs
    const finalisedPlan: RecoveryPlan = { ...plan, status: 'Finalised' };

    // Resolve current active disruption
    const updatedDisruptions = liveData.disruptions.map(d =>
      d.status === 'Active' ? { ...d, status: 'Mitigated' as const } : d
    );

    // Apply safe status to impacted orders
    const updatedStages = liveData.order_stages.map(stg => {
      if (stg.stage_name === 'Material received' && stg.status_as_of_file !== 'Done') {
        return { ...stg, status_as_of_file: 'In progress' as const };
      }
      return stg;
    });

    const updatedData: SupplyChainData = {
      ...liveData,
      disruptions: updatedDisruptions,
      order_stages: updatedStages,
      plans: [finalisedPlan, ...liveData.plans],
      audit_history: [audit, ...liveData.audit_history]
    };

    setLiveData(updatedData);
    setPreviewedPlan(null);
    broadcastChange(updatedData);
  };

  const undoLastAction = () => {
    if (historyStack.length === 0) return;
    const [previousState, ...rest] = historyStack;
    const audit: AuditRecord = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_email: user?.email || 'manager@chaintwin.ai',
      action_type: 'PLAN_UNDONE',
      details: 'Restored previous supply chain state via Undo.'
    };
    const restored = {
      ...previousState,
      audit_history: [audit, ...previousState.audit_history]
    };
    setLiveData(restored);
    setHistoryStack(rest);
    broadcastChange(restored);
  };

  const rebaseDatesTo = (targetDate: string) => {
    const { updatedData } = rebaseDatasetDates(liveData, targetDate, user?.email);
    pushHistorySnapshot(liveData);
    setLiveData(updatedData);
    setCurrentDate(targetDate);
    broadcastChange(updatedData);
  };

  const resetSimulationToLive = () => {
    setSimData(JSON.parse(JSON.stringify(liveData)));
  };

  const reportSimAsReal = () => {
    const simDisruption = simData.disruptions.find(d => d.status === 'Active');
    if (!simDisruption) return;

    reportDisruption({
      supplier_id: simDisruption.supplier_id,
      material_id: simDisruption.material_id,
      start_date: simDisruption.start_date,
      duration_days: simDisruption.duration_days,
      capacity_loss_pct: simDisruption.capacity_loss_pct,
      reason: simDisruption.reason
    });
    setMode('LIVE');
  };

  // Generic CRUD
  const updateRecord = <K extends keyof SupplyChainData>(
    entityName: K,
    idField: string,
    idVal: any,
    updatedFields: any
  ) => {
    const targetSetter = mode === 'LIVE' ? setLiveData : setSimData;
    if (mode === 'LIVE') pushHistorySnapshot(liveData);

    targetSetter((prev: SupplyChainData) => {
      const arr = prev[entityName] as any[];
      if (!Array.isArray(arr)) return prev;

      const updatedArr = arr.map(item => {
        if (item[idField] === idVal) {
          return { ...item, ...updatedFields };
        }
        return item;
      });

      const audit: AuditRecord = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_email: user?.email || 'manager@chaintwin.ai',
        action_type: 'DATA_EDIT',
        details: `Updated ${String(entityName)} [${idVal}]: modified ${Object.keys(updatedFields).join(', ')}.`
      };

      const updated = {
        ...prev,
        [entityName]: updatedArr,
        audit_history: [audit, ...prev.audit_history]
      };

      if (mode === 'LIVE') broadcastChange(updated);
      return updated;
    });
  };

  const addRecord = <K extends keyof SupplyChainData>(entityName: K, record: any) => {
    const targetSetter = mode === 'LIVE' ? setLiveData : setSimData;
    if (mode === 'LIVE') pushHistorySnapshot(liveData);

    targetSetter((prev: SupplyChainData) => {
      const arr = prev[entityName] as any[];
      if (!Array.isArray(arr)) return prev;

      const audit: AuditRecord = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_email: user?.email || 'manager@chaintwin.ai',
        action_type: 'DATA_EDIT',
        details: `Created new record in ${String(entityName)}.`
      };

      const updated = {
        ...prev,
        [entityName]: [record, ...arr],
        audit_history: [audit, ...prev.audit_history]
      };

      if (mode === 'LIVE') broadcastChange(updated);
      return updated;
    });
  };

  const deleteRecord = <K extends keyof SupplyChainData>(
    entityName: K,
    idField: string,
    idVal: any
  ) => {
    const targetSetter = mode === 'LIVE' ? setLiveData : setSimData;
    if (mode === 'LIVE') pushHistorySnapshot(liveData);

    targetSetter((prev: SupplyChainData) => {
      const arr = prev[entityName] as any[];
      if (!Array.isArray(arr)) return prev;

      const updatedArr = arr.filter(item => item[idField] !== idVal);

      const audit: AuditRecord = {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_email: user?.email || 'manager@chaintwin.ai',
        action_type: 'DATA_EDIT',
        details: `Deleted record [${idVal}] from ${String(entityName)}.`
      };

      const updated = {
        ...prev,
        [entityName]: updatedArr,
        audit_history: [audit, ...prev.audit_history]
      };

      if (mode === 'LIVE') broadcastChange(updated);
      return updated;
    });
  };

  const loadSampleWorkbook = () => {
    pushHistorySnapshot(liveData);
    setLiveData(initialSeedData);
    broadcastChange(initialSeedData);
  };

  const exportEntireDatasetJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChainTwin_DigitalTwin_Snapshot_${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TwinDataContext.Provider
      value={{
        mode,
        setMode,
        data,
        liveData,
        simData,
        activeDisruption,
        activePlans,
        selectedPlan,
        setSelectedPlan,
        previewedPlan,
        impactResult,
        weights,
        setWeights,
        currentClock,
        timeZone,
        setTimeZone,
        currentDate,
        setCurrentDate,
        reportDisruption,
        resolveDisruption,
        previewPlan,
        cancelPreview,
        finalisePlan,
        undoLastAction,
        rebaseDatesTo,
        resetSimulationToLive,
        reportSimAsReal,
        updateRecord,
        addRecord,
        deleteRecord,
        loadSampleWorkbook,
        exportEntireDatasetJSON,
        lastUpdatedTimestamp
      }}
    >
      {children}
    </TwinDataContext.Provider>
  );
};

export const useTwinData = () => {
  const context = useContext(TwinDataContext);
  if (!context) throw new Error('useTwinData must be used within a TwinDataProvider');
  return context;
};

