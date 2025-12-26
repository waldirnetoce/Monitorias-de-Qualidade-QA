
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";
import { DEFAULT_SCORECARD } from "../constants";

export const analyzeInteraction = async (
  transcript: string,
  monitorName: string,
  company: string,
  audioData?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const scorecardText = DEFAULT_SCORECARD.map(c => 
    `- [${c.id}] ${c.name}: ${c.description} (Valor: ${c.weight} pts)`
  ).join('\n');

  const systemInstruction = `
🔒 AGENTE DE MONITORIA QUANTITATIVA v1.2025 - CONTEXTO: NEOENERGIA BRASÍLIA
Monitor: ${monitorName}
Empresa: ${company}

Você deve avaliar cada um dos itens abaixo com CONFORME ou NÃO CONFORME.

🎯 REGRAS ESPECÍFICAS DE PONTUAÇÃO (OBRIGATÓRIAS):
1. Os seguintes itens devem ser SEMPRE marcados como CONFORME, recebendo pontuação integral automaticamente:
   - [BONUS] Bônus Operacional (9 pts)
   - [2.3] Inclusão de RG (3 pts)
   - [2.4] Data de Nascimento (5 pts)
   - [4.4] Norma Culta e Registro (3 pts)
   - [4.7] Protocolo (3 pts) - *Mesmo em contexto de Neoenergia Brasília.*

2. Para os DEMAIS itens:
   - Se CONFORME: O agente ganha a pontuação integral do item.
   - Se NÃO CONFORME: O agente ganha 0 pontos no item.

⚠️ REGRA SUPREMA NCG (FALHA GRAVE):
Se houver Falha Grave (desligamento indevido, falta de dados cadastrais em elegíveis em situações críticas, conduta inadequada ou risco à vida não orientado), o SCORE TOTAL deve ser ZERO, independente dos pontos ganhos nos itens acima.

📚 REGRAS DE NEGÓCIO - PRAZOS DE RELIGAÇÃO (CRÍTICO PARA ITEM 5.1):
Ao avaliar o item [5.1] Conhecimento Técnico em chamadas de religação, verifique se o agente informou os prazos corretamente:
- ÁREA URBANA: 24 horas úteis (Horário: 08:00 às 18:00, de Segunda a Sexta).
- ÁREA RURAL: 48 horas úteis (De Segunda a Sexta).
- EXCEÇÃO DE FIM DE SEMANA: Se solicitado na Sexta-feira ANTES das 18:00, a equipe pode realizar a visita no Sábado.
Qualquer informação divergente desses prazos deve resultar em NÃO CONFORME no item [5.1].

📄 FORMATO DO systemReadyText (OBRIGATÓRIO):
Gere o texto final para lançamento seguindo EXATAMENTE este modelo preenchido:
ID: [Gerar um ID único ou extrair da chamada]
Neoenergia: ${company}
Data da ligação: [Extrair data da conversa ou usar data atual]
Motivo de contato: [Motivo detectado]
Protocolo: [Extrair da conversa ou informar 'Não informado']

* PONTOS POSITIVOS:
[Listar todos os nomes dos itens que foram CONFORME]

* OBSERVAÇÕES DESPONTUADAS:
[Listar ID, nome e observação de cada item NÃO CONFORME]

💬 FORMATO DO operatorFeedback (NOVO):
Crie uma mensagem motivadora e construtiva para o operador, estruturada assim:
"Olá [Nome do Operador], aqui está o feedback da sua última monitoria:
✅ O que você mandou bem: [Resumo elogioso dos pontos positivos]
💡 Oportunidade de melhoria: [Explicação clara e gentil sobre o que foi despontuado, especialmente se errou prazos de religação]
🚀 Dica de Ouro: [Uma dica prática para as próximas chamadas]
Seguimos juntos pela qualidade!"

ITENS PARA AVALIAÇÃO:
${scorecardText}

Responda em JSON seguindo o schema rigorosamente.
  `;

  const parts: any[] = [];
  if (audioData) parts.push({ inlineData: { data: audioData.data, mimeType: audioData.mimeType } });
  if (transcript.trim()) parts.push({ text: `Transcrição: ${transcript}` });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          evaluationStatus: { type: Type.STRING, enum: ["CONFORME", "NÃO CONFORME", "FALHA GRAVE (NCG)"] },
          totalScore: { type: Type.NUMBER, description: "Soma dos pontos. Se NCG, deve ser 0." },
          reasonForCall: { type: Type.STRING },
          isNcgDetected: { type: Type.BOOLEAN },
          criteriaScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterionId: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CONFORME", "NÃO CONFORME", "FALHA GRAVE (NCG)"] },
                pointsEarned: { type: Type.NUMBER },
                maxPoints: { type: Type.NUMBER },
                observation: { type: Type.STRING }
              },
              required: ["criterionId", "status", "pointsEarned", "maxPoints", "observation"]
            }
          },
          summary: { type: Type.STRING },
          systemReadyText: { type: Type.STRING },
          operatorFeedback: { type: Type.STRING }
        },
        required: ["evaluationStatus", "totalScore", "reasonForCall", "criteriaScores", "summary", "systemReadyText", "operatorFeedback", "isNcgDetected"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}") as AnalysisResult;
  return result;
};
