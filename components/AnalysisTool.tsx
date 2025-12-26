
import React, { useState, useRef } from 'react';
import { analyzeInteraction } from '../services/geminiService';
import { DEFAULT_SCORECARD } from '../constants';
import { AnalysisResult } from '../types';

interface AnalysisToolProps {
  onSave: (agentName: string, transcript: string, result: AnalysisResult) => void;
}

const AnalysisTool: React.FC<AnalysisToolProps> = ({ onSave }) => {
  const [transcript, setTranscript] = useState('');
  const [agentName, setAgentName] = useState('');
  const [monitorName, setMonitorName] = useState('');
  const [company, setCompany] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClear = () => {
    setTranscript('');
    setAgentName('');
    setMonitorName('');
    setCompany('');
    setAudioFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim() && !audioFile) {
        setError('Por favor, insira uma transcrição ou anexe um arquivo de áudio.');
        return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      let audioData;
      if (audioFile) {
        audioData = { data: await fileToBase64(audioFile), mimeType: audioFile.type || 'audio/mpeg' };
      }
      const data = await analyzeInteraction(transcript, monitorName, company, audioData);
      setResult(data);
      // Save to global history
      onSave(agentName || 'Operador Não Identificado', transcript, data);
    } catch (err: any) {
      console.error(err);
      setError('Erro na análise. Verifique sua conexão e chave de API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const groupedCriteria = result?.criteriaScores.reduce((acc: any, curr) => {
    const meta = DEFAULT_SCORECARD.find(sc => sc.id === curr.criterionId);
    const category = meta?.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...curr, name: meta?.name });
    return acc;
  }, {});

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copiado com sucesso!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Nova Auditoria v1.2025</h2>
          <div className="flex space-x-2">
            <button 
                onClick={handleClear}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full font-black text-slate-500 uppercase tracking-widest border border-slate-200 transition-colors"
            >
                Limpar Campos
            </button>
            <div className="text-[10px] bg-blue-50 px-3 py-1.5 rounded-full font-black text-blue-600 uppercase tracking-widest border border-blue-100">
                Protocolo Quantitativo
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input 
              type="text" 
              value={monitorName}
              onChange={(e) => setMonitorName(e.target.value)}
              placeholder="Nome do Monitor"
              className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
            />
            <input 
              type="text" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Empresa"
              className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
            />
            <input 
              type="text" 
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Nome do Operador"
              className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
            />
            <div 
              className={`relative border-2 border-dashed rounded-2xl px-4 py-4 transition-all flex items-center justify-between ${
                audioFile ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <span className="text-sm font-semibold truncate text-slate-600">{audioFile ? audioFile.name : 'Anexar Gravação (MP3/WAV)'}</span>
              <button onClick={() => audioFile ? setAudioFile(null) : fileInputRef.current?.click()} className="text-[10px] font-black uppercase text-blue-600 hover:underline">
                {audioFile ? 'Remover' : 'Procurar'}
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setAudioFile(e.target.files[0])} accept="audio/*" className="hidden" />
            </div>
          </div>
          
          <textarea 
            rows={5}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Insira a transcrição se disponível..."
            className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-sm"
          />

          {error && <p className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>}

          <div className="flex space-x-3">
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-lg shadow-slate-900/10"
            >
                {isAnalyzing ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <span>INICIAR MONITORIA INTELIGENTE</span>}
            </button>
            <button
                onClick={handleClear}
                className="px-8 bg-white text-slate-400 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
                LIMPAR
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="animate-slideUp space-y-6">
          <div className="flex justify-end">
             <button 
                onClick={handleClear}
                className="bg-blue-600 text-white text-[10px] font-black px-6 py-3 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest"
             >
                Realizar Nova Auditoria
             </button>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score do Atendimento</p>
              <h3 className={`text-7xl font-black tracking-tighter ${result.totalScore >= 90 ? 'text-emerald-500' : result.totalScore >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                {result.totalScore}<span className="text-2xl opacity-30">/100</span>
              </h3>
              <div className="mt-4 flex items-center space-x-2">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${result.evaluationStatus === 'CONFORME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                   {result.evaluationStatus}
                 </span>
                 {result.isNcgDetected && <span className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase animate-pulse">Falha Grave Detectada</span>}
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 w-full md:w-1/2">
               <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Motivo Detectado</h4>
               <p className="text-lg font-bold text-slate-800">{result.reasonForCall}</p>
               <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 text-xs text-slate-500 italic leading-relaxed">
                 "{result.summary}"
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {Object.keys(groupedCriteria).map(category => (
                <div key={category} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-black text-[11px] uppercase tracking-[0.1em] text-slate-500">{category}</h4>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {groupedCriteria[category].map((item: any) => (
                      <div key={item.criterionId} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors group">
                        <div className="max-w-[80%]">
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed opacity-80">{item.observation}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-black ${item.pointsEarned > 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                            {item.pointsEarned > 0 ? `+${item.pointsEarned}` : '0'}
                          </span>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">max: {item.maxPoints}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lançamento em Sistema</h4>
                  <button onClick={() => copyToClipboard(result.systemReadyText, 'Lançamento')} className="text-[10px] bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-xl transition-all font-black uppercase">COPIAR</button>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-[12px] font-mono leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto custom-scrollbar">
                  {result.systemReadyText}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Feedback para Operador</h4>
                    <button onClick={() => copyToClipboard(result.operatorFeedback, 'Feedback')} className="text-[10px] bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-xl transition-all font-black uppercase">ENCAMINHAR</button>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-[12px] font-sans leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto custom-scrollbar italic opacity-90">
                    {result.operatorFeedback}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                      Protocolo Validado via QualityMind AI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AnalysisTool;
