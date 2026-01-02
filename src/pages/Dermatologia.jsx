import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  AlertCircle,
  BookOpen,
  Eye,
  Search,
  ChevronRight,
  Stethoscope,
  ImageIcon,
  Calculator
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';

// Estrutura completa de afecções dermatológicas
const afeccoesDermatologicas = {
  infectoparasitarias: {
    titulo: 'Doenças Infectoparasitárias da Pele',
    color: 'bg-emerald-600',
    afeccoes: [
      {
        nome: 'Hanseníase',
        slug: 'hanseniase',
        classificacao: 'Infecção bacteriana',
        quadro_clinico: 'Manchas hipocrômicas ou eritematosas com alteração de sensibilidade, lesões infiltradas, nódulos',
        diagnostico: 'Baciloscopia, biópsia, avaliação neurológica',
        tratamento_resumo: 'Poliquimioterapia (PQT) conforme classificação operacional'
      },
      {
        nome: 'Micoses Cutâneas - Ceratofitoses',
        slug: 'ceratofitoses',
        classificacao: 'Infecção fúngica superficial',
        quadro_clinico: 'Pitiríase versicolor: máculas hipocrômicas ou hipercrômicas descamativas',
        diagnostico: 'Exame micológico direto',
        tratamento_resumo: 'Antifúngicos tópicos ou sistêmicos'
      },
      {
        nome: 'Dermatofitoses (Tinhas)',
        slug: 'dermatofitoses',
        classificacao: 'Infecção fúngica',
        quadro_clinico: 'Lesões anulares descamativas, prurido, acometimento de pele, cabelo ou unhas',
        diagnostico: 'Exame micológico direto e cultura',
        tratamento_resumo: 'Antifúngicos tópicos ou sistêmicos conforme localização'
      },
      {
        nome: 'Esporotricose',
        slug: 'esporotricose',
        classificacao: 'Micose subcutânea',
        quadro_clinico: 'Nódulos que ulceram, disposição linear ascendente (trajeto linfático)',
        diagnostico: 'Cultura, histopatológico',
        tratamento_resumo: 'Itraconazol por tempo prolongado'
      },
      {
        nome: 'Leishmaniose Tegumentar Americana',
        slug: 'leishmaniose',
        classificacao: 'Parasitose',
        quadro_clinico: 'Úlcera indolor com bordas elevadas, fundo granuloso',
        diagnostico: 'Biópsia, PCR, teste de Montenegro',
        tratamento_resumo: 'Antimonial pentavalente, anfotericina B',
        obs: 'Diagnóstico diferencial: PLECT (Paracoccidioidomicose, Leishmaniose, Esporotricose, Cromomicose, Tuberculose Cutânea)'
      },
      {
        nome: 'Escabiose',
        slug: 'escabiose',
        classificacao: 'Ectoparasitose',
        quadro_clinico: 'Prurido intenso noturno, lesões em sulcos interdigitais, punhos, axilas, genitália',
        diagnostico: 'Clínico, raspado de lesão (ácaro)',
        tratamento_resumo: 'Permetrina 5% tópica, ivermectina oral'
      },
      {
        nome: 'Molusco Contagioso',
        slug: 'molusco-contagioso',
        classificacao: 'Dermatovirose',
        quadro_clinico: 'Pápulas umbilicadas, brilhantes, conteúdo caseoso central',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Curetagem, crioterapia, observação (autolimitada)'
      }
    ]
  },
  dermatoses_agudas: {
    titulo: 'Dermatoses Agudas',
    color: 'bg-red-600',
    afeccoes: [
      {
        nome: 'Herpes Zóster',
        slug: 'herpes-zoster',
        quadro_clinico: 'Vesículas agrupadas em base eritematosa, distribuição dermatomérica unilateral, dor',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Aciclovir, valaciclovir, analgesia'
      },
      {
        nome: 'Impetigo',
        slug: 'impetigo',
        quadro_clinico: 'Vesículas/pústulas que rompem formando crostas melicéricas (cor de mel)',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Antibióticos tópicos ou sistêmicos'
      },
      {
        nome: 'Erisipela',
        slug: 'erisipela',
        quadro_clinico: 'Eritema intenso, bordas elevadas bem delimitadas, calor, dor, febre',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Penicilina, cefalosporinas'
      },
      {
        nome: 'Celulite',
        slug: 'celulite',
        quadro_clinico: 'Eritema difuso, calor, edema, dor, limites imprecisos',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Antibióticos (cobertura para estreptococos e estafilococos)'
      },
      {
        nome: 'Abscesso',
        slug: 'abscesso',
        quadro_clinico: 'Nódulo eritematoso doloroso com flutuação, secreção purulenta',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Drenagem cirúrgica + antibioticoterapia'
      },
      {
        nome: 'Fasciíte Necrosante',
        slug: 'fascite-necrosante',
        quadro_clinico: 'Eritema rapidamente progressivo, dor desproporcional, crepitação, necrose, toxemia',
        diagnostico: 'Clínico + imagem (TC/RM)',
        tratamento_resumo: 'EMERGÊNCIA CIRÚRGICA + antibióticos de amplo espectro'
      }
    ]
  },
  farmacodermias: {
    titulo: 'Farmacodermias e Reações de Hipersensibilidade',
    color: 'bg-purple-600',
    afeccoes: [
      {
        nome: 'Exantema Medicamentoso',
        slug: 'exantema',
        quadro_clinico: 'Erupção maculopapular simétrica, início 5-14 dias após medicação',
        diagnostico: 'Clínico + história medicamentosa',
        tratamento_resumo: 'Suspender medicação, anti-histamínicos, corticoides'
      },
      {
        nome: 'Urticária',
        slug: 'urticaria',
        quadro_clinico: 'Placas eritematosas elevadas (urticas), prurido, lesões migratórias (<24h)',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Anti-histamínicos, corticoides'
      },
      {
        nome: 'Angioedema',
        slug: 'angioedema',
        quadro_clinico: 'Edema de pálpebras, lábios, língua, mucosas (camadas profundas)',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Anti-histamínicos, corticoides, adrenalina se comprometimento de via aérea'
      },
      {
        nome: 'Angioedema Hereditário',
        slug: 'angioedema-hereditario',
        quadro_clinico: 'Edema recorrente sem prurido, história familiar, deficiência C1-esterase',
        diagnostico: 'Dosagem de C1-INH, C4',
        tratamento_resumo: 'C1-INH concentrado, icatibanto, ácido tranexâmico profilático'
      },
      {
        nome: 'Anafilaxia',
        slug: 'anafilaxia',
        quadro_clinico: 'Urticária + angioedema + broncoespasmo + hipotensão',
        diagnostico: 'Clínico',
        tratamento_resumo: 'ADRENALINA IM, O2, volume, anti-histamínicos, corticoides'
      },
      {
        nome: 'Eritema Multiforme',
        slug: 'eritema-multiforme',
        quadro_clinico: 'Lesões em alvo, palmas e plantas, pode acometer mucosas',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Suporte, tratar causa base (infecções)'
      },
      {
        nome: 'DRESS Syndrome',
        slug: 'dress',
        quadro_clinico: 'Exantema + febre + eosinofilia + acometimento de órgãos (fígado, rins)',
        diagnostico: 'Clínico + laboratorial',
        tratamento_resumo: 'Suspender droga, corticoides sistêmicos'
      },
      {
        nome: 'Stevens-Johnson / Necrólise Epidérmica Tóxica',
        slug: 'stevens-johnson',
        quadro_clinico: 'Bolhas extensas, mucosas acometidas, descolamento epidérmico, Nikolsky+',
        diagnostico: 'Clínico + biópsia',
        tratamento_resumo: 'UTI/queimados, suporte intensivo, suspender droga, considerar imunoglobulina'
      }
    ]
  },
  dermatites_eczematosas: {
    titulo: 'Dermatites Eczematosas',
    color: 'bg-blue-600',
    afeccoes: [
      {
        nome: 'Dermatite Atópica',
        slug: 'dermatite-atopica',
        quadro_clinico: 'Eczema crônico, prurido intenso, xerose, liquenificação, história de atopia',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Hidratação, corticoides tópicos, anti-histamínicos'
      },
      {
        nome: 'Dermatite de Contato',
        slug: 'dermatite-contato',
        quadro_clinico: 'Eritema, vesículas, prurido, limites bem delimitados no local de contato',
        diagnostico: 'Clínico + teste de contato',
        tratamento_resumo: 'Evitar alérgeno, corticoides tópicos'
      },
      {
        nome: 'Eczema Numular',
        slug: 'eczema-numular',
        quadro_clinico: 'Placas eczematosas circulares (formato de moeda), prurido',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Corticoides tópicos, hidratação'
      },
      {
        nome: 'Dermatite de Estase',
        slug: 'dermatite-estase',
        quadro_clinico: 'Eczema em membros inferiores, hiperpigmentação ocre, edema, insuficiência venosa',
        diagnostico: 'Clínico + doppler venoso',
        tratamento_resumo: 'Corticoides tópicos, compressão elástica, tratar insuficiência venosa'
      },
      {
        nome: 'Eczema Disidrótico',
        slug: 'eczema-disidrotico',
        quadro_clinico: 'Vesículas profundas pruriginosas em palmas e plantas',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Corticoides tópicos potentes'
      },
      {
        nome: 'Dermatite Seborreica',
        slug: 'dermatite-seborreica',
        quadro_clinico: 'Eritema e descamação em áreas seborreicas (couro cabeludo, face, tronco)',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Antifúngicos tópicos, corticoides leves'
      },
      {
        nome: 'Eczema Asteatótico',
        slug: 'eczema-asteatotico',
        quadro_clinico: 'Pele seca com fissuras (padrão de craquelé), prurido, comum em idosos',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Hidratação intensa, evitar banhos quentes'
      }
    ]
  },
  eritematodescamativas: {
    titulo: 'Dermatites Eritematodescamativas e Papulares',
    color: 'bg-orange-600',
    afeccoes: [
      {
        nome: 'Psoríase',
        slug: 'psoriase',
        quadro_clinico: 'Placas eritematosas bem delimitadas com escamas prateadas, Auspitz+',
        diagnostico: 'Clínico + biópsia',
        tratamento_resumo: 'Corticoides tópicos, análogos de vitamina D, fototerapia, imunobiológicos'
      },
      {
        nome: 'Líquen Plano',
        slug: 'liquen-plano',
        quadro_clinico: 'Pápulas violáceas poligonais pruriginosas (5 P: púrpura, poligonal, plana, pruriginosa, papular)',
        diagnostico: 'Clínico + biópsia',
        tratamento_resumo: 'Corticoides tópicos ou sistêmicos'
      },
      {
        nome: 'Líquen Nítido',
        slug: 'liquen-nitido',
        quadro_clinico: 'Micropápulas brilhantes agrupadas',
        diagnostico: 'Clínico + biópsia',
        tratamento_resumo: 'Autolimitado, corticoides tópicos'
      },
      {
        nome: 'Líquen Simples Crônico',
        slug: 'liquen-simples-cronico',
        quadro_clinico: 'Placa liquenificada por coçadura crônica',
        diagnostico: 'Clínico',
        tratamento_resumo: 'Corticoides tópicos potentes, quebrar ciclo de coçadura'
      }
    ]
  },
  bolhosas: {
    titulo: 'Dermatoses Bolhosas Crônicas',
    color: 'bg-indigo-600',
    afeccoes: [
      {
        nome: 'Pênfigo Vulgar',
        slug: 'penfigo-vulgar',
        quadro_clinico: 'Bolhas flácidas, Nikolsky+, mucosas acometidas',
        diagnostico: 'Biópsia + imunofluorescência direta',
        tratamento_resumo: 'Corticoides sistêmicos, imunossupressores'
      },
      {
        nome: 'Pênfigo Foliáceo',
        slug: 'penfigo-foliaceo',
        quadro_clinico: 'Bolhas superficiais, crostas, sem acometimento mucoso',
        diagnostico: 'Biópsia + imunofluorescência',
        tratamento_resumo: 'Corticoides sistêmicos, imunossupressores'
      },
      {
        nome: 'Penfigoide Bolhoso',
        slug: 'penfigoide-bolhoso',
        quadro_clinico: 'Bolhas tensas, Nikolsky-, idosos',
        diagnostico: 'Biópsia + imunofluorescência',
        tratamento_resumo: 'Corticoides tópicos potentes ou sistêmicos'
      },
      {
        nome: 'Dermatite Herpetiforme',
        slug: 'dermatite-herpetiforme',
        quadro_clinico: 'Vesículas agrupadas pruriginosas, doença celíaca associada',
        diagnostico: 'Biópsia + imunofluorescência',
        tratamento_resumo: 'Dapsona, dieta sem glúten'
      }
    ]
  },
  oncologia: {
    titulo: 'Oncologia Dermatológica',
    color: 'bg-slate-700',
    afeccoes: [
      {
        nome: 'Queratose Actínica (Pré-neoplásica)',
        slug: 'queratose-actinica',
        quadro_clinico: 'Mácula ou placa eritematosa áspera, áreas fotoexpostas',
        diagnostico: 'Clínico + biópsia',
        tratamento_resumo: 'Crioterapia, 5-fluorouracil tópico, imiquimode'
      },
      {
        nome: 'Carcinoma Basocelular (CBC)',
        slug: 'carcinoma-basocelular',
        quadro_clinico: 'Pápula perolada com telangiectasias, pode ulcerar (úlcera roedora)',
        diagnostico: 'Biópsia',
        tratamento_resumo: 'Excisão cirúrgica, cirurgia de Mohs'
      },
      {
        nome: 'Carcinoma Espinocelular (CEC)',
        slug: 'carcinoma-espinocelular',
        quadro_clinico: 'Placa ou nódulo verrucoso que ulcera, áreas fotoexpostas',
        diagnostico: 'Biópsia',
        tratamento_resumo: 'Excisão cirúrgica com margem adequada'
      },
      {
        nome: 'Melanoma',
        slug: 'melanoma',
        quadro_clinico: 'Lesão pigmentada com critérios ABCDE (Assimetria, Bordas, Cor, Diâmetro >6mm, Evolução)',
        diagnostico: 'Biópsia excisional',
        tratamento_resumo: 'Excisão ampliada, pesquisa de linfonodo sentinela, imunoterapia/quimioterapia',
        obs: 'Epidemiologia: Mais letal dos cânceres de pele. Detecção precoce é fundamental.'
      },
      {
        nome: 'Nevos',
        slug: 'nevos',
        quadro_clinico: 'Lesões pigmentadas benignas, simétricas, bordas regulares',
        diagnostico: 'Clínico + dermatoscopia',
        tratamento_resumo: 'Acompanhamento, excisão se suspeita de malignidade'
      }
    ]
  }
};

export default function Dermatologia() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('afeccoes');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const todasAfeccoes = Object.values(afeccoesDermatologicas).flatMap(cat => 
    cat.afeccoes.map(a => ({ ...a, categoria: cat.titulo }))
  );
  
  const afeccoesFiltradas = todasAfeccoes.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.quadro_clinico?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Dermatologia</h1>
              <p className="text-xs text-slate-500">Afecções, semiologia, atlas visual e scores</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 p-0.5 mb-4">
              <TabsTrigger value="afeccoes" className="text-xs h-8 gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Afecções
              </TabsTrigger>
              <TabsTrigger value="semiologia" className="text-xs h-8 gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> Semiologia
              </TabsTrigger>
              <TabsTrigger value="atlas" className="text-xs h-8 gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Atlas Visual
              </TabsTrigger>
              <TabsTrigger value="scores" className="text-xs h-8 gap-1">
                <Calculator className="w-3.5 h-3.5" /> Scores
              </TabsTrigger>
            </TabsList>

            {/* ABA 1: AFECÇÕES DERMATOLÓGICAS */}
            <TabsContent value="afeccoes">
              {categoriaSelecionada ? (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCategoriaSelecionada(null)} 
                    className="text-xs h-7"
                  >
                    <ChevronRight className="w-3 h-3 mr-1 rotate-180" /> Voltar
                  </Button>

                  <div className="space-y-3">
                    {categoriaSelecionada.afeccoes.map((afeccao) => (
                      <Card key={afeccao.slug} className="bg-white border border-slate-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-slate-800">
                            {afeccao.nome}
                          </CardTitle>
                          {afeccao.classificacao && (
                            <Badge variant="outline" className="w-fit text-[9px]">
                              {afeccao.classificacao}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {afeccao.quadro_clinico && (
                            <div>
                              <p className="text-[9px] text-slate-500 mb-0.5">Quadro clínico:</p>
                              <p className="text-[10px] text-slate-700">{afeccao.quadro_clinico}</p>
                            </div>
                          )}
                          {afeccao.diagnostico && (
                            <div>
                              <p className="text-[9px] text-slate-500 mb-0.5">Diagnóstico:</p>
                              <p className="text-[10px] text-slate-700">{afeccao.diagnostico}</p>
                            </div>
                          )}
                          {afeccao.tratamento_resumo && (
                            <div>
                              <p className="text-[9px] text-slate-500 mb-0.5">Tratamento:</p>
                              <p className="text-[10px] text-slate-700">{afeccao.tratamento_resumo}</p>
                            </div>
                          )}
                          {afeccao.obs && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-100">
                              <p className="text-[10px] text-blue-700">
                                <strong>Obs:</strong> {afeccao.obs}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Search */}
                  <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                    <CardContent className="p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Buscar afecção..."
                          className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {searchTerm ? (
                    <div className="space-y-2">
                      {afeccoesFiltradas.map((afeccao) => (
                        <Card 
                          key={afeccao.slug} 
                          className="bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all"
                        >
                          <CardContent className="p-3">
                            <h4 className="text-xs font-semibold text-slate-800 mb-1">{afeccao.nome}</h4>
                            <Badge variant="outline" className="text-[8px] mb-2">{afeccao.categoria}</Badge>
                            {afeccao.quadro_clinico && (
                              <p className="text-[10px] text-slate-600">{afeccao.quadro_clinico}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(afeccoesDermatologicas).map(([key, categoria]) => (
                        <button 
                          key={key} 
                          onClick={() => setCategoriaSelecionada(categoria)} 
                          className="group text-left"
                        >
                          <Card className="bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all h-full">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg ${categoria.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-slate-800 mb-1">
                                    {categoria.titulo}
                                  </h3>
                                  <Badge variant="outline" className="text-[8px]">
                                    {categoria.afeccoes.length} afecções
                                  </Badge>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </CardContent>
                          </Card>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ABA 2: SEMIOLOGIA */}
            <TabsContent value="semiologia">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Stethoscope className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    Semiologia Dermatológica
                  </h3>
                  <p className="text-xs text-slate-600">
                    Conteúdo em desenvolvimento: Terminologia dermatológica, técnicas de exame físico, 
                    descrição sistemática de lesões elementares.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 3: ATLAS VISUAL */}
            <TabsContent value="atlas">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <ImageIcon className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    Atlas Visual Dermatológico
                  </h3>
                  <p className="text-xs text-slate-600">
                    Conteúdo em desenvolvimento: Imagens de referência das principais afecções dermatológicas, 
                    fotos clínicas, dermatoscopia.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 4: SCORES */}
            <TabsContent value="scores">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-6 text-center">
                  <Calculator className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    Scores de Avaliação
                  </h3>
                  <p className="text-xs text-slate-600">
                    Conteúdo em desenvolvimento: Regra ABCDE para melanoma, PASI para psoríase, 
                    SCORAD para dermatite atópica, SCORTEN para NET.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DisclaimerFooter />
        </div>
      </main>
    </div>
  );
}