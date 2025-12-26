
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
    { id: 'analyze', label: 'Nova Análise', icon: '🔍' },
    { id: 'history', label: 'Histórico', icon: '📜' },
    { id: 'scorecard', label: 'Critérios (Scorecard)', icon: '📝' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col p-4 border-r border-white/5">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          QualityMind AI
        </h1>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Monitoria Inteligente</p>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black italic">QM</div>
          <div>
            <p className="text-xs font-bold text-white">QA Analyst</p>
            <p className="text-[9px] text-slate-500 uppercase font-black">Admin Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
