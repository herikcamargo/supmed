import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Pill,
  FlaskConical,
  Stethoscope,
  AlertCircle,
  Info
} from 'lucide-react';

export default function AuditoriaClinica() {
  const [conduta, setConduta] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultado, setResultado] = useState(null);

  const analisarConduta = async () => {
    if (!conduta.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Você é um auditor clínico experiente. Analise a seguinte conduta médica e identifique INCONSISTÊNCIAS e RISCOS:

          CONDUTA:
          ${conduta}

          Verifique:
          1. DOSES INCOERENTES: Doses fora do padrão, subdoses, superdoses, doses não ajustadas para função renal/hepática
          2. EXAMES CONTRADITÓRIOS: Exames que não fazem sentido para o diagnóstico, exames faltantes essenciais
          3. DIAGNÓSTICOS IMPROVÁVEIS: Diagnósticos que não combinam com a apresentação, diagnósticos mutuamente excludentes
          4. RISCOS NÃO CONSIDERADOS: Interações medicamentosas, contraindicações não observadas, red flags ignorados
          5. BOAS PRÁTICAS: O que está correto e bem indicado

          Seja específico e cite as evidências quando possível.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            resumo_geral: { type: 'string' },
            nivel_risco: { type: 'string', enum: ['baixo', 'moderado', 'alto', 'critico'] },
            doses_incoerentes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  medicamento: { type: 'string' },
                  problema: { type: 'string' },
                  recomendacao: { type: 'string' },
                  gravidade: { type: 'string' }
                }
              }
            },
            exames_contraditorios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  exame: { type: 'string' },
                  problema: { type: 'string' },
                  sugestao: { type: 'string' }
                }
              }
            },
            diagnosticos_improvaveis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  diagnostico: { type: 'string' },
                  motivo: { type: 'string' },
                  alternativa: { type: 'string' }
                }
              }
            },
            riscos_nao_considerados: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risco: { type: 'string' },
                  descricao: { type: 'string' },
                  acao_recomendada: { type: 'string' }
                }
              }
            },
            boas_praticas: {
              type: 'array',
              items: { type: 'string' }
            },
            acoes_imediatas: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setResultado(response);
    } catch (error) {
      console.error('Erro na análise:', error);
    }
    
    setIsAnalyzing(false);
  };

  const getNivelRiscoConfig = (nivel) => {
    const configs = {
      baixo: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      moderado: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
      alto: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
      critico: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    return configs[nivel] || configs.moderado;
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card className="bg-white/80 border border-slate-200/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-violet-600" />
            <h3 className="text-xs font-semibold text-slate-700">Auditoria Clínica</h3>
            <Badge variant="outline" className="text-[8px]">IA</Badge>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Cole sua conduta médica (diagnóstico, prescrição, exames) para análise de inconsistências
          </p>
          <Textarea
            placeholder={`Exemplo:
Diagnóstico: Pneumonia comunitária
Prescrição:
- Amoxicilina 500mg 8/8h
- Dipirona 1g 6/6h
Exames: Hemograma, PCR, Raio-X tórax`}
            className="min-h-[120px] text-sm"
            value={conduta}
            onChange={(e) => setConduta(e.target.value)}
          />
          <Button 
            onClick={analisarConduta} 
            disabled={isAnalyzing || !conduta.trim()}
            className="w-full mt-3 h-9 text-xs bg-violet-600 hover:bg-violet-700"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Analisando...</>
            ) : (
              <><ShieldAlert className="w-3.5 h-3.5 mr-1" /> Analisar Conduta</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-3">
          {/* Resumo e Nível de Risco */}
          <Card className={`border ${getNivelRiscoConfig(resultado.nivel_risco).bg}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Resultado da Auditoria</span>
                <Badge className={`${getNivelRiscoConfig(resultado.nivel_risco).bg} ${getNivelRiscoConfig(resultado.nivel_risco).text} text-[10px]`}>
                  Risco {resultado.nivel_risco?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{resultado.resumo_geral}</p>
            </CardContent>
          </Card>

          {/* Ações Imediatas */}
          {resultado.acoes_imediatas?.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Ações Imediatas Necessárias
                </h4>
                <ul className="space-y-1">
                  {resultado.acoes_imediatas.map((acao, i) => (
                    <li key={i} className="text-[10px] text-red-700 flex items-start gap-1">
                      <span className="text-red-500">⚠️</span> {acao}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Doses Incoerentes */}
          {resultado.doses_incoerentes?.length > 0 && (
            <Card className="bg-white/80 border border-slate-200/50">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-orange-500" /> Doses Incoerentes
                </h4>
                <div className="space-y-2">
                  {resultado.doses_incoerentes.map((item, i) => (
                    <div key={i} className="p-2 bg-orange-50 rounded border border-orange-100">
                      <p className="text-xs font-medium text-orange-800">{item.medicamento}</p>
                      <p className="text-[10px] text-orange-700">{item.problema}</p>
                      <p className="text-[10px] text-slate-600 mt-1">✓ {item.recomendacao}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exames Contraditórios */}
          {resultado.exames_contraditorios?.length > 0 && (
            <Card className="bg-white/80 border border-slate-200/50">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-500" /> Exames Contraditórios
                </h4>
                <div className="space-y-2">
                  {resultado.exames_contraditorios.map((item, i) => (
                    <div key={i} className="p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="text-xs font-medium text-blue-800">{item.exame}</p>
                      <p className="text-[10px] text-blue-700">{item.problema}</p>
                      <p className="text-[10px] text-slate-600 mt-1">💡 {item.sugestao}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnósticos Improváveis */}
          {resultado.diagnosticos_improvaveis?.length > 0 && (
            <Card className="bg-white/80 border border-slate-200/50">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-purple-500" /> Diagnósticos Improváveis
                </h4>
                <div className="space-y-2">
                  {resultado.diagnosticos_improvaveis.map((item, i) => (
                    <div key={i} className="p-2 bg-purple-50 rounded border border-purple-100">
                      <p className="text-xs font-medium text-purple-800">{item.diagnostico}</p>
                      <p className="text-[10px] text-purple-700">{item.motivo}</p>
                      <p className="text-[10px] text-slate-600 mt-1">🔄 Alternativa: {item.alternativa}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Riscos Não Considerados */}
          {resultado.riscos_nao_considerados?.length > 0 && (
            <Card className="bg-white/80 border border-slate-200/50">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Riscos Não Considerados
                </h4>
                <div className="space-y-2">
                  {resultado.riscos_nao_considerados.map((item, i) => (
                    <div key={i} className="p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-xs font-medium text-red-800">{item.risco}</p>
                      <p className="text-[10px] text-red-700">{item.descricao}</p>
                      <p className="text-[10px] text-slate-600 mt-1">🎯 {item.acao_recomendada}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boas Práticas */}
          {resultado.boas_praticas?.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Boas Práticas Identificadas
                </h4>
                <ul className="space-y-1">
                  {resultado.boas_praticas.map((item, i) => (
                    <li key={i} className="text-[10px] text-green-700 flex items-start gap-1">
                      <span>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}