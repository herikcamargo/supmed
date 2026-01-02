import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import useOptimizedSearch from '../components/search/useOptimizedSearch';
import {
  BookOpen,
  Search,
  Heart,
  Brain,
  Stethoscope,
  Baby,
  Bone,
  Eye,
  Activity,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Ambulance,
  Syringe,
  Skull,
  Timer
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import ContentVersionBadge from '../components/content/ContentVersionBadge';
import OfflineIndicator from '../components/content/OfflineIndicator';

// Guidelines - Especialidades
const specialties = [
  { id: 'cardiologia', label: 'Cardiologia', icon: Heart, color: 'from-red-500 to-rose-600' },
  { id: 'neurologia', label: 'Neurologia', icon: Brain, color: 'from-purple-500 to-violet-600' },
  { id: 'pneumologia', label: 'Pneumologia', icon: Stethoscope, color: 'from-blue-500 to-cyan-600' },
  { id: 'pediatria', label: 'Pediatria', icon: Baby, color: 'from-pink-500 to-rose-500' },
  { id: 'ortopedia', label: 'Ortopedia', icon: Bone, color: 'from-amber-500 to-orange-500' },
  { id: 'oftalmologia', label: 'Oftalmologia', icon: Eye, color: 'from-green-500 to-emerald-600' },
  { id: 'emergencia', label: 'Emergência', icon: Activity, color: 'from-red-600 to-rose-700' }
];

const commonGuidelines = [
  { title: 'ACLS - Suporte Avançado de Vida', specialty: 'Emergência', year: '2023' },
  { title: 'Infarto Agudo do Miocárdio', specialty: 'Cardiologia', year: '2023' },
  { title: 'AVC Isquêmico Agudo', specialty: 'Neurologia', year: '2023' },
  { title: 'Pneumonia Adquirida na Comunidade', specialty: 'Pneumologia', year: '2022' },
  { title: 'Sepse e Choque Séptico', specialty: 'Emergência', year: '2023' },
  { title: 'Diabetes Mellitus Tipo 2', specialty: 'Endocrinologia', year: '2023' }
];

// Protocolos completos (do arquivo original)
const protocols = {
  pals: {
    title: 'PALS - Suporte Avançado Pediátrico',
    icon: Baby,
    color: 'from-pink-500 to-rose-600',
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
      }
    ]
  },
  atls: {
    title: 'ATLS - Trauma',
    icon: Ambulance,
    color: 'from-orange-500 to-amber-600',
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
      }
    ]
  },
  sepse: {
    title: 'Sepse - Pacote de 1 Hora',
    icon: AlertTriangle,
    color: 'from-red-600 to-rose-700',
    sections: [
      {
        title: 'Pacote de 1 Hora',
        content: [
          { label: 'Lactato sérico', value: 'Colher imediatamente' },
          { label: 'Hemoculturas', value: '2 pares antes do ATB' },
          { label: 'Antibiótico', value: 'Iniciar em até 1 hora' },
          { label: 'Cristaloide', value: '30 ml/kg se hipotensão ou lactato ≥4' },
          { label: 'Vasopressor', value: 'Se PAM <65 após volume' }
        ]
      }
    ]
  },
  anafilaxia: {
    title: 'Anafilaxia',
    icon: AlertTriangle,
    color: 'from-red-600 to-rose-700',
    sections: [
      {
        title: 'Tratamento Imediato',
        content: [
          { label: 'ADRENALINA IM', value: '0.3-0.5mg (0.01mg/kg) coxa lateral' },
          { label: 'Repetir', value: 'A cada 5-15 min se necessário' },
          { label: 'Posição', value: 'Decúbito dorsal, elevar MMII' },
          { label: 'Volume', value: 'SF 0.9% 20ml/kg rápido' }
        ]
      }
    ]
  }
};

export default function GuidelinesProtocolos() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainTab, setMainTab] = useState('guidelines');
  
  // Guidelines state
  const [guidelineSearchTerm, setGuidelineSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [guidelineResult, setGuidelineResult] = useState(null);
  const [isGuidelineSearching, setIsGuidelineSearching] = useState(false);
  
  // Protocolos state
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  
  const protocolsArray = Object.values(protocols);
  const { 
    searchTerm: protocolSearchTerm, 
    setSearchTerm: setProtocolSearchTerm, 
    results: filteredProtocols,
    isSearching: isProtocolSearching
  } = useOptimizedSearch(protocolsArray, ['title'], { debounceMs: 150 });

  const handleGuidelineSearch = async (term = guidelineSearchTerm) => {
    if (!term.trim()) return;
    
    setIsGuidelineSearching(true);
    
    try {
      const { contentManager } = await import('../components/content/ContentManager');
      
      const slug = `guideline-${term.toLowerCase().replace(/\s+/g, '-')}`;
      const content = await contentManager.get(slug, {
        modulo: 'guidelines',
        tipo: 'guideline'
      });

      contentManager.trackAccess(slug);
      setGuidelineResult(content.conteudo);
    } catch (error) {
      console.error('Erro ao buscar guideline:', error);
    } finally {
      setIsGuidelineSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-500" />
              Guidelines & Protocolos
            </h1>
            <p className="text-slate-500 mt-1">Diretrizes atualizadas e protocolos de emergência</p>
          </div>

          {/* Tabs Principais */}
          <Tabs value={mainTab} onValueChange={setMainTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="guidelines">
                <BookOpen className="w-4 h-4 mr-2" />
                Guidelines
              </TabsTrigger>
              <TabsTrigger value="protocolos">
                <Zap className="w-4 h-4 mr-2" />
                Protocolos de Emergência
              </TabsTrigger>
            </TabsList>

            {/* ABA GUIDELINES */}
            <TabsContent value="guidelines">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar guideline (ex: IAM, AVC, Sepse)..."
                        className="pl-10"
                        value={guidelineSearchTerm}
                        onChange={(e) => setGuidelineSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGuidelineSearch()}
                      />
                    </div>
                    <Button 
                      onClick={() => handleGuidelineSearch()} 
                      disabled={isGuidelineSearching}
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                    >
                      {isGuidelineSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => {
                      const Icon = spec.icon;
                      const isSelected = selectedSpecialty === spec.id;
                      return (
                        <Button
                          key={spec.id}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSpecialty(isSelected ? null : spec.id)}
                          className={isSelected ? `bg-gradient-to-r ${spec.color} border-0` : ''}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {spec.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {isGuidelineSearching && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Buscando diretrizes atualizadas...</p>
                  </CardContent>
                </Card>
              )}

              {guidelineResult && !isGuidelineSearching && (
                <div className="space-y-6">
                  <div className="flex items-center justify-end gap-2">
                    <OfflineIndicator />
                    <ContentVersionBadge content={guidelineResult} variant="compact" />
                  </div>

                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{guidelineResult.guideline_name || guidelineResult.titulo}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{guidelineResult.source || guidelineResult.fonte_primaria}</Badge>
                            <Badge className="bg-cyan-100 text-cyan-700">{guidelineResult.year || '2024'}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-700">
                        Principais Conceitos da Diretriz (educacional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {guidelineResult.key_recommendations?.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                              {i + 1}
                            </span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-amber-700 mt-3 pt-3 border-t border-slate-200 font-medium">
                        ⚠️ Conceitos educacionais. A aplicação clínica depende de avaliação individualizada.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!guidelineResult && !isGuidelineSearching && (
                <>
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                    Guidelines Populares
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {commonGuidelines.map((guide, i) => (
                      <Card
                        key={i}
                        className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => {
                          setGuidelineSearchTerm(guide.title);
                          handleGuidelineSearch(guide.title);
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-slate-800 group-hover:text-cyan-600 transition-colors">
                                {guide.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {guide.specialty}
                                </Badge>
                                <span className="text-xs text-slate-400">{guide.year}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* ABA PROTOCOLOS */}
            <TabsContent value="protocolos">
              {!selectedProtocol ? (
                <>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar protocolo..."
                        className="pl-9 bg-white"
                        value={protocolSearchTerm}
                        onChange={(e) => setProtocolSearchTerm(e.target.value)}
                      />
                      {isProtocolSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(protocolSearchTerm ? filteredProtocols : protocolsArray).map((protocol) => {
                      const Icon = protocol.icon;
                      return (
                        <Card 
                          key={protocol.title}
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
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar aos Protocolos
                    </Button>
                  </div>

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
            </TabsContent>
          </Tabs>

          <DisclaimerFooter variant="ia" />
        </div>
      </main>
    </div>
  );
}