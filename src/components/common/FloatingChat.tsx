import React, { useState, useRef, useEffect } from 'react';
import { useTwinData } from '../../context/TwinDataContext';
import { runAgentQuery, AgentStep } from '../../services/aiService';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  Layers,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  steps?: AgentStep[];
  toolCalls?: { name: string; args: any; resultSummary: string }[];
  citations?: any[];
  knownVsAssumption?: { known: string[]; assumption: string[] };
}

export const FloatingChat: React.FC<{ currentPage: string }> = ({ currentPage }) => {
  const { data, activeDisruption, currentDate, mode } = useTwinData();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-initial',
      sender: 'agent',
      text: `Hello! I am **ChainTwin AI**, your autonomous supply chain digital twin copilot.\n\nI can audit network vulnerabilities, explain recovery plan trade-offs, trace customer SLA breaches, and query supplier contracts. What would you like to examine?`
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Contextual suggested questions
  const suggestedQueries = [
    'Why is Plan B cheaper than Plan A?',
    'Which backup suppliers can deliver Cotton Yarn (MAT-01)?',
    'Which high-priority customer orders are affected?',
    'What happens if the disruption lasts another 5 days?',
    'Explain the liquidated damages clause in our supplier contract.'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await runAgentQuery(textToSend, data, activeDisruption, currentDate);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.answer,
        steps: response.steps,
        toolCalls: response.toolCalls,
        citations: response.citations,
        knownVsAssumption: response.knownVsAssumption
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'Encountered an issue running calculations. Please verify parameters in Settings.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all border border-blue-400/30"
      >
        <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
        <span>Ask ChainTwin Copilot</span>
        {activeDisruption && (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
        )}
      </button>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[640px] max-h-[85vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                CT
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  ChainTwin AI Copilot
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Read-Only
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Grounding Mode: {mode} &bull; As of {currentDate}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {/* Tool execution timeline */}
                  {msg.steps && msg.steps.length > 0 && (
                    <div className="mb-3 p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                      <div className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                        <Layers className="w-3 h-3 text-blue-500" /> Agent Execution Path:
                      </div>
                      {msg.steps.map(s => (
                        <div key={s.id} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Message Text */}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Citations from RAG */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-500" /> Contract & Policy Citations:
                      </div>
                      <div className="space-y-1">
                        {msg.citations.slice(0, 2).map((c: any, i: number) => (
                          <div key={i} className="text-[10px] p-1.5 rounded bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20">
                            <strong>{c.chunk.doc_name}</strong> (Chunk #{c.chunk.chunk_index}, Match: {Math.round(c.score * 100)}%)
                            <div className="truncate text-[9px] opacity-80 mt-0.5">{c.chunk.content.slice(0, 100)}...</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Known vs Assumption tags */}
                  {msg.knownVsAssumption && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1 text-[9px]">
                      {msg.knownVsAssumption.known.map((k, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ KNOWN: {k}
                        </span>
                      ))}
                      {msg.knownVsAssumption.assumption.map((a, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          ⚠️ ASSUMPTION: {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs">Reasoning over supply chain graph...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Contextual Queries */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Ask:</span>
            {suggestedQueries.slice(0, 3).map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 transition"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask copilot about disruptions, suppliers, SLAs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-transparent focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

