
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AnalysisTool from './components/AnalysisTool';
import History from './components/History';
import ScorecardManager from './components/ScorecardManager';
import { Interaction, AnalysisResult } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  // Load interactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qualitymind_interactions');
    if (saved) {
      try {
        setInteractions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load interactions", e);
      }
    }
  }, []);

  // Save interactions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('qualitymind_interactions', JSON.stringify(interactions));
  }, [interactions]);

  const handleSaveInteraction = (agentName: string, transcript: string, result: AnalysisResult) => {
    const newInteraction: Interaction = {
      id: crypto.randomUUID(),
      agentName,
      date: new Date().toLocaleDateString('pt-BR'),
      transcript,
      result
    };
    setInteractions(prev => [newInteraction, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard interactions={interactions} />;
      case 'analyze':
        return <AnalysisTool onSave={handleSaveInteraction} />;
      case 'history':
        return <History interactions={interactions} />;
      case 'scorecard':
        return <ScorecardManager />;
      default:
        return <Dashboard interactions={interactions} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-700 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-12 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">
              {activeTab === 'dashboard' && 'Visão Geral'}
              {activeTab === 'analyze' && 'Monitoria AI'}
              {activeTab === 'history' && 'Histórico'}
              {activeTab === 'scorecard' && 'Scorecard'}
            </h2>
            <div className="flex items-center space-x-2 mt-3">
              <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Quality Management System</p>
            </div>
          </div>
          <div className="flex space-x-3">
             <div className="px-4 py-2 bg-white text-blue-600 rounded-2xl text-[10px] font-black border border-slate-200 flex items-center shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
               IA: GEMINI 3 PRO ACTIVE
             </div>
          </div>
        </header>

        <div className="relative">
          {renderContent()}
        </div>

        <footer className="mt-24 pt-10 border-t border-slate-200 flex flex-col items-center">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">QualityMind AI Engine</div>
          <p className="text-slate-400 text-[10px] font-bold">© 2025 QualityMind AI - All rights reserved</p>
        </footer>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
