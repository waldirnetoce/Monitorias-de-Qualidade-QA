
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Interaction } from '../types';

interface DashboardProps {
  interactions: Interaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ interactions }) => {
  // Compute true information statistics
  const stats = useMemo(() => {
    const total = interactions.length;
    const conforme = interactions.filter(i => i.result?.evaluationStatus === 'CONFORME').length;
    const naoConforme = interactions.filter(i => i.result?.evaluationStatus === 'NÃO CONFORME').length;
    const ncg = interactions.filter(i => i.result?.evaluationStatus === 'FALHA GRAVE (NCG)').length;
    
    const avgScore = total > 0 
      ? Math.round(interactions.reduce((acc, curr) => acc + (curr.result?.totalScore || 0), 0) / total) 
      : 0;

    const complianceLevel = avgScore >= 90 ? 'ALTO' : avgScore >= 70 ? 'MÉDIO' : 'BAIXO';
    const complianceColor = avgScore >= 90 ? 'text-emerald-600' : avgScore >= 70 ? 'text-amber-600' : 'text-rose-600';

    // Group by date for volume chart
    const volumeByDay: Record<string, number> = {};
    interactions.slice(0, 7).forEach(i => {
      volumeByDay[i.date] = (volumeByDay[i.date] || 0) + 1;
    });

    const volumeData = Object.entries(volumeByDay).map(([name, total]) => ({ name, total }));
    // If empty, show some placeholder structure for the chart
    const finalVolumeData = volumeData.length > 0 ? volumeData : [
      { name: '-', total: 0 }
    ];

    const complianceData = [
      { name: 'Conforme', value: total > 0 ? Math.round((conforme / total) * 100) : 0, color: '#10b981' },
      { name: 'Não Conforme', value: total > 0 ? Math.round((naoConforme / total) * 100) : 0, color: '#f59e0b' },
      { name: 'Falha Grave (NCG)', value: total > 0 ? Math.round((ncg / total) * 100) : 0, color: '#f43f5e' },
    ];

    return { total, conforme, naoConforme, ncg, avgScore, complianceLevel, complianceColor, finalVolumeData, complianceData };
  }, [interactions]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Nível de Compliance</p>
          <h3 className={`text-4xl font-black mt-2 ${stats.complianceColor} tracking-tighter`}>{stats.complianceLevel}</h3>
          <span className="text-slate-400 text-xs font-medium">Média de {stats.avgScore} pts</span>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Auditorias Realizadas</p>
          <h3 className="text-4xl font-black mt-2 text-slate-900 tracking-tighter">{stats.total}</h3>
          <span className="text-blue-500 text-xs font-bold">Total processado</span>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Falhas Graves (NCG)</p>
          <h3 className="text-4xl font-black mt-2 text-rose-500 tracking-tighter">{stats.ncg}</h3>
          <span className="text-slate-400 text-xs font-medium">Casos críticos</span>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Conformidade Plena</p>
          <h3 className="text-4xl font-black mt-2 text-emerald-500 tracking-tighter">{stats.conforme}</h3>
          <span className="text-slate-400 text-xs font-medium">Sucessos absolutos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest">Volume Recente (Por Data)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.finalVolumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest">Distribuição de Status</h4>
          <div className="h-64 flex items-center">
            {interactions.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-1/2 space-y-4 pr-4">
                  {stats.complianceData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-center text-slate-400 text-sm font-medium">
                Nenhum dado para exibir. Inicie uma monitoria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
