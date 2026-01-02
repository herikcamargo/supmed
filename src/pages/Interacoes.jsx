import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { 
  Zap, 
  Search,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Brain,
  Activity,
  Heart,
  Droplets,
  Pill,
  Filter,
  Lightbulb,
  BookOpen,
  History,
  Network,
  ArrowRight,
  Shield
} from 'lucide-react';

import InteracoesVisualMap from '../components/interacoes/InteracoesVisualMap';

// Medicamentos comuns para seleção rápida
const medicamentosComuns = [
  'Dipirona', 'Paracetamol', 'Ibuprofeno', 'AAS', 'Naproxeno',
  'Amoxicilina', 'Azitromicina', 'Ciprofloxacino', 'Ceftriaxona',
  'Omeprazol', 'Pantoprazol', 'Ranitidina',
  'Losartana', 'Enalapril', 'Captopril', 'Anlodipino',
  'Metformina', 'Glibenclamida', 'Insulina NPH',
  'Varfarina', 'Enoxaparina', 'Rivaroxabana', 'Clopidogrel',
  'Furosemida', 'Hidroclorotiazida', 'Espironolactona',
  'Amitriptilina', 'Fluoxetina', 'Sertralina', 'Diazepam', 'Clonazepam',
  'Prednisona', 'Dexametasona', 'Hidrocortisona',
  'Tramadol', 'Morfina', 'Codeína',
  'Sinvastatina', 'Atorvastatina',
  'Metoclopramida', 'Ondansetrona', 'Bromoprida'
];

// Classes terapêuticas
const classesTerapeuticas = {
  'aines': ['Ibuprofeno', 'Naproxeno', 'Diclofenaco', 'Meloxicam', 'Piroxicam', 'Cetoprofeno'],
  'analgesicos': ['Dipirona', 'Paracetamol', 'Tramadol', 'Morfina', 'Codeína'],
  'anticoagulantes': ['Varfarina', 'Enoxaparina', 'Rivaroxabana', 'Apixabana', 'Dabigatrana'],
  'antiagreegantes': ['AAS', 'Clopidogrel', 'Ticagrelor'],
  'anti_hipertensivos': ['Losartana', 'Enalapril', 'Captopril', 'Anlodipino', 'Atenolol'],
  'diureticos': ['Furosemida', 'Hidroclorotiazida', 'Espironolactona'],
  'antibioticos': ['Amoxicilina', 'Azitromicina', 'Ciprofloxacino', 'Ceftriaxona', 'Metronidazol']
};

const riscoConfig = {
  4: { label: 'GRAVE', color: 'bg-red-600', textColor: 'text-red-700', bgLight: 'bg-red-50', border: 'border-red-300', icon: AlertTriangle },
  3: { label: 'ALTO', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-300', icon: AlertCircle },
  2: { label: 'MODERADO', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-300', icon: Info },
  1: { label: 'BAIXO', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200', icon: Info },
  0: { label: 'SEM INTERAÇÃO', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 }
};

export default function Interacoes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [medicamentos, setMedicamentos] = useState([]);
  const [inputMed, setInputMed] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [activeTab, setActiveTab] = useState('lista');
  const [filtroRisco, setFiltroRisco] = useState('todos');
  const [filtroOrgao, setFiltroOrgao] = useState('todos');
  const [explicacaoAberta, setExplicacaoAberta] = useState(null);
  const [explicacaoIA, setExplicacaoIA] = useState('');
  const [loadingExplicacao, setLoadingExplicacao] = useState(false);
  const [historicoAnalises, setHistoricoAnalises] = useState([]);

  const adicionarMedicamento = (med) => {
    const nome = med || inputMed.trim();
    if (nome && !medicamentos.includes(nome)) {
      setMedicamentos([...medicamentos, nome]);
      setInputMed('');
      setResultado(null);
    }
  };

  const removerMedicamento = (med) => {
    setMedicamentos(medicamentos.filter(m => m !== med));
    setResultado(null);
  };

  const analisarInteracoes = async () => {
    if (medicamentos.length < 2) return;
    
    setIsAnalyzing(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um farmacêutico clínico especialista em interações medicamentosas. Analise TODAS as possíveis interações entre os seguintes medicamentos:

MEDICAMENTOS: ${medicamentos.join(', ')}

Para CADA PAR de medicamentos, analise:
1. Se há interação conhecida
2. Nível de risco (0-4): 0=sem interação, 1=baixo, 2=moderado, 3=alto, 4=grave/contraindicado
3. Tipo: farmacodinâmica, farmacocinética, duplicidade, sinergismo tóxico
4. Mecanismo detalhado
5. Órgãos afetados: renal, hepático, cardíaco (QT), hematológico
6. Conduta recomendada
7. Alternativa mais segura (se aplicável)

IMPORTANTE: Analise TODAS as combinações possíveis. Seja específico e baseado em evidências.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          interacoes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                med1: { type: 'string' },
                med2: { type: 'string' },
                risco: { type: 'number' },
                tipo: { type: 'string' },
                mecanismo: { type: 'string' },
                conduta: { type: 'string' },
                orgaos_afetados: { type: 'array', items: { type: 'string' } },
                alternativa: { type: 'string' },
                evidencia: { type: 'string' },
                prolongamento_qt: { type: 'boolean' },
                risco_sangramento: { type: 'boolean' },
                competicao_cyp450: { type: 'string' }
              }
            }
          },
          duplicidades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                medicamentos: { type: 'array', items: { type: 'string' } },
                classe: { type: 'string' },
                risco: { type: 'string' },
                recomendacao: { type: 'string' }
              }
            }
          },
          resumo: {
            type: 'object',
            properties: {
              total_interacoes: { type: 'number' },
              graves: { type: 'number' },
              altas: { type: 'number' },
              moderadas: { type: 'number' },
              leves: { type: 'number' },
              alerta_geral: { type: 'string' }
            }
          }
        }
      }
    });
    
    setResultado(response);
    setIsAnalyzing(false);
    
    // Salvar no histórico
    setHistoricoAnalises(prev => [{
      data: new Date().toISOString(),
      medicamentos: [...medicamentos],
      resumo: response.resumo
    }, ...prev.slice(0, 9)]);
  };

  const explicarInteracao = async (interacao) => {
    setExplicacaoAberta(interacao);
    setLoadingExplicacao(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Explique de forma simples e didática a interação entre ${interacao.med1} e ${interacao.med2}:

Mecanismo: ${interacao.mecanismo}
Tipo: ${interacao.tipo}

Forneça uma explicação que um paciente ou estudante de medicina possa entender, incluindo:
1. Por que esses medicamentos interagem
2. O que acontece no corpo
3. Quais os riscos práticos
4. Como minimizar o problema

Use linguagem clara e exemplos se necessário.`
    });
    
    setExplicacaoIA(response);
    setLoadingExplicacao(false);
  };

  const interacoesFiltradas = resultado?.interacoes?.filter(int => {
    if (filtroRisco !== 'todos' && int.risco !== parseInt(filtroRisco)) return false;
    if (filtroOrgao !== 'todos' && !int.orgaos_afetados?.includes(filtroOrgao)) return false;
    return true;
  }) || [];

  const interacoesGraves = interacoesFiltradas.filter(i => i.risco >= 3);
  const interacoesModeradas = interacoesFiltradas.filter(i => i.risco === 2);
  const interacoesLeves = interacoesFiltradas.filter(i => i.risco === 1);
  const semInteracao = interacoesFiltradas.filter(i => i.risco === 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Interações Medicamentosas</h1>
              <p className="text-xs text-slate-500">Análise inteligente de interações e riscos</p>
            </div>
          </div>

          {/* Input de Medicamentos */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
            <CardContent className="p-4">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Digite o medicamento..."
                    className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                    value={inputMed}
                    onChange={(e) => setInputMed(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && adicionarMedicamento()}
                    list="medicamentos-list"
                  />
                  <datalist id="medicamentos-list">
                    {medicamentosComuns.filter(m => !medicamentos.includes(m)).map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <Button 
                  onClick={() => adicionarMedicamento()}
                  className="h-9 bg-yellow-500 hover:bg-yellow-600 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>

              {/* Seleção rápida */}
              <div className="flex flex-wrap gap-1 mb-3">
                {medicamentosComuns.slice(0, 15).filter(m => !medicamentos.includes(m)).map((med) => (
                  <button
                    key={med}
                    onClick={() => adicionarMedicamento(med)}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-yellow-100 rounded transition-colors"
                  >
                    + {med}
                  </button>
                ))}
              </div>

              {/* Medicamentos selecionados */}
              {medicamentos.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-2">Medicamentos selecionados ({medicamentos.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {medicamentos.map((med) => (
                      <Badge 
                        key={med} 
                        className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer pr-1"
                      >
                        <Pill className="w-3 h-3 mr-1" />
                        {med}
                        <button 
                          onClick={() => removerMedicamento(med)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={analisarInteracoes}
                    disabled={isAnalyzing || medicamentos.length < 2}
                    className="w-full mt-3 h-9 bg-blue-900 hover:bg-blue-800 text-xs"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Analisando interações...</>
                    ) : (
                      <><Brain className="w-4 h-4 mr-1" /> Analisar Interações</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultado */}
          {resultado && (
            <>
              {/* Resumo */}
              <Card className="bg-white border border-slate-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">Resumo da Análise</h3>
                    <div className="flex gap-2">
                      <Select value={filtroRisco} onValueChange={setFiltroRisco}>
                        <SelectTrigger className="h-7 text-[10px] w-28">
                          <Filter className="w-3 h-3 mr-1" />
                          <SelectValue placeholder="Risco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os riscos</SelectItem>
                          <SelectItem value="4">Grave</SelectItem>
                          <SelectItem value="3">Alto</SelectItem>
                          <SelectItem value="2">Moderado</SelectItem>
                          <SelectItem value="1">Baixo</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filtroOrgao} onValueChange={setFiltroOrgao}>
                        <SelectTrigger className="h-7 text-[10px] w-28">
                          <SelectValue placeholder="Órgão" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos órgãos</SelectItem>
                          <SelectItem value="renal">Renal</SelectItem>
                          <SelectItem value="hepático">Hepático</SelectItem>
                          <SelectItem value="cardíaco">Cardíaco (QT)</SelectItem>
                          <SelectItem value="hematológico">Hematológico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-center">
                      <p className="text-lg font-bold text-red-600">{resultado.resumo?.graves || 0}</p>
                      <p className="text-[9px] text-red-600">Graves</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 text-center">
                      <p className="text-lg font-bold text-orange-600">{resultado.resumo?.altas || 0}</p>
                      <p className="text-[9px] text-orange-600">Altas</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-center">
                      <p className="text-lg font-bold text-amber-600">{resultado.resumo?.moderadas || 0}</p>
                      <p className="text-[9px] text-amber-600">Moderadas</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-center">
                      <p className="text-lg font-bold text-blue-600">{resultado.resumo?.leves || 0}</p>
                      <p className="text-[9px] text-blue-600">Leves</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200 text-center">
                      <p className="text-lg font-bold text-green-600">{semInteracao.length}</p>
                      <p className="text-[9px] text-green-600">Sem interação</p>
                    </div>
                  </div>

                  {resultado.resumo?.alerta_geral && (
                    <div className="p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-700 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {resultado.resumo.alerta_geral}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs de visualização */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border border-slate-200 p-0.5 mb-4">
                  <TabsTrigger value="lista" className="text-xs h-7 gap-1">
                    <Pill className="w-3 h-3" /> Lista
                  </TabsTrigger>
                  <TabsTrigger value="mapa" className="text-xs h-7 gap-1">
                    <Network className="w-3 h-3" /> Mapa Visual
                  </TabsTrigger>
                  <TabsTrigger value="orgaos" className="text-xs h-7 gap-1">
                    <Heart className="w-3 h-3" /> Por Órgão
                  </TabsTrigger>
                </TabsList>

                {/* Lista de Interações */}
                <TabsContent value="lista" className="space-y-3">
                  {/* Duplicidades */}
                  {resultado.duplicidades?.length > 0 && (
                    <Card className="bg-purple-50 border border-purple-200">
                      <CardContent className="p-3">
                        <h4 className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Duplicidade Terapêutica
                        </h4>
                        {resultado.duplicidades.map((dup, i) => (
                          <div key={i} className="p-2 bg-white rounded border border-purple-100 mb-1">
                            <p className="text-xs text-purple-800">
                              <strong>{dup.medicamentos?.join(' + ')}</strong> - {dup.classe}
                            </p>
                            <p className="text-[10px] text-purple-600">{dup.recomendacao}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Graves */}
                  {interacoesGraves.length > 0 && (
                    <Card className="bg-red-50 border border-red-200">
                      <CardContent className="p-3">
                        <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Interações Graves / Altas
                        </h4>
                        <div className="space-y-2">
                          {interacoesGraves.map((int, i) => (
                            <InteracaoCard 
                              key={i} 
                              interacao={int} 
                              onExplicar={() => explicarInteracao(int)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Moderadas */}
                  {interacoesModeradas.length > 0 && (
                    <Card className="bg-amber-50 border border-amber-200">
                      <CardContent className="p-3">
                        <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Interações Moderadas
                        </h4>
                        <div className="space-y-2">
                          {interacoesModeradas.map((int, i) => (
                            <InteracaoCard 
                              key={i} 
                              interacao={int} 
                              onExplicar={() => explicarInteracao(int)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Leves */}
                  {interacoesLeves.length > 0 && (
                    <Card className="bg-blue-50 border border-blue-200">
                      <CardContent className="p-3">
                        <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Interações Leves
                        </h4>
                        <div className="space-y-2">
                          {interacoesLeves.map((int, i) => (
                            <InteracaoCard 
                              key={i} 
                              interacao={int} 
                              compact
                              onExplicar={() => explicarInteracao(int)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sem interação */}
                  {semInteracao.length > 0 && (
                    <Card className="bg-green-50 border border-green-200">
                      <CardContent className="p-3">
                        <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sem Interações Conhecidas
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {semInteracao.map((int, i) => (
                            <Badge key={i} className="text-[10px] bg-green-100 text-green-700">
                              {int.med1} + {int.med2}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Mapa Visual */}
                <TabsContent value="mapa">
                  <InteracoesVisualMap 
                    medicamentos={medicamentos} 
                    interacoes={resultado.interacoes || []}
                  />
                </TabsContent>

                {/* Por Órgão */}
                <TabsContent value="orgaos">
                  <div className="grid md:grid-cols-2 gap-3">
                    <OrgaoCard 
                      titulo="Renal" 
                      icon={Droplets}
                      color="blue"
                      interacoes={resultado.interacoes?.filter(i => i.orgaos_afetados?.includes('renal')) || []}
                    />
                    <OrgaoCard 
                      titulo="Hepático" 
                      icon={Activity}
                      color="amber"
                      interacoes={resultado.interacoes?.filter(i => i.orgaos_afetados?.includes('hepático')) || []}
                    />
                    <OrgaoCard 
                      titulo="Cardíaco (QT)" 
                      icon={Heart}
                      color="red"
                      interacoes={resultado.interacoes?.filter(i => i.prolongamento_qt || i.orgaos_afetados?.includes('cardíaco')) || []}
                    />
                    <OrgaoCard 
                      titulo="Hematológico" 
                      icon={Droplets}
                      color="purple"
                      interacoes={resultado.interacoes?.filter(i => i.risco_sangramento || i.orgaos_afetados?.includes('hematológico')) || []}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Fonte */}
              <p className="text-[9px] text-slate-400 text-center mt-4">
                ⚕️ Análise baseada em literatura farmacológica. Sempre consulte fontes oficiais para decisões clínicas.
              </p>
            </>
          )}

          {/* Histórico */}
          {!resultado && historicoAnalises.length > 0 && (
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Histórico de Análises
                </h3>
                <div className="space-y-2">
                  {historicoAnalises.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMedicamentos(h.medicamentos);
                      }}
                      className="w-full p-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-700">{h.medicamentos.join(' + ')}</p>
                        <span className="text-[9px] text-slate-400">
                          {new Date(h.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {h.resumo && (
                        <div className="flex gap-2 mt-1">
                          {h.resumo.graves > 0 && <Badge className="text-[8px] bg-red-500">{h.resumo.graves} graves</Badge>}
                          {h.resumo.moderadas > 0 && <Badge className="text-[8px] bg-amber-500">{h.resumo.moderadas} moderadas</Badge>}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modal de Explicação */}
          <Dialog open={!!explicacaoAberta} onOpenChange={() => setExplicacaoAberta(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  Explicação da Interação
                </DialogTitle>
              </DialogHeader>
              {explicacaoAberta && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-800 mb-1">
                      {explicacaoAberta.med1} + {explicacaoAberta.med2}
                    </p>
                    <Badge className={`text-[9px] ${riscoConfig[explicacaoAberta.risco]?.color}`}>
                      {riscoConfig[explicacaoAberta.risco]?.label}
                    </Badge>
                  </div>
                  
                  {loadingExplicacao ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 mt-2">Gerando explicação...</p>
                    </div>
                  ) : explicacaoIA ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-slate-700 whitespace-pre-wrap">{explicacaoIA}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

function InteracaoCard({ interacao, compact, onExplicar }) {
  const config = riscoConfig[interacao.risco] || riscoConfig[0];
  const Icon = config.icon;

  return (
    <div className={`p-3 bg-white rounded-lg border ${config.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={`text-[9px] ${config.color}`}>
            {config.label}
          </Badge>
          <span className="text-xs font-semibold text-slate-800">
            {interacao.med1} + {interacao.med2}
          </span>
        </div>
        <button 
          onClick={onExplicar}
          className="text-[9px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
        >
          <Lightbulb className="w-3 h-3" /> Explicar
        </button>
      </div>
      
      <p className="text-xs text-slate-600 mb-2">{interacao.mecanismo}</p>
      
      {!compact && (
        <>
          <div className="flex flex-wrap gap-1 mb-2">
            {interacao.tipo && (
              <Badge variant="outline" className="text-[8px]">{interacao.tipo}</Badge>
            )}
            {interacao.prolongamento_qt && (
              <Badge variant="outline" className="text-[8px] border-red-300 text-red-600">
                <Heart className="w-2 h-2 mr-0.5" /> Prolonga QT
              </Badge>
            )}
            {interacao.risco_sangramento && (
              <Badge variant="outline" className="text-[8px] border-red-300 text-red-600">
                <Droplets className="w-2 h-2 mr-0.5" /> Risco sangramento
              </Badge>
            )}
            {interacao.competicao_cyp450 && (
              <Badge variant="outline" className="text-[8px] border-purple-300 text-purple-600">
                CYP450: {interacao.competicao_cyp450}
              </Badge>
            )}
          </div>
          
          <div className="p-2 bg-slate-50 rounded">
            <p className="text-[10px] text-slate-600">
              <strong>Conduta:</strong> {interacao.conduta}
            </p>
          </div>
          
          {interacao.alternativa && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
              <p className="text-[10px] text-green-700 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <strong>Alternativa:</strong> {interacao.alternativa}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrgaoCard({ titulo, icon: Icon, color, interacoes }) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-500' }
  };
  
  const c = colorClasses[color];

  return (
    <Card className={`${c.bg} border ${c.border}`}>
      <CardContent className="p-3">
        <h4 className={`text-xs font-semibold ${c.text} mb-2 flex items-center gap-1`}>
          <Icon className={`w-3.5 h-3.5 ${c.icon}`} /> {titulo}
        </h4>
        {interacoes.length > 0 ? (
          <div className="space-y-1">
            {interacoes.map((int, i) => (
              <div key={i} className="p-1.5 bg-white rounded text-[10px]">
                <span className="font-medium">{int.med1} + {int.med2}</span>
                <Badge className={`ml-1 text-[8px] ${riscoConfig[int.risco]?.color}`}>
                  {riscoConfig[int.risco]?.label}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-500">Nenhuma interação afeta este sistema</p>
        )}
      </CardContent>
    </Card>
  );
}