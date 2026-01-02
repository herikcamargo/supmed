import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useOptimizedSearch from '../components/search/useOptimizedSearch';
import {
  Heart,
  Baby,
  Ambulance,
  Activity,
  AlertTriangle,
  Syringe,
  Brain,
  Skull,
  Zap,
  Timer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  Loader2
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';

// Protocolos completos
const protocols = {
  pals: {
    title: 'PALS - Suporte Avançado Pediátrico',
    icon: Baby,
    color: 'from-pink-500 to-rose-600',
    category: 'emergência',
    sections: [
      {
        title: 'PCR Pediátrica',
        content: [
          { label: 'Verificar responsividade', value: 'Tocar e chamar - 10 segundos' },
          { label: 'Chamar ajuda', value: 'Ligar 192, pedir DEA' },
          { label: 'Compressões', value: '100-120/min, 1/3 do diâmetro AP' },
          { label: 'Relação C:V', value: '30:2 (1 socorrista) ou 15:2 (2 socorristas)' },
          { label: 'Profundidade', value: 'Lactentes: 4cm | Crianças: 5cm' }
        ]
      },
      {
        title: 'Medicações PCR',
        content: [
          { label: 'Adrenalina', value: '0.01 mg/kg (0.1 ml/kg da 1:10.000) IV/IO a cada 3-5 min' },
          { label: 'Amiodarona', value: '5 mg/kg IV/IO (FV/TV refratária) - máx 3 doses' },
          { label: 'Lidocaína', value: '1 mg/kg IV/IO (alternativa)' },
          { label: 'Atropina', value: '0.02 mg/kg (mín 0.1mg, máx 0.5mg) - bradicardia vagal' },
          { label: 'Adenosina', value: '0.1 mg/kg (máx 6mg), depois 0.2 mg/kg (máx 12mg) - TSV' }
        ]
      },
      {
        title: 'Choque Pediátrico',
        content: [
          { label: 'Bolus inicial', value: 'SF 0.9% 20 ml/kg em 5-10 min' },
          { label: 'Reavaliação', value: 'Após cada bolus (até 60 ml/kg)' },
          { label: 'Choque frio', value: 'Adrenalina 0.1-1 mcg/kg/min' },
          { label: 'Choque quente', value: 'Noradrenalina 0.1-2 mcg/kg/min' }
        ]
      }
    ]
  },
  acls: {
    title: 'ACLS - Suporte Avançado Adulto',
    icon: Heart,
    color: 'from-red-500 to-rose-600',
    category: 'emergência',
    sections: [
      {
        title: 'PCR Adulto - Ritmo Chocável',
        content: [
          { label: 'RCP de alta qualidade', value: '100-120/min, 5-6cm, retorno completo' },
          { label: 'Choque', value: 'Bifásico 120-200J ou Monofásico 360J' },
          { label: 'Adrenalina', value: '1mg IV/IO a cada 3-5 min' },
          { label: 'Amiodarona', value: '300mg IV (1ª dose), 150mg (2ª dose)' },
          { label: 'Lidocaína', value: '1-1.5 mg/kg (alternativa)' }
        ]
      },
      {
        title: 'PCR Adulto - Ritmo Não Chocável',
        content: [
          { label: 'AESP/Assistolia', value: 'RCP contínua, Adrenalina imediata' },
          { label: 'Adrenalina', value: '1mg IV/IO a cada 3-5 min' },
          { label: 'Buscar causas reversíveis', value: '5H e 5T' }
        ]
      },
      {
        title: '5H e 5T',
        content: [
          { label: 'Hipóxia', value: 'Ventilar, O2 100%' },
          { label: 'Hipovolemia', value: 'Volume, sangue' },
          { label: 'H+/Acidose', value: 'Bicarbonato' },
          { label: 'Hipo/Hipercalemia', value: 'K sérico, gluconato Ca' },
          { label: 'Hipotermia', value: 'Aquecimento' },
          { label: 'Tamponamento', value: 'Pericardiocentese' },
          { label: 'TEP', value: 'Trombólise' },
          { label: 'Trombose coronária', value: 'ICP' },
          { label: 'Tensão (pneumotórax)', value: 'Descompressão' },
          { label: 'Tóxicos', value: 'Antídoto específico' }
        ]
      },
      {
        title: 'Drogas Vasoativas',
        content: [
          { label: 'Noradrenalina', value: '0.1-0.5 mcg/kg/min (choque distributivo)' },
          { label: 'Adrenalina', value: '0.1-0.5 mcg/kg/min (choque anafilático)' },
          { label: 'Dopamina', value: '5-20 mcg/kg/min' },
          { label: 'Dobutamina', value: '2.5-20 mcg/kg/min (IC baixo)' },
          { label: 'Vasopressina', value: '0.03 U/min (adjuvante)' }
        ]
      }
    ]
  },
  atls: {
    title: 'ATLS - Trauma',
    icon: Ambulance,
    color: 'from-orange-500 to-amber-600',
    category: 'emergência',
    sections: [
      {
        title: 'ABCDE do Trauma',
        content: [
          { label: 'A - Airway', value: 'Via aérea com proteção cervical' },
          { label: 'B - Breathing', value: 'Ventilação e oxigenação' },
          { label: 'C - Circulation', value: 'Circulação com controle de hemorragia' },
          { label: 'D - Disability', value: 'Avaliação neurológica (Glasgow)' },
          { label: 'E - Exposure', value: 'Exposição com controle de temperatura' }
        ]
      },
      {
        title: 'Classificação do Choque Hemorrágico',
        content: [
          { label: 'Classe I', value: 'Até 750ml (<15%), FC normal, PA normal' },
          { label: 'Classe II', value: '750-1500ml (15-30%), FC 100-120, PA normal' },
          { label: 'Classe III', value: '1500-2000ml (30-40%), FC 120-140, PA baixa' },
          { label: 'Classe IV', value: '>2000ml (>40%), FC >140, PA muito baixa' }
        ]
      },
      {
        title: 'Reposição Volêmica',
        content: [
          { label: 'Cristaloide inicial', value: 'Ringer Lactato 1-2L aquecido' },
          { label: 'Transfusão maciça', value: 'CH:PFC:Plaquetas = 1:1:1' },
          { label: 'Ácido Tranexâmico', value: '1g IV em 10min + 1g em 8h (se <3h do trauma)' },
          { label: 'Meta de PA', value: 'PAS 80-90 mmHg (hipotensão permissiva)' }
        ]
      }
    ]
  },
  bls: {
    title: 'BLS - Suporte Básico',
    icon: Activity,
    color: 'from-blue-500 to-cyan-600',
    category: 'emergência',
    sections: [
      {
        title: 'Cadeia de Sobrevivência',
        content: [
          { label: '1. Reconhecimento', value: 'Identificar PCR, chamar ajuda' },
          { label: '2. RCP precoce', value: 'Iniciar compressões imediatamente' },
          { label: '3. Desfibrilação', value: 'Usar DEA assim que disponível' },
          { label: '4. SAV', value: 'Suporte avançado de vida' },
          { label: '5. Cuidados pós-PCR', value: 'Neuroproteção, hemodinâmica' }
        ]
      },
      {
        title: 'RCP de Alta Qualidade',
        content: [
          { label: 'Frequência', value: '100-120 compressões/min' },
          { label: 'Profundidade', value: '5-6 cm em adultos' },
          { label: 'Retorno', value: 'Permitir retorno completo do tórax' },
          { label: 'Interrupções', value: 'Minimizar (< 10 segundos)' },
          { label: 'Relação C:V', value: '30:2 (sem via aérea avançada)' }
        ]
      },
      {
        title: 'Uso do DEA',
        content: [
          { label: 'Ligar o DEA', value: 'Seguir comandos de voz' },
          { label: 'Fixar eletrodos', value: 'Ápice e infraclavicular D' },
          { label: 'Analisar ritmo', value: 'Afastar todos' },
          { label: 'Chocar se indicado', value: 'Afastar, apertar botão' },
          { label: 'Reiniciar RCP', value: 'Imediatamente após choque' }
        ]
      }
    ]
  },
  sepse: {
    title: 'Sepse - Pacote de 1 Hora',
    icon: AlertTriangle,
    color: 'from-red-600 to-rose-700',
    category: 'emergência',
    sections: [
      {
        title: 'Critérios de Sepse (qSOFA)',
        content: [
          { label: 'FR ≥ 22 irpm', value: '1 ponto' },
          { label: 'PAS ≤ 100 mmHg', value: '1 ponto' },
          { label: 'Alteração mental', value: '1 ponto' },
          { label: 'Interpretação', value: '≥2 pontos = alto risco de desfecho ruim' }
        ]
      },
      {
        title: 'Pacote de 1 Hora',
        content: [
          { label: 'Lactato sérico', value: 'Colher imediatamente' },
          { label: 'Hemoculturas', value: '2 pares antes do ATB' },
          { label: 'Antibiótico', value: 'Iniciar em até 1 hora' },
          { label: 'Cristaloide', value: '30 ml/kg se hipotensão ou lactato ≥4' },
          { label: 'Vasopressor', value: 'Se PAM <65 após volume' }
        ]
      },
      {
        title: 'Antibioticoterapia Empírica',
        content: [
          { label: 'Foco pulmonar', value: 'Ceftriaxona + Azitromicina' },
          { label: 'Foco abdominal', value: 'Piperacilina-Tazobactam ou Meropenem' },
          { label: 'Foco urinário', value: 'Ceftriaxona ou Ciprofloxacino' },
          { label: 'Foco cutâneo', value: 'Oxacilina ou Vancomicina' }
        ]
      }
    ]
  },
  avc: {
    title: 'AVC - Protocolo de Trombólise',
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
    category: 'emergência',
    sections: [
      {
        title: 'Critérios de Inclusão',
        content: [
          { label: 'Idade', value: '≥18 anos' },
          { label: 'Tempo', value: 'Até 4.5h do início dos sintomas' },
          { label: 'Déficit neurológico', value: 'Mensurável pelo NIHSS' },
          { label: 'TC de crânio', value: 'Sem hemorragia' }
        ]
      },
      {
        title: 'Contraindicações Absolutas',
        content: [
          { label: 'Hemorragia intracraniana', value: 'Atual ou prévia' },
          { label: 'AVC/TCE grave', value: 'Nos últimos 3 meses' },
          { label: 'Cirurgia intracraniana', value: 'Nos últimos 3 meses' },
          { label: 'Sangramento ativo', value: 'GI ou urinário' }
        ]
      },
      {
        title: 'Alteplase (rt-PA)',
        content: [
          { label: 'Dose total', value: '0.9 mg/kg (máx 90mg)' },
          { label: 'Bolus', value: '10% da dose em 1 min' },
          { label: 'Infusão', value: '90% restante em 60 min' },
          { label: 'Monitorização', value: 'PA a cada 15 min por 2h' },
          { label: 'Meta de PA', value: '<180/105 mmHg' }
        ]
      }
    ]
  },
  iam: {
    title: 'IAM - Síndrome Coronariana',
    icon: Heart,
    color: 'from-red-500 to-rose-600',
    category: 'emergência',
    sections: [
      {
        title: 'Diagnóstico',
        content: [
          { label: 'Clínica', value: 'Dor torácica típica >20 min' },
          { label: 'ECG', value: 'Supra de ST ≥1mm em 2 derivações contíguas' },
          { label: 'Troponina', value: 'Elevação acima do p99' },
          { label: 'Parede anterior', value: 'V1-V4' },
          { label: 'Parede inferior', value: 'DII, DIII, aVF' }
        ]
      },
      {
        title: 'MONABCH',
        content: [
          { label: 'M - Morfina', value: '2-4mg IV se dor refratária' },
          { label: 'O - Oxigênio', value: 'Se SpO2 <90%' },
          { label: 'N - Nitrato', value: 'SL ou IV (CI: VD, PAS<90, sildenafil)' },
          { label: 'A - AAS', value: '200-300mg mastigado' },
          { label: 'B - Betabloqueador', value: 'Metoprolol 5mg IV' },
          { label: 'C - Clopidogrel', value: '300-600mg ataque' },
          { label: 'H - Heparina', value: 'Enoxaparina 1mg/kg SC' }
        ]
      },
      {
        title: 'Reperfusão',
        content: [
          { label: 'ICP primária', value: 'Preferencial se <120 min' },
          { label: 'Fibrinólise', value: 'Se ICP não disponível em 120 min' },
          { label: 'Tenecteplase', value: '30-50mg conforme peso' },
          { label: 'Alteplase', value: '15mg bolus + 0.75mg/kg em 30min + 0.5mg/kg em 60min' }
        ]
      }
    ]
  },
  anafilaxia: {
    title: 'Anafilaxia',
    icon: AlertTriangle,
    color: 'from-red-600 to-rose-700',
    category: 'emergência',
    sections: [
      {
        title: 'Diagnóstico',
        content: [
          { label: 'Critério 1', value: 'Pele/mucosa + respiratório OU hipotensão' },
          { label: 'Critério 2', value: '≥2 sistemas após alérgeno provável' },
          { label: 'Critério 3', value: 'Hipotensão após alérgeno conhecido' }
        ]
      },
      {
        title: 'Tratamento Imediato',
        content: [
          { label: 'ADRENALINA IM', value: '0.3-0.5mg (0.01mg/kg) coxa lateral' },
          { label: 'Repetir', value: 'A cada 5-15 min se necessário' },
          { label: 'Posição', value: 'Decúbito dorsal, elevar MMII' },
          { label: 'Acesso venoso', value: '2 acessos calibrosos' },
          { label: 'Volume', value: 'SF 0.9% 20ml/kg rápido' }
        ]
      },
      {
        title: 'Doses de Adrenalina 1:1000',
        content: [
          { label: 'Adultos', value: '0.3-0.5 ml IM' },
          { label: 'Crianças', value: '0.01 ml/kg (máx 0.3ml) IM' },
          { label: 'Adolescentes', value: '0.3 ml IM' },
          { label: 'Via', value: 'SEMPRE IM - face lateral da coxa' }
        ]
      },
      {
        title: 'Medicações Adjuvantes',
        content: [
          { label: 'Anti-histamínico', value: 'Difenidramina 25-50mg IV' },
          { label: 'Corticoide', value: 'Metilprednisolona 1-2mg/kg IV' },
          { label: 'Broncodilatador', value: 'Salbutamol NBZ se broncoespasmo' },
          { label: 'Glucagon', value: '1-5mg IV se em uso de betabloqueador' }
        ]
      }
    ]
  }
};

// Escalas de gravidade
const scales = {
  news: {
    title: 'NEWS - National Early Warning Score',
    parameters: [
      { param: 'FR', ranges: [{ range: '≤8', score: 3 }, { range: '9-11', score: 1 }, { range: '12-20', score: 0 }, { range: '21-24', score: 2 }, { range: '≥25', score: 3 }] },
      { param: 'SpO2', ranges: [{ range: '≤91', score: 3 }, { range: '92-93', score: 2 }, { range: '94-95', score: 1 }, { range: '≥96', score: 0 }] },
      { param: 'PAS', ranges: [{ range: '≤90', score: 3 }, { range: '91-100', score: 2 }, { range: '101-110', score: 1 }, { range: '111-219', score: 0 }, { range: '≥220', score: 3 }] },
      { param: 'FC', ranges: [{ range: '≤40', score: 3 }, { range: '41-50', score: 1 }, { range: '51-90', score: 0 }, { range: '91-110', score: 1 }, { range: '111-130', score: 2 }, { range: '≥131', score: 3 }] },
      { param: 'Consciência', ranges: [{ range: 'Alerta', score: 0 }, { range: 'Confuso', score: 3 }] },
      { param: 'Temperatura', ranges: [{ range: '≤35', score: 3 }, { range: '35.1-36', score: 1 }, { range: '36.1-38', score: 0 }, { range: '38.1-39', score: 1 }, { range: '≥39.1', score: 2 }] }
    ],
    interpretation: [
      { range: '0', action: 'Baixo risco - Monitorização de rotina' },
      { range: '1-4', action: 'Risco baixo - Aumentar frequência de avaliação' },
      { range: '5-6', action: 'Risco médio - Resposta clínica urgente' },
      { range: '≥7', action: 'Alto risco - Resposta de emergência' }
    ]
  },
  qsofa: {
    title: 'qSOFA - Quick SOFA',
    parameters: [
      { param: 'PAS ≤100 mmHg', score: 1 },
      { param: 'FR ≥22 irpm', score: 1 },
      { param: 'Alteração mental (Glasgow <15)', score: 1 }
    ],
    interpretation: '≥2 pontos: Alto risco de desfecho ruim em sepse'
  },
  glasgow: {
    title: 'Escala de Coma de Glasgow',
    parameters: [
      { category: 'Abertura Ocular', items: [{ response: 'Espontânea', score: 4 }, { response: 'Ao estímulo verbal', score: 3 }, { response: 'Ao estímulo doloroso', score: 2 }, { response: 'Ausente', score: 1 }] },
      { category: 'Resposta Verbal', items: [{ response: 'Orientada', score: 5 }, { response: 'Confusa', score: 4 }, { response: 'Palavras inapropriadas', score: 3 }, { response: 'Sons incompreensíveis', score: 2 }, { response: 'Ausente', score: 1 }] },
      { category: 'Resposta Motora', items: [{ response: 'Obedece comandos', score: 6 }, { response: 'Localiza dor', score: 5 }, { response: 'Retirada inespecífica', score: 4 }, { response: 'Flexão anormal', score: 3 }, { response: 'Extensão anormal', score: 2 }, { response: 'Ausente', score: 1 }] }
    ],
    interpretation: [
      { range: '13-15', severity: 'Leve' },
      { range: '9-12', severity: 'Moderado' },
      { range: '3-8', severity: 'Grave' }
    ]
  }
};

export default function Protocolos() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('protocolos');
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  
  const protocolsArray = Object.values(protocols);
  const { 
    searchTerm, 
    setSearchTerm, 
    results: filteredProtocols,
    isSearching 
  } = useOptimizedSearch(protocolsArray, ['title', 'category'], { debounceMs: 150 });

  const renderProtocolCard = (key, protocol) => {
    const Icon = protocol.icon;
    return (
      <Card 
        key={key}
        className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
        onClick={() => setSelectedProtocol(protocol)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${protocol.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">{protocol.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{protocol.sections.length} seções</p>
              <Badge className="mt-2 bg-red-100 text-red-700">EMERGÊNCIA</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-red-500" />
                Protocolos de Emergência
              </h1>
              <p className="text-slate-500 mt-1">PALS, ACLS, ATLS, BLS e mais</p>
            </div>
            {selectedProtocol && (
              <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Protocolos
              </Button>
            )}
          </div>

          {!selectedProtocol ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
                <TabsTrigger value="escalas">Escalas de Gravidade</TabsTrigger>
              </TabsList>

              <TabsContent value="protocolos">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar protocolo..."
                      className="pl-9 pr-9 h-9 text-sm bg-white border-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(searchTerm ? filteredProtocols : protocolsArray).map((protocol) => renderProtocolCard(protocol.title, protocol))}
                </div>
              </TabsContent>

              <TabsContent value="escalas">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* NEWS */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-red-700 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        {scales.news.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {scales.news.interpretation.map((item, i) => (
                          <div key={i} className={`p-3 rounded-lg ${
                            i === 0 ? 'bg-green-50 border border-green-200' :
                            i === 1 ? 'bg-yellow-50 border border-yellow-200' :
                            i === 2 ? 'bg-orange-50 border border-orange-200' :
                            'bg-red-50 border border-red-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <Badge>{item.range}</Badge>
                              <span className="text-sm">{item.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* qSOFA */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {scales.qsofa.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {scales.qsofa.parameters.map((param, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-700">{param.param}</span>
                            <Badge>{param.score} ponto</Badge>
                          </div>
                        ))}
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                          <p className="text-sm text-red-800 font-medium">{scales.qsofa.interpretation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Glasgow */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-700 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        {scales.glasgow.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {scales.glasgow.parameters.map((category, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-slate-800 mb-3">{category.category}</h4>
                            <div className="space-y-2">
                              {category.items.map((item, j) => (
                                <div key={j} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">{item.response}</span>
                                  <Badge variant="outline">{item.score}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 justify-center">
                        {scales.glasgow.interpretation.map((item, i) => (
                          <Badge key={i} className={
                            i === 0 ? 'bg-green-100 text-green-700' :
                            i === 1 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {item.range}: {item.severity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Protocol Detail View */
            <div className="space-y-6">
              <Card className="backdrop-blur-xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <selectedProtocol.icon className="w-12 h-12" />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedProtocol.title}</h2>
                      <Badge className="mt-2 bg-white/20 text-white">EMERGÊNCIA</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedProtocol.sections.map((section, i) => (
                <Card key={i} className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-red-500" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.content.map((item, j) => (
                        <div key={j} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                          <div className="w-32 flex-shrink-0">
                            <span className="font-medium text-slate-700">{item.label}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-slate-600">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <DisclaimerFooter variant="protocolo" />
        </div>
      </main>
    </div>
  );
}