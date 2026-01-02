import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bug, 
  Search,
  BookOpen,
  AlertTriangle,
  Pill,
  Shield,
  ChevronRight,
  Info,
  Microscope,
  FlaskConical,
  Heart,
  ImageIcon,
  Activity
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import GuiaAntimicrobiano from '../components/infectologia/GuiaAntimicrobiano';
import AtlasIST from '../components/infectologia/AtlasIST';

// Síndromes Infecciosas - Abordagem sindrômica
const sindromesInfecciosas = {
  febril: {
    nome: 'Síndrome Febril',
    definicao: 'Elevação da temperatura corporal (≥37.8°C axilar ou ≥38°C oral/retal) como manifestação de processo infeccioso ou inflamatório',
    etiologias_principais: [
      'Infecções virais (dengue, influenza, COVID-19, mononucleose)',
      'Infecções bacterianas (pneumonia, ITU, endocardite)',
      'Malária (em áreas endêmicas)',
      'Febre tifoide',
      'Tuberculose'
    ],
    abordagem_inicial: [
      'Anamnese completa: tempo de febre, sinais/sintomas associados, viagens, comorbidades',
      'Exame físico detalhado: buscar foco infeccioso',
      'Avaliar sinais de gravidade'
    ],
    exames_indicados: [
      'Hemograma',
      'PCR e procalcitonina',
      'Hemoculturas (se febre alta, calafrios)',
      'Exames conforme foco suspeito (RX tórax, EAS/urocultura, etc)'
    ],
    condutas_iniciais: [
      'Antitérmicos sintomáticos',
      'Hidratação adequada',
      'Antibiótico empírico se sinais de gravidade ou foco bacteriano definido',
      'Isolamento conforme suspeita (dengue, COVID-19)'
    ],
    criterios_gravidade: ['Hipotensão', 'Taquicardia persistente', 'Alteração do nível de consciência', 'Oligúria', 'Disfunção orgânica']
  },
  sepse: {
    nome: 'Sepse e Choque Séptico',
    definicao: 'Disfunção orgânica ameaçadora à vida causada por resposta desregulada do hospedeiro à infecção (SOFA ≥2)',
    etiologias_principais: [
      'Foco pulmonar (pneumonia)',
      'Foco urinário (ITU/pielonefrite)',
      'Foco abdominal (peritonite, colecistite)',
      'Foco cutâneo (celulite, fasciíte)',
      'Bacteremia sem foco definido'
    ],
    abordagem_inicial: [
      'Reconhecimento rápido (qSOFA: FR≥22, PAS≤100, alteração consciência)',
      'Acesso venoso calibroso',
      'Coleta de culturas (hemoculturas, urocultura, outras)',
      'Antibiótico de amplo espectro em até 1 hora',
      'Ressuscitação volêmica (30ml/kg cristaloide se hipotensão/lactato >4)'
    ],
    exames_indicados: [
      'Hemograma, função renal, eletrólitos, gasometria',
      'Lactato sérico',
      'PCR, procalcitonina',
      'Hemoculturas (2 pares), urocultura',
      'Imagem do foco suspeito'
    ],
    condutas_iniciais: [
      'Antibiótico empírico amplo espectro imediato',
      'Fluidoterapia agressiva',
      'Vasopressor se necessário (noradrenalina)',
      'Suporte de órgãos',
      'Controle do foco infeccioso (drenagem, cirurgia)'
    ],
    criterios_gravidade: ['PAS <90mmHg', 'Lactato >2mmol/L', 'SOFA ≥2', 'Necessidade de vasopressor']
  },
  respiratoria: {
    nome: 'Infecção Respiratória',
    definicao: 'Infecção do trato respiratório superior ou inferior',
    etiologias_principais: [
      'Pneumonia comunitária: S. pneumoniae, H. influenzae, atípicos',
      'Pneumonia nosocomial: Gram-negativos, MRSA',
      'Influenza, COVID-19, VSR',
      'Tuberculose'
    ],
    abordagem_inicial: [
      'Classificar gravidade (CURB-65, PSI)',
      'RX tórax',
      'Avaliar necessidade de internação'
    ],
    exames_indicados: [
      'RX ou TC de tórax',
      'Hemograma, PCR',
      'Hemoculturas (pneumonia grave)',
      'Teste rápido para influenza/COVID-19',
      'Gasometria arterial (se SpO2 <92%)'
    ],
    condutas_iniciais: [
      'Antibiótico empírico conforme gravidade',
      'Oxigenioterapia se necessário',
      'Hidratação',
      'Fisioterapia respiratória'
    ],
    criterios_gravidade: ['CURB-65 ≥2', 'SpO2 <90%', 'FR >30ipm', 'Confusão mental', 'Ureia >50mg/dL']
  },
  urinaria: {
    nome: 'Infecção Urinária',
    definicao: 'Infecção do trato urinário (cistite, pielonefrite)',
    etiologias_principais: [
      'E. coli (80-90% dos casos)',
      'Klebsiella',
      'Proteus mirabilis',
      'Enterococcus',
      'Staphylococcus saprophyticus (mulheres jovens)'
    ],
    abordagem_inicial: [
      'Diferenciar cistite simples de pielonefrite',
      'ITU complicada vs não complicada',
      'Avaliar fatores de risco para resistência'
    ],
    exames_indicados: [
      'EAS (piúria, bacteriúria, nitritos)',
      'Urocultura + antibiograma',
      'Hemograma (se pielonefrite)',
      'Imagem (USG/TC) se pielonefrite ou ITU complicada'
    ],
    condutas_iniciais: [
      'Cistite simples: nitrofurantoína, fosfomicina (dose única)',
      'Pielonefrite: fluoroquinolona ou cefalosporina 3ª geração',
      'Hidratação adequada',
      'Analgesia'
    ],
    criterios_gravidade: ['Febre alta', 'Dor lombar intensa', 'Sinais de sepse', 'Gestante', 'Imunossupressão']
  },
  pele: {
    nome: 'Infecção de Pele e Partes Moles',
    definicao: 'Infecções cutâneas (celulite, erisipela, abscesso, fasciíte)',
    etiologias_principais: [
      'S. aureus (incluindo MRSA)',
      'S. pyogenes (Streptococcus grupo A)',
      'Anaeróbios (infecções profundas)',
      'Gram-negativos (diabetes, imunossupressão)'
    ],
    abordagem_inicial: [
      'Identificar tipo de lesão (celulite vs abscesso vs necrose)',
      'Avaliar extensão e profundidade',
      'Buscar sinais de gravidade (crepitação, necrose, toxemia)'
    ],
    exames_indicados: [
      'Hemograma, PCR',
      'Hemoculturas (se febre alta)',
      'Cultura de secreção (se drenagem)',
      'TC/RM (suspeita de fasciíte necrosante)'
    ],
    condutas_iniciais: [
      'Celulite: cefalosporina 1ª geração, oxacilina',
      'Abscesso: drenagem cirúrgica + antibiótico',
      'MRSA: vancomicina, linezolida',
      'Fasciíte necrosante: EMERGÊNCIA CIRÚRGICA + ATB amplo espectro'
    ],
    criterios_gravidade: ['Crepitação', 'Necrose', 'Progressão rápida', 'Sinais sistêmicos', 'Imunossupressão']
  }
};

// Profilaxias
const profilaxias = {
  prep: {
    nome: 'PrEP (Profilaxia Pré-Exposição ao HIV)',
    indicacoes: [
      'Pessoa com relacionamento sorodiferente (um HIV+ outro HIV-)',
      'Pessoas que fazem sexo sem preservativo com parceiros de sorologia desconhecida',
      'Histórico de ISTs nos últimos 6 meses',
      'Uso repetido de PEP',
      'Profissionais do sexo, usuários de drogas injetáveis'
    ],
    esquema: 'Tenofovir + Entricitabina (TDF 300mg + FTC 200mg) – 1 comprimido via oral 1x/dia',
    prazos: 'Início imediato após triagem negativa para HIV. Manter uso contínuo enquanto houver exposição de risco',
    contraindicacoes: ['HIV+', 'Clearance de creatinina <60ml/min', 'Hepatite B ativa sem tratamento'],
    obs: 'Requer acompanhamento trimestral com testagem para HIV, função renal e rastreio de ISTs'
  },
  pep: {
    nome: 'PEP (Profilaxia Pós-Exposição ao HIV)',
    indicacoes: [
      'Exposição sexual (penetração vaginal/anal sem preservativo com pessoa HIV+ ou de sorologia desconhecida)',
      'Violência sexual',
      'Acidente ocupacional (perfurocortante com sangue HIV+)',
      'Compartilhamento de seringas'
    ],
    esquema: 'Tenofovir + Lamivudina + Dolutegravir (TDF 300mg + 3TC 300mg + DTG 50mg) – via oral por 28 dias',
    prazos: 'INICIAR EM ATÉ 72 HORAS após exposição (idealmente nas primeiras 2h). Eficácia diminui com o tempo',
    contraindicacoes: ['HIV+ confirmado'],
    obs: 'Acompanhamento nos meses 1, 3 e 6 para testagem de HIV, hepatites e outras ISTs'
  },
  antitetanica: {
    nome: 'Profilaxia Antitetânica',
    indicacoes: [
      'Ferimentos contaminados (terra, fezes, ferrugem)',
      'Ferimentos profundos',
      'Queimaduras',
      'Mordeduras',
      'Fraturas expostas'
    ],
    esquema: 'Depende do histórico vacinal e tipo de ferimento (limpo vs sujo)',
    prazos: 'Imediato após ferimento',
    contraindicacoes: ['Reação anafilática prévia à vacina'],
    obs: `
**Ferimento limpo:**
- <3 doses ou desconhecido: dT ou dTpa + agendar completar esquema
- ≥3 doses (última <5 anos): não precisa
- ≥3 doses (última 5-10 anos): não precisa
- ≥3 doses (última >10 anos): dT ou dTpa

**Ferimento sujo:**
- <3 doses ou desconhecido: dT ou dTpa + IGHTAT (Imunoglobulina) + completar esquema
- ≥3 doses (última <5 anos): não precisa
- ≥3 doses (última ≥5 anos): dT ou dTpa`
  },
  antirrabica: {
    nome: 'Profilaxia Antirrábica',
    indicacoes: [
      'Mordedura, arranhadura ou lambedura de mucosa por animal suspeito (cão, gato, morcego, macaco)',
      'Contato direto com morcego (mesmo sem ferimento visível)'
    ],
    esquema: `
**Pré-exposição (profissionais de risco):** 3 doses nos dias 0, 7 e 21-28

**Pós-exposição:**
- Pessoa não vacinada: Soro (IGHTAR) + vacina (dias 0, 3, 7, 14)
- Pessoa vacinada: vacina (dias 0 e 3), sem soro`,
    prazos: 'Iniciar o mais rápido possível após exposição',
    contraindicacoes: ['Nenhuma (doença fatal – não há contraindicação absoluta)'],
    obs: 'Observar animal por 10 dias quando possível. Se animal sadio após 10 dias, suspender profilaxia'
  },
  outras: {
    nome: 'Outras Profilaxias',
    indicacoes: [
      'Profilaxia de endocardite bacteriana (procedimentos odontológicos/cirúrgicos em cardiopatas)',
      'Profilaxia de meningite meningocócica (contatos próximos)',
      'Profilaxia de tuberculose (ILTB - Infecção Latente)',
      'Profilaxia de malária (viajantes para áreas endêmicas)'
    ],
    esquema: 'Varia conforme a situação',
    prazos: 'Conforme protocolo específico',
    contraindicacoes: 'Variáveis',
    obs: 'Consultar protocolos específicos do Ministério da Saúde'
  }
};

// Considerações (Conceitos)
const consideracoesImportantes = [
  {
    titulo: 'Cultura Antes do Antibiótico',
    conteudo: 'Coletar hemoculturas e culturas do sítio antes de iniciar antibiótico permite identificação do agente e teste de sensibilidade. Não deve atrasar início do tratamento empírico em casos graves.'
  },
  {
    titulo: 'Resistência Bacteriana',
    conteudo: 'A resistência antimicrobiana é crescente. Fatores de risco: uso prévio de antibióticos, hospitalização recente, institucionalização, comorbidades, imunossupressão. Conhecer padrões locais de resistência é fundamental.'
  },
  {
    titulo: 'Descalonamento (De-escalation)',
    conteudo: 'Iniciar com antibiótico de amplo espectro e, após identificação do agente e antibiograma, trocar para esquema de espectro mais restrito. Reduz pressão seletiva e efeitos adversos.'
  },
  {
    titulo: 'Uso Racional de Antimicrobianos',
    conteudo: 'Princípios: usar antibiótico apenas quando necessário, escolher baseado em dados microbiológicos quando possível, ajustar dose para função renal/hepática, reavaliar necessidade diariamente, descalonar quando apropriado.'
  },
  {
    titulo: 'Infecção Comunitária vs Nosocomial',
    conteudo: 'Infecções comunitárias: geralmente por agentes sensíveis. Nosocomiais (>48h de internação): maior risco de multirresistentes (MRSA, Pseudomonas, Acinetobacter, KPC). Influencia escolha empírica.'
  },
  {
    titulo: 'Duração do Tratamento',
    conteudo: 'Tendência atual: cursos mais curtos em infecções não complicadas (5-7 dias). Exceções: endocardite, osteomielite, infecções profundas. Reavaliar diariamente a necessidade de continuidade.'
  },
  {
    titulo: 'Notificação Compulsória',
    conteudo: 'Algumas doenças infecciosas são de notificação compulsória: AIDS, sífilis, hepatites virais, tuberculose, meningites, dengue, febre amarela, entre outras. Consultar lista atualizada do Ministério da Saúde.'
  }
];

export default function Infectologia() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('ists');
  const [searchTerm, setSearchTerm] = useState('');
  const [sindromeSelecionada, setSindromeSelecionada] = useState(null);
  const [profilaxiaSelecionada, setProfilaxiaSelecionada] = useState(null);

  const sindromesFiltradas = Object.entries(sindromesInfecciosas).filter(([key, sindrome]) =>
    sindrome.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Infectologia</h1>
              <p className="text-xs text-slate-500">ISTs, antimicrobianos, síndromes infecciosas e profilaxias</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 p-0.5 mb-4">
              <TabsTrigger value="ists" className="text-xs h-8 gap-1">
                <Heart className="w-3.5 h-3.5" /> ISTs
              </TabsTrigger>
              <TabsTrigger value="antibioticos" className="text-xs h-8 gap-1">
                <Pill className="w-3.5 h-3.5" /> Antimicrobianos
              </TabsTrigger>
              <TabsTrigger value="sindromes" className="text-xs h-8 gap-1">
                <Microscope className="w-3.5 h-3.5" /> Síndromes
              </TabsTrigger>
              <TabsTrigger value="profilaxias" className="text-xs h-8 gap-1">
                <Shield className="w-3.5 h-3.5" /> Profilaxias
              </TabsTrigger>
              <TabsTrigger value="conceitos" className="text-xs h-8 gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Conceitos
              </TabsTrigger>
            </TabsList>

            {/* ABA 1: ISTs | Atlas Visual */}
            <TabsContent value="ists">
              <AtlasIST />
            </TabsContent>

            {/* ABA 2: Guia Antimicrobiano */}
            <TabsContent value="antibioticos">
              <GuiaAntimicrobiano />
            </TabsContent>

            {/* ABA 3: Síndromes Infecciosas */}
            <TabsContent value="sindromes">
              {sindromeSelecionada ? (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSindromeSelecionada(null)} 
                    className="text-xs h-7"
                  >
                    <ChevronRight className="w-3 h-3 mr-1 rotate-180" /> Voltar
                  </Button>

                  <Card className="bg-white border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-800">
                        {sindromeSelecionada.nome}
                      </CardTitle>
                      <p className="text-[10px] text-slate-500">{sindromeSelecionada.definicao}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Etiologias */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-600" /> Principais Etiologias
                        </h4>
                        <ul className="space-y-1">
                          {sindromeSelecionada.etiologias_principais.map((etio, i) => (
                            <li key={i} className="text-[10px] text-slate-700">• {etio}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Abordagem Inicial */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-purple-600" /> Abordagem Inicial
                        </h4>
                        <ul className="space-y-1">
                          {sindromeSelecionada.abordagem_inicial.map((ab, i) => (
                            <li key={i} className="text-[10px] text-slate-700">• {ab}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Exames */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Microscope className="w-3.5 h-3.5 text-emerald-600" /> Exames Indicados
                        </h4>
                        <ul className="space-y-1">
                          {sindromeSelecionada.exames_indicados.map((ex, i) => (
                            <li key={i} className="text-[10px] text-slate-700">• {ex}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Condutas */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-orange-600" /> Condutas Iniciais
                        </h4>
                        <ul className="space-y-1">
                          {sindromeSelecionada.condutas_iniciais.map((cond, i) => (
                            <li key={i} className="text-[10px] text-slate-700">• {cond}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Critérios de Gravidade */}
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Critérios de Gravidade
                        </h4>
                        <ul className="space-y-1">
                          {sindromeSelecionada.criterios_gravidade.map((crit, i) => (
                            <li key={i} className="text-[10px] text-red-700">• {crit}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-3">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Abordagem sindrômica</strong> para raciocínio clínico em emergência e plantão.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-3">
                    {sindromesFiltradas.map(([key, sindrome]) => (
                      <button 
                        key={key} 
                        onClick={() => setSindromeSelecionada(sindrome)}
                        className="text-left group"
                      >
                        <Card className="bg-white border border-slate-200 hover:border-lime-300 hover:shadow-md transition-all h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-lime-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Microscope className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                                  {sindrome.nome}
                                </h3>
                                <p className="text-[10px] text-slate-600 line-clamp-2">
                                  {sindrome.definicao}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ABA 4: Profilaxias */}
            <TabsContent value="profilaxias">
              {profilaxiaSelecionada ? (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setProfilaxiaSelecionada(null)} 
                    className="text-xs h-7"
                  >
                    <ChevronRight className="w-3 h-3 mr-1 rotate-180" /> Voltar
                  </Button>

                  <Card className="bg-white border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-800">
                        {profilaxiaSelecionada.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">Indicações</h4>
                        <ul className="space-y-1">
                          {profilaxiaSelecionada.indicacoes.map((ind, i) => (
                            <li key={i} className="text-[10px] text-slate-700">• {ind}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">Esquema</h4>
                        <p className="text-[10px] text-slate-700 whitespace-pre-line">{profilaxiaSelecionada.esquema}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">Prazos</h4>
                        <p className="text-[10px] text-slate-700">{profilaxiaSelecionada.prazos}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">Contraindicações</h4>
                        <ul className="space-y-1">
                          {profilaxiaSelecionada.contraindicacoes.map((contra, i) => (
                            <li key={i} className="text-[10px] text-slate-700">• {contra}</li>
                          ))}
                        </ul>
                      </div>

                      {profilaxiaSelecionada.obs && (
                        <div className="p-2 bg-blue-50 rounded border border-blue-100">
                          <p className="text-[10px] text-blue-700 whitespace-pre-line">
                            <strong>Observações:</strong> {profilaxiaSelecionada.obs}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-3">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Profilaxias infecciosas</strong> baseadas em protocolos do Ministério da Saúde e ANVISA.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(profilaxias).map(([key, prof]) => (
                      <button 
                        key={key} 
                        onClick={() => setProfilaxiaSelecionada(prof)}
                        className="text-left group"
                      >
                        <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Shield className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-slate-800">
                                  {prof.nome}
                                </h3>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ABA 5: Conceitos (mantida como estava) */}
            <TabsContent value="conceitos">
              <div className="space-y-3">
                {consideracoesImportantes.map((consideracao, i) => (
                  <Card key={i} className="bg-white border border-slate-200">
                    <CardContent className="p-4">
                      <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        {consideracao.titulo}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{consideracao.conteudo}</p>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-amber-50 border-amber-300">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-amber-800 text-center font-medium">
                      ⚠️ Conceitos educacionais sobre uso racional de antimicrobianos. NÃO prescrevem, NÃO substituem protocolos institucionais ou decisão clínica individualizada.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <DisclaimerFooter variant="medicamento" />
        </div>
      </main>
    </div>
  );
}