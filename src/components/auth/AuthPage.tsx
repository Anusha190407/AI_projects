import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Zap, Sparkles, CheckCircle2, Lock, Mail, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, quickDemoLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('operations.lead@tiruppurtextiles.com');
  const [password, setPassword] = useState('demo123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      signup(name || 'Supply Chain Lead', email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Left Brand Area (Animated Digital Twin) */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-[#0a1128] via-[#0b132b] to-[#1c2541] border-r border-slate-800 relative overflow-hidden select-none">
        {/* Background Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-blue-500/30">
              CT
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                ChainTwin <span className="text-teal-400 font-mono text-xs px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">AI</span>
              </span>
              <span className="text-xs text-slate-400 block font-medium">Autonomous Supply Chain Recovery Agent</span>
            </div>
          </div>
        </div>

        {/* Animated Network Graphic */}
        <div className="relative z-10 my-8 py-4">
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Autonomous Flow</span>
              <span className="text-teal-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" /> Synchronized Twin
              </span>
            </div>

            <div className="flex items-center justify-between text-center gap-2 py-2">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 w-16">
                <div className="text-[10px] text-slate-400">SUPPLIER</div>
                <div className="font-bold text-xs text-emerald-400 mt-0.5">SUP-01</div>
              </div>
              <div className="text-slate-600 animate-pulse">&rarr;</div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 w-16">
                <div className="text-[10px] text-slate-400">FACTORY</div>
                <div className="font-bold text-xs text-blue-400 mt-0.5">FAC-1</div>
              </div>
              <div className="text-slate-600 animate-pulse">&rarr;</div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 w-16">
                <div className="text-[10px] text-slate-400">HUB / DC</div>
                <div className="font-bold text-xs text-indigo-400 mt-0.5">DC-CHN</div>
              </div>
              <div className="text-slate-600 animate-pulse">&rarr;</div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 w-16">
                <div className="text-[10px] text-slate-400">CUSTOMER</div>
                <div className="font-bold text-xs text-teal-400 mt-0.5">CUS-01</div>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed font-sans pt-2 border-t border-slate-800">
              Detect supplier disruptions in seconds, trace cascading stockouts across BOM trees, and autonomously generate Pareto-optimal recovery strategies before SLA penalties trigger.
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Deterministic Math</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>6D Optimization</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Contract RAG</span>
          </div>
        </div>
      </div>

      {/* Right Login / Register Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-slate-900">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isSignUp ? 'Create your Account' : 'Welcome to ChainTwin AI'}
            </h2>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Sign up to deploy digital twin workspaces' : 'Enter your credentials to access the enterprise digital twin'}
            </p>
          </div>

          {/* Quick Demo One-Click Access (for Judges & Testing) */}
          <button
            type="button"
            onClick={quickDemoLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition hover:scale-102"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>One-Click Hackathon Demo Login (Instant Access)</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Or sign in with email</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Corporate Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              {isSignUp ? 'Create Enterprise Account' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            {isSignUp ? 'Already registered?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 font-semibold ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

