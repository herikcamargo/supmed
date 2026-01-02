import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Brain,
  Loader2,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Eye,
  ChevronRight
} from 'lucide-react';

// Manchester Triage Colors
const manchesterColors = {
  vermelho: { label: 'Vermelho', tempo: 'Imediato', bg: 'bg-red-500', text: 'text-white' },
  laranja: { label: 'Laranja', tempo: 'Até 10 min', bg: 'bg-orange-500', text: 'text-white' },
  amarelo: { label: 'Amarelo', tempo: 'Até 60 min', bg: 'bg-yellow-400', text: 'text-slate-900' },
  verde: { label: 'Verde', tempo: 'Até 120 min', bg: 'bg-green-500', text: 'text-white' },
  azul: { label: 'Azul', tempo: 'Até 240 min', bg: 'bg-blue-500', text: 'text-white' }
};

// SAMU Priority
const samuPriority = {
  vermelho: { label: 'Prioridade 0 - Emergência', descricao: 'Risco imediato de vida' },
  laranja: { label: 'Prioridade 1 - Urgência', descricao: 'Potencial risco de vida' },
  amarelo: { label: 'Prioridade 2 - Pouco Urgente', descricao: 'Necessita atendimento' },
  verde: { label: 'Prioridade 3 - Não Urgente', descricao: 'Pode aguardar' },
  azul: { label: 'Orientação', descricao: 'Não necessita emergência' }
};

// Escalas disponíveis
const escalasDisponiveis = [
  { id: 'news', nome: 'NEWS', descricao: 'National Early Warning Score' },
  { id: 'sirs', nome: 'SIRS', descricao: 'Síndrome da Resposta Inflamatória Sistêmica' },
  { id: 'qsofa', nome: 'qSOFA', descricao: 'Quick SOFA para Sepse' },
  { id: 'sofa', nome: 'SOFA', descricao: 'Sequential Organ Failure Assessment' },
  { id: 'nihss', nome: 'NIHSS', descricao: 'NIH Stroke Scale' },
  { id: 'glasgow', nome: 'Glasgow', descricao: 'Escala de Coma de Glasgow' },
  { id: 'wells_tep', nome: 'Wells TEP', descricao: 'Probabilidade de TEP' },
  { id: 'timi', nome: 'TIMI', descricao: 'Risco coronariano' },
  { id: 'grace', nome: 'GRACE', descricao: 'Risco SCA' },
  { id: 'curb65', nome: 'CURB-65', descricao: 'Gravidade Pneumonia' }
];

export default function PlantonistaTriagem() {
  const [activeTab, setActiveTab] = useState('ia');
  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [sinaisVitais, setSinaisVitais] = useState({
    fc: '', pa_sistolica: '', pa_diastolica: '', fr: '', temp: '', spo2: '', glasgow: '15'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Triagem Manual
  const [manchesterManual, setManchesterManual] = useState('');
  const [samuManual, setSamuManual] = useState('');

  const realizarTriagemIA = async () => {
    if (!queixaPrincipal.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Você é um médico emergencista experiente. Realize uma triagem completa baseada nas informações:

          QUEIXA PRINCIPAL: ${queixaPrincipal}
          SINAIS VITAIS:
          - FC: ${sinaisVitais.fc || 'NI'} bpm
          - PA: ${sinaisVitais.pa_sistolica || 'NI'}x${sinaisVitais.pa_diastolica || 'NI'} mmHg
          - FR: ${sinaisVitais.fr || 'NI'} irpm
          - Temp: ${sinaisVitais.temp || 'NI'} °C
          - SpO2: ${sinaisVitais.spo2 || 'NI'} %
          - Glasgow: ${sinaisVitais.glasgow || '15'}

          Forneça:
          1. Classificação Manchester (vermelho/laranja/amarelo/verde/azul)
          2. Classificação SAMU
          3. Red Flags identificados
          4. Escalas recomendadas para aplicar
          5. Diagnósticos diferenciais principais
          6. Exames iniciais sugeridos
          7. Conduta imediata
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            manchester: { type: 'string', enum: ['vermelho', 'laranja', 'amarelo', 'verde', 'azul'] },
            manchester_justificativa: { type: 'string' },
            samu: { type: 'string', enum: ['vermelho', 'laranja', 'amarelo', 'verde', 'azul'] },
            samu_justificativa: { type: 'string' },
            red_flags: { type: 'array', items: { type: 'string' } },
            escalas_recomendadas: { type: 'array', items: { type: 'string' } },
            diagnosticos_diferenciais: { type: 'array', items: { type: 'string' } },
            exames_sugeridos: { type: 'array', items: { type: 'string' } },
            conduta_imediata: { type: 'array', items: { type: 'string' } },
            news_score: { type: 'number' },
            observacoes: { type: 'string' }
          }
        }
      });

      setResultado(response);
    } catch (error) {
      console.error('Erro na triagem:', error);
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 border border-slate-200/50 p-0.5 h-8">
          <TabsTrigger value="ia" className="text-[10px] h-7 gap-1">
            <Brain className="w-3 h-3" /> Triagem IA
          </TabsTrigger>
          <TabsTrigger value="manchester" className="text-[10px] h-7">Manchester</TabsTrigger>
          <TabsTrigger value="samu" className="text-[10px] h-7">SAMU</TabsTrigger>
          <TabsTrigger value="escalas" className="text-[10px] h-7">Escalas</TabsTrigger>
        </TabsList>

        {/* TRIAGEM IA */}
        <TabsContent value="ia" className="mt-3">
          <Card className="bg-white/80 border border-slate-200/50">
            <CardContent className="p-3 space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Queixa Principal</label>
                <Textarea
                  placeholder="Descreva a queixa principal, tempo de início, sintomas associados..."
                  className="min-h-[80px] text-sm"
                  value={queixaPrincipal}
                  onChange={(e) => setQueixaPrincipal(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-2 block">Sinais Vitais</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">FC (bpm)</span>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="80"
                      value={sinaisVitais.fc}
                      onChange={(e) => setSinaisVitais({...sinaisVitais, fc: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">PA Sist</span>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="120"
                      value={sinaisVitais.pa_sistolica}
                      onChange={(e) => setSinaisVitais({...sinaisVitais, pa_sistolica: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">PA Diast</span>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="80"
                      value={sinaisVitais.pa_diastolica}
                      onChange={(e) => setSinaisVitais({...sinaisVitais, pa_diastolica: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">FR (irpm)</span>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="16"
                      value={sinaisVitais.fr}
                      onChange={(e) => setSinaisVitais({...sinaisVitais, fr: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Temp (°C)</span>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="36.5"
                      value={sinaisVitais.temp}
                      onChange={(e) => setSinaisVitais({...sinaisVitais, temp: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">SpO2 (%)</span>
                    <Input 
                      className="h-7 text-xs" 
                      placeholder="98"
                      value={sinaisVitais.spo2}
                      onChange={(e) => setSinaisVitais({...sinaisVitais, spo2: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400">Glasgow</span>
                    <Select value={sinaisVitais.glasgow} onValueChange={(v) => setSinaisVitais({...sinaisVitais, glasgow: v})}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[15,14,13,12,11,10,9,8,7,6,5,4,3].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={realizarTriagemIA}
                disabled={isAnalyzing || !queixaPrincipal.trim()}
                className="w-full h-9 text-xs bg-red-600 hover:bg-red-700"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Analisando...</>
                ) : (
                  <><Brain className="w-3.5 h-3.5 mr-1" /> Realizar Triagem Automática</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado da Triagem */}
          {resultado && (
            <div className="space-y-3 mt-3">
              {/* Classificações */}
              <div className="grid grid-cols-2 gap-3">
                <Card className={`${manchesterColors[resultado.manchester]?.bg}`}>
                  <CardContent className="p-3">
                    <p className={`text-[10px] ${manchesterColors[resultado.manchester]?.text} opacity-80`}>MANCHESTER</p>
                    <p className={`text-sm font-bold ${manchesterColors[resultado.manchester]?.text}`}>
                      {manchesterColors[resultado.manchester]?.label}
                    </p>
                    <p className={`text-[10px] ${manchesterColors[resultado.manchester]?.text} opacity-80`}>
                      {manchesterColors[resultado.manchester]?.tempo}
                    </p>
                  </CardContent>
                </Card>
                <Card className={`${manchesterColors[resultado.samu]?.bg}`}>
                  <CardContent className="p-3">
                    <p className={`text-[10px] ${manchesterColors[resultado.samu]?.text} opacity-80`}>SAMU</p>
                    <p className={`text-sm font-bold ${manchesterColors[resultado.samu]?.text}`}>
                      {samuPriority[resultado.samu]?.label}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Red Flags */}
              {resultado.red_flags?.length > 0 && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
                    </h4>
                    <ul className="space-y-1">
                      {resultado.red_flags.map((flag, i) => (
                        <li key={i} className="text-[10px] text-red-700">⚠️ {flag}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Escalas Recomendadas */}
              {resultado.escalas_recomendadas?.length > 0 && (
                <Card className="bg-white/80 border border-slate-200/50">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Escalas Recomendadas</h4>
                    <div className="flex flex-wrap gap-1">
                      {resultado.escalas_recomendadas.map((esc, i) => (
                        <Badge key={i} className="text-[10px] bg-blue-100 text-blue-700">
                          {esc}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Diagnósticos Diferenciais */}
              {resultado.diagnosticos_diferenciais?.length > 0 && (
                <Card className="bg-white/80 border border-slate-200/50">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Diagnósticos Diferenciais</h4>
                    <ul className="space-y-0.5">
                      {resultado.diagnosticos_diferenciais.map((dx, i) => (
                        <li key={i} className="text-xs text-slate-600">• {dx}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Conduta Imediata */}
              {resultado.conduta_imediata?.length > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-emerald-700 mb-2">Conduta Imediata</h4>
                    <ol className="space-y-1">
                      {resultado.conduta_imediata.map((item, i) => (
                        <li key={i} className="text-xs text-emerald-700">{i+1}. {item}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* MANCHESTER MANUAL */}
        <TabsContent value="manchester" className="mt-3">
          <Card className="bg-white/80 border border-slate-200/50">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-3">Protocolo de Manchester</h4>
              <div className="space-y-2">
                {Object.entries(manchesterColors).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setManchesterManual(key)}
                    className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                      manchesterManual === key ? `${config.bg} ${config.text}` : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${config.bg}`} />
                      <span className="text-xs font-medium">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">{config.tempo}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAMU MANUAL */}
        <TabsContent value="samu" className="mt-3">
          <Card className="bg-white/80 border border-slate-200/50">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-3">Classificação SAMU</h4>
              <div className="space-y-2">
                {Object.entries(samuPriority).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSamuManual(key)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      samuManual === key 
                        ? `${manchesterColors[key].bg} ${manchesterColors[key].text}` 
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs font-medium">{config.label}</p>
                    <p className="text-[10px] opacity-80">{config.descricao}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESCALAS */}
        <TabsContent value="escalas" className="mt-3">
          <div className="grid md:grid-cols-2 gap-2">
            {escalasDisponiveis.map((escala) => (
              <Card key={escala.id} className="bg-white/80 border border-slate-200/50 hover:border-blue-300 cursor-pointer transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{escala.nome}</p>
                    <p className="text-[10px] text-slate-500">{escala.descricao}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}