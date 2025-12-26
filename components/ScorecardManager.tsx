
import React from 'react';
import { DEFAULT_SCORECARD } from '../constants';

const ScorecardManager: React.FC = () => {
  const grouped = DEFAULT_SCORECARD.reduce((acc: any, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Protocolo v1.2025</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Estrutura oficial quantitativa de auditoria.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-5 py-3 rounded-2xl text-[11px] font-black uppercase shadow-sm border border-blue-100">
          Total: 100 Pontos
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(grouped).map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4 border-l-2 border-l-blue-500">{category}</h3>
            <div className="grid grid-cols-1 gap-3">
              {grouped[category].map((item: any) => (
                <div key={item.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed opacity-80">{item.description}</p>
                  </div>
                  <div className="ml-8 px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-center min-w-[70px] group-hover:border-blue-200 transition-colors">
                    <span className="block text-xl font-black text-slate-800 group-hover:text-blue-600">{item.weight}</span>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">pontos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-8 bg-blue-50 rounded-3xl border border-blue-100">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Tabela de Prazos Técnicos (Neoenergia)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-2xl border border-blue-100">
            <p className="text-xs font-black text-slate-800 mb-2 uppercase">Área Urbana</p>
            <ul className="text-[11px] text-slate-600 space-y-1 font-medium">
              <li>• Prazo: 24 horas úteis</li>
              <li>• Janela: 08:00 às 18:00 (Seg-Sex)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100">
            <p className="text-xs font-black text-slate-800 mb-2 uppercase">Área Rural</p>
            <ul className="text-[11px] text-slate-600 space-y-1 font-medium">
              <li>• Prazo: 48 horas úteis</li>
              <li>• Janela: Segunda a Sexta</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-[10px] text-blue-500 font-bold italic">
          * Exceção: Pedidos na sexta-feira antes das 18h podem ter execução no sábado.
        </p>
      </div>

      <div className="mt-16 p-10 bg-slate-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-10 blur-[100px] -mr-32 -mt-32"></div>
        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-6">Políticas de Auditoria AI</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Lógica de Cálculo</p>
            <p className="text-sm leading-relaxed text-slate-300 font-medium italic">
              "A pontuação é binária por item: Conformidade plena garante o valor integral, não conformidade resulta em zero pontos."
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Regra de Segurança (NCG)</p>
            <p className="text-sm leading-relaxed text-rose-100 font-medium italic opacity-90">
              "Qualquer Falha Grave (NCG) identificada anula integralmente a pontuação da monitoria (Score 0), independentemente dos acertos técnicos."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorecardManager;
