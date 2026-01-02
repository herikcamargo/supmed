import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Search,
  ChevronRight,
  ChevronLeft,
  Image,
  FileText,
  FlaskConical,
  Stethoscope,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Play,
  Award
} from 'lucide-react';

// Casos clínicos interativos
const casosClinicosDB = [
  {
    id: 'caso_1',
    titulo: 'Dor Torácica no PS',
    especialidade: 'Cardiologia',
    dificuldade: 'Intermediário',
    duracao: '15 min',
    pontos: 50,
    tags: ['SCA', 'IAMCSST', 'ECG'],
    etapas: [
      {
        tipo: 'apresentacao',
        titulo: 'Apresentação do Caso',
        conteudo: 'Homem, 58 anos, chega ao PS às 14h com dor torácica retroesternal em aperto, irradiando para MSE, há 2 horas. Refere sudorese e náuseas. HAS e DM2 em uso irregular de medicações.',
        imagem: null
      },
      {
        tipo: 'exame_fisico',
        titulo: 'Exame Físico',
        conteudo: 'PA: 150x90 mmHg, FC: 95 bpm, FR: 20 irpm, SpO2: 96% AA. REG, sudorético, pálido. ACV: BRNF 2T, B4 presente, sem sopros. AR: MV+, sem RA. Abd: sem alterações.',
        achados: ['B4 presente', 'Sudorese', 'Palidez']
      },
      {
        tipo: 'exame_complementar',
        titulo: 'ECG (realizado em 5 minutos)',
        conteudo: 'Ritmo sinusal. Supra de ST de 3mm em V1-V4, infra de ST em D2, D3 e aVF.',
        imagem: 'ecg_iamcsst_anterior.png',
        interpretacao: 'IAM com supra de ST em parede anterior'
      },
      {
        tipo: 'pergunta',
        titulo: 'Qual a conduta inicial?',
        opcoes: [
          { texto: 'Morfina + AAS + Clopidogrel + Anticoagulação + Encaminhar para CATE', correta: true },
          { texto: 'Aguardar troponina antes de qualquer conduta', correta: false },
          { texto: 'Apenas AAS e observação', correta: false },
          { texto: 'Solicitar teste ergométrico', correta: false }
        ],
        explicacao: 'IAMCSST é uma emergência! Tempo é músculo. CATE primário em até 90 minutos ou fibrinólise em até 30 minutos se CATE indisponível.'
      },
      {
        tipo: 'evolucao',
        titulo: 'Evolução',
        conteudo: 'Paciente encaminhado para CATE em 45 minutos. Encontrada oclusão total de DA proximal. Realizada angioplastia com stent com sucesso. Pico de troponina: 45 ng/mL. FE pós: 45%.',
        desfecho: 'Alta em 5 dias. Dupla antiagregação, estatina, IECA, betabloqueador. Encaminhado para reabilitação cardíaca.'
      },
      {
        tipo: 'pontos_chave',
        titulo: 'Pontos-Chave',
        itens: [
          'ECG em até 10 minutos na dor torácica',
          'IAMCSST = CATE primário (porta-balão < 90 min)',
          'Não atrasar reperfusão aguardando marcadores',
          'B4 sugere disfunção diastólica aguda',
          'Classificação de Killip na admissão'
        ]
      }
    ]
  },
  {
    id: 'caso_2',
    titulo: 'Dispneia Aguda em Idosa',
    especialidade: 'Pneumologia',
    dificuldade: 'Avançado',
    duracao: '20 min',
    pontos: 70,
    tags: ['TEP', 'Dispneia', 'Wells'],
    etapas: [
      {
        tipo: 'apresentacao',
        titulo: 'Apresentação do Caso',
        conteudo: 'Mulher, 72 anos, dispneia súbita há 6 horas. Fraturou fêmur há 10 dias, ficou acamada. Taquicárdica e hipoxêmica. Sem história de doença pulmonar prévia.',
        imagem: null
      },
      {
        tipo: 'exame_fisico',
        titulo: 'Exame Físico',
        conteudo: 'PA: 100x60 mmHg, FC: 120 bpm, FR: 28 irpm, SpO2: 88% AA. REG, taquidispneica, cianose labial. AR: MV diminuído em base D. ACV: B2 hiperfonética. MMII: edema assimétrico, panturrilha D dolorosa.',
        achados: ['B2 hiperfonética', 'TVP provável', 'Hipoxemia grave']
      },
      {
        tipo: 'pergunta',
        titulo: 'Qual score aplicar?',
        opcoes: [
          { texto: 'Wells para TEP', correta: true },
          { texto: 'CURB-65', correta: false },
          { texto: 'Geneva para TVP', correta: false },
          { texto: 'HEART Score', correta: false }
        ],
        explicacao: 'Wells para TEP: imobilização + sinais de TVP + taquicardia + diagnóstico alternativo improvável = alta probabilidade.'
      },
      {
        tipo: 'exame_complementar',
        titulo: 'AngioTC de Tórax',
        conteudo: 'Falha de enchimento em artéria pulmonar principal direita e ramos lobares. Dilatação de VD.',
        imagem: 'angiotc_tep.png',
        interpretacao: 'TEP maciço com disfunção de VD'
      },
      {
        tipo: 'evolucao',
        titulo: 'Evolução',
        conteudo: 'Iniciada anticoagulação plena com heparina. Manteve instabilidade. Indicada trombólise com alteplase. Melhora hemodinâmica em 2 horas. Ecocardiograma de controle: melhora da função de VD.',
        desfecho: 'Alta com rivaroxabana por 6 meses. Investigação de trombofilia posteriormente.'
      }
    ]
  },
  {
    id: 'caso_3',
    titulo: 'Rebaixamento de Consciência',
    especialidade: 'Neurologia',
    dificuldade: 'Intermediário',
    duracao: '15 min',
    pontos: 50,
    tags: ['AVC', 'Glasgow', 'NIHSS'],
    etapas: [
      {
        tipo: 'apresentacao',
        titulo: 'Apresentação do Caso',
        conteudo: 'Homem, 65 anos, encontrado caído em casa pela filha. Visto bem há 1 hora. Hemiplegia à direita, não verbaliza. FA conhecida, não usa anticoagulante.',
        imagem: null
      },
      {
        tipo: 'exame_fisico',
        titulo: 'Exame Físico',
        conteudo: 'PA: 180x100 mmHg, FC: 95 bpm irregular, FR: 16 irpm, SpO2: 97%. Sonolento, abre olhos ao chamado. Não obedece comandos. Desvio de rima à esquerda. Hemiplegia D flácida. Babinski +.',
        achados: ['Glasgow: 10 (AO3 RV2 RM5)', 'Afasia global', 'Déficit motor grau 0 à D']
      },
      {
        tipo: 'pergunta',
        titulo: 'Qual a próxima conduta?',
        opcoes: [
          { texto: 'TC de crânio sem contraste urgente', correta: true },
          { texto: 'Iniciar anticoagulação imediata', correta: false },
          { texto: 'RNM de crânio', correta: false },
          { texto: 'Punção lombar', correta: false }
        ],
        explicacao: 'TC sem contraste é o primeiro exame para diferenciar AVC isquêmico de hemorrágico e definir conduta terapêutica.'
      },
      {
        tipo: 'exame_complementar',
        titulo: 'TC de Crânio',
        conteudo: 'Hipodensidade em território de ACM esquerda. ASPECTS 7. Sem sangramento.',
        imagem: 'tc_avc_acm.png',
        interpretacao: 'AVC isquêmico extenso em território de ACM E'
      },
      {
        tipo: 'evolucao',
        titulo: 'Evolução',
        conteudo: 'NIHSS: 18. Tempo ictus-porta: 90 min. Elegível para trombólise. Aplicado alteplase IV. Sem melhora em 1h. Realizada trombectomia mecânica com recanalização TICI 3.',
        desfecho: 'Melhora parcial. NIHSS alta: 8. mRS ao 3º mês: 2. Iniciado rivaroxabana para FA.'
      }
    ]
  }
];

export default function CasosClinicosInterativos() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);

  const filteredCases = casosClinicosDB.filter(caso =>
    caso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caso.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caso.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAnswer = (etapaIndex, opcaoIndex, correta) => {
    setRespostas({ ...respostas, [etapaIndex]: { opcaoIndex, correta } });
    setMostrarExplicacao(true);
  };

  const nextStep = () => {
    if (currentStep < selectedCase.etapas.length - 1) {
      setCurrentStep(currentStep + 1);
      setMostrarExplicacao(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setMostrarExplicacao(false);
    }
  };

  const resetCase = () => {
    setSelectedCase(null);
    setCurrentStep(0);
    setRespostas({});
    setMostrarExplicacao(false);
  };

  const difficultyColor = {
    'Iniciante': 'bg-green-100 text-green-700',
    'Intermediário': 'bg-yellow-100 text-yellow-700',
    'Avançado': 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Casos Clínicos Interativos</h1>
              <p className="text-xs text-slate-500">Aprenda com casos reais comentados</p>
            </div>
          </div>

          {selectedCase ? (
            // Visualização do Caso
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={resetCase} className="text-xs h-7">
                  <ChevronLeft className="w-3 h-3 mr-1" /> Voltar aos Casos
                </Button>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">
                    {currentStep + 1} / {selectedCase.etapas.length}
                  </Badge>
                  <Badge className={`text-[9px] ${difficultyColor[selectedCase.dificuldade]}`}>
                    {selectedCase.dificuldade}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="flex gap-1">
                {selectedCase.etapas.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      idx < currentStep ? 'bg-green-500' : 
                      idx === currentStep ? 'bg-blue-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Etapa Atual */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  {(() => {
                    const etapa = selectedCase.etapas[currentStep];
                    
                    switch (etapa.tipo) {
                      case 'apresentacao':
                      case 'evolucao':
                        return (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">{etapa.titulo}</h3>
                            <p className="text-sm text-slate-700 leading-relaxed">{etapa.conteudo}</p>
                            {etapa.desfecho && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-xs font-medium text-green-800">Desfecho</p>
                                <p className="text-xs text-green-700 mt-1">{etapa.desfecho}</p>
                              </div>
                            )}
                          </div>
                        );

                      case 'exame_fisico':
                        return (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">{etapa.titulo}</h3>
                            <p className="text-sm text-slate-700 leading-relaxed">{etapa.conteudo}</p>
                            {etapa.achados && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {etapa.achados.map((achado, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                                    {achado}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );

                      case 'exame_complementar':
                        return (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">{etapa.titulo}</h3>
                            {etapa.imagem && (
                              <div className="bg-slate-100 rounded-lg p-4 mb-3 flex items-center justify-center min-h-[150px]">
                                <div className="text-center">
                                  <Image className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                  <p className="text-[10px] text-slate-400">{etapa.imagem}</p>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-slate-700">{etapa.conteudo}</p>
                            {etapa.interpretacao && (
                              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                                <p className="text-xs text-blue-800">
                                  <strong>Interpretação:</strong> {etapa.interpretacao}
                                </p>
                              </div>
                            )}
                          </div>
                        );

                      case 'pergunta':
                        return (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-4">{etapa.titulo}</h3>
                            <div className="space-y-2">
                              {etapa.opcoes.map((opcao, idx) => {
                                const respondeu = respostas[currentStep] !== undefined;
                                const selecionou = respostas[currentStep]?.opcaoIndex === idx;
                                
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => !respondeu && handleAnswer(currentStep, idx, opcao.correta)}
                                    disabled={respondeu}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                      respondeu ? (
                                        opcao.correta ? 'border-green-500 bg-green-50' :
                                        selecionou ? 'border-red-500 bg-red-50' : 'border-slate-200'
                                      ) : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-xs font-medium text-slate-400">
                                        {String.fromCharCode(65 + idx)}.
                                      </span>
                                      <span className="text-xs text-slate-700">{opcao.texto}</span>
                                      {respondeu && opcao.correta && (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {mostrarExplicacao && (
                              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <p className="text-xs font-medium text-indigo-800 mb-1">Explicação</p>
                                <p className="text-xs text-indigo-700">{etapa.explicacao}</p>
                              </div>
                            )}
                          </div>
                        );

                      case 'pontos_chave':
                        return (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500" />
                              {etapa.titulo}
                            </h3>
                            <ul className="space-y-2">
                              {etapa.itens.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-slate-700">{item}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                              <Award className="w-8 h-8 text-green-500 mx-auto mb-1" />
                              <p className="text-sm font-medium text-green-800">Caso Concluído!</p>
                              <p className="text-xs text-green-600">+{selectedCase.pontos} XP</p>
                            </div>
                          </div>
                        );

                      default:
                        return <p>Etapa não reconhecida</p>;
                    }
                  })()}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="text-xs h-8"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" /> Anterior
                </Button>
                <Button 
                  size="sm" 
                  onClick={nextStep}
                  disabled={currentStep === selectedCase.etapas.length - 1}
                  className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                >
                  Próximo <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            // Lista de Casos
            <>
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
                <CardContent className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar caso por título, especialidade ou tag..."
                      className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCases.map((caso) => (
                  <Card 
                    key={caso.id} 
                    className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedCase(caso)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`text-[9px] ${difficultyColor[caso.dificuldade]}`}>
                          {caso.dificuldade}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" /> {caso.duracao}
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">{caso.titulo}</h3>
                      <p className="text-xs text-slate-500 mb-3">{caso.especialidade}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {caso.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[8px]">{tag}</Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3" />
                          <span className="text-[10px] font-medium">{caso.pontos} XP</span>
                        </div>
                        <Button size="sm" className="h-6 text-[10px] bg-indigo-600 hover:bg-indigo-700">
                          <Play className="w-3 h-3 mr-1" /> Iniciar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}