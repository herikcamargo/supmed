import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import {
  Heart,
  Search,
  Baby,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Milk,
  Calendar,
  Shield,
  BookOpen,
  Stethoscope,
  Clipboard,
  Phone
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import ContentVersionBadge from '../components/content/ContentVersionBadge';
import OfflineIndicator from '../components/content/OfflineIndicator';

// ANVISA: Órgão regulatório brasileiro (RDC 344/1998 e legislação vigente)
const anvisaCategories = {
  A: { label: 'Categoria A (ANVISA)', color: 'bg-green-100 text-green-700 border-green-200', description: 'Estudos controlados não demonstraram risco', safe: true },
  B: { label: 'Categoria B (ANVISA)', color: 'bg-blue-100 text-blue-700 border-blue-200', description: 'Estudos em animais sem risco ou estudos inadequados em humanos', safe: true },
  C: { label: 'Categoria C (ANVISA)', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', description: 'Risco não descartado. Usar se benefício justificar', safe: false },
  D: { label: 'Categoria D (ANVISA)', color: 'bg-orange-100 text-orange-700 border-orange-200', description: 'Evidência de risco. Usar apenas se benefício superar', safe: false },
  X: { label: 'Categoria X (ANVISA)', color: 'bg-red-100 text-red-700 border-red-200', description: 'Contraindicado. Riscos superam benefícios', safe: false }
};

// FDA: Referência científica internacional (não regulatória no Brasil)
const fdaCategories = {
  A: { label: 'FDA A', color: 'bg-green-100 text-green-700 border-green-200', description: 'Referência científica - sem risco demonstrado', safe: true },
  B: { label: 'FDA B', color: 'bg-blue-100 text-blue-700 border-blue-200', description: 'Referência científica - estudos animais sem risco', safe: true },
  C: { label: 'FDA C', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', description: 'Referência científica - risco não descartado', safe: false },
  D: { label: 'FDA D', color: 'bg-orange-100 text-orange-700 border-orange-200', description: 'Referência científica - evidência de risco', safe: false },
  X: { label: 'FDA X', color: 'bg-red-100 text-red-700 border-red-200', description: 'Referência científica - contraindicado', safe: false }
};

// Categorias de Lactação (Hale)
const lactationCategories = {
  L1: { label: 'L1 - Mais Seguro', color: 'bg-green-100 text-green-700', description: 'Estudos em mulheres não demonstraram risco' },
  L2: { label: 'L2 - Seguro', color: 'bg-emerald-100 text-emerald-700', description: 'Estudos limitados não demonstram aumento de efeitos adversos' },
  L3: { label: 'L3 - Moderadamente Seguro', color: 'bg-yellow-100 text-yellow-700', description: 'Sem estudos controlados, possíveis efeitos' },
  L4: { label: 'L4 - Possivelmente Perigoso', color: 'bg-orange-100 text-orange-700', description: 'Evidência de risco para lactente' },
  L5: { label: 'L5 - Contraindicado', color: 'bg-red-100 text-red-700', description: 'Risco significativo documentado' }
};

// Banco de medicações categorizadas (ANVISA + FDA referência)
const medicationsDatabase = [
  // Analgésicos
  { name: 'Paracetamol', anvisa: 'B', fda: 'B', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'Analgésico de escolha na gestação (ANVISA: seguro)', teratogenic: false },
  { name: 'Dipirona', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: false, t2: true, t3: false }, notes: 'ANVISA Cat.C - Evitar 1º e 3º trimestres', teratogenic: false },
  { name: 'Ibuprofeno', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: true, t3: false }, notes: 'ANVISA Cat.D - Contraindicado após 30 sem (fechamento ducto)', teratogenic: false },
  { name: 'AAS', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.D - Baixa dose (100mg) para pré-eclâmpsia', teratogenic: false },
  
  // Antibióticos
  { name: 'Amoxicilina', anvisa: 'B', fda: 'B', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Seguro em toda gestação', teratogenic: false },
  { name: 'Cefalexina', anvisa: 'B', fda: 'B', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Seguro em toda gestação', teratogenic: false },
  { name: 'Azitromicina', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Alternativa para alérgicos à penicilina', teratogenic: false },
  { name: 'Metronidazol', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: false, t2: true, t3: true }, notes: 'ANVISA Cat.B - Evitar 1º trimestre', teratogenic: false },
  { name: 'Ciprofloxacino', anvisa: 'C', fda: 'C', lactation: 'L3', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.C - Evitar (artropatia fetal)', teratogenic: true },
  { name: 'Tetraciclina', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.D - CONTRAINDICADO (manchas dentárias)', teratogenic: true },
  { name: 'Sulfametoxazol+Trimetoprim', anvisa: 'D', fda: 'D', lactation: 'L3', trimester: { t1: false, t2: true, t3: false }, notes: 'ANVISA Cat.D - Evitar 1º tri (antifolato) e próximo parto', teratogenic: true },
  
  // Antieméticos
  { name: 'Ondansetrona', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Cautela (risco fenda palatina)', teratogenic: false },
  { name: 'Metoclopramida', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Primeira escolha', teratogenic: false },
  { name: 'Dimenidrinato', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Seguro em toda gestação', teratogenic: false },
  
  // Anti-hipertensivos
  { name: 'Metildopa', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Anti-hipertensivo de escolha', teratogenic: false },
  { name: 'Nifedipino', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: false, t2: true, t3: true }, notes: 'ANVISA Cat.C - Segunda linha (evitar sublingual)', teratogenic: false },
  { name: 'Hidralazina', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - Emergências hipertensivas', teratogenic: false },
  { name: 'Captopril', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.D - CONTRAINDICADO (oligoâmnio, displasia renal)', teratogenic: true },
  { name: 'Enalapril', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.D - CONTRAINDICADO (fetopatia IECA)', teratogenic: true },
  { name: 'Losartana', anvisa: 'D', fda: 'D', lactation: 'L3', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.D - CONTRAINDICADO (fetopatia BRA)', teratogenic: true },
  
  // Anticonvulsivantes
  { name: 'Ácido Valproico', anvisa: 'X', fda: 'X', lactation: 'L2', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.X - CONTRAINDICADO (defeitos tubo neural)', teratogenic: true },
  { name: 'Carbamazepina', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: true, t3: true }, notes: 'ANVISA Cat.D - Evitar (defeitos tubo neural, ác. fólico 5mg)', teratogenic: true },
  { name: 'Fenitoína', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: true, t3: true }, notes: 'ANVISA Cat.D - Síndrome fetal da fenitoína', teratogenic: true },
  { name: 'Lamotrigina', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - Mais seguro entre anticonvulsivantes', teratogenic: false },
  { name: 'Levetiracetam', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - Opção segura', teratogenic: false },
  
  // Psiquiátricos
  { name: 'Sertralina', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - ISRS de escolha', teratogenic: false },
  { name: 'Fluoxetina', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: false }, notes: 'ANVISA Cat.C - Evitar 3º tri (má adaptação neonatal)', teratogenic: false },
  { name: 'Paroxetina', anvisa: 'D', fda: 'D', lactation: 'L2', trimester: { t1: false, t2: true, t3: false }, notes: 'ANVISA Cat.D - Evitar 1º tri (malformações cardíacas)', teratogenic: true },
  { name: 'Haloperidol', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - Antipsicótico de escolha', teratogenic: false },
  
  // Anticoagulantes
  { name: 'Heparina', anvisa: 'C', fda: 'C', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - Não atravessa placenta (segura)', teratogenic: false },
  { name: 'Enoxaparina', anvisa: 'B', fda: 'B', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Não atravessa placenta (segura)', teratogenic: false },
  { name: 'Varfarina', anvisa: 'X', fda: 'X', lactation: 'L2', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.X - CONTRAINDICADO (embriopatia varfarínica)', teratogenic: true },
  
  // Outros
  { name: 'Ácido Fólico', anvisa: 'A', fda: 'A', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.A - Essencial (previne defeitos tubo neural)', teratogenic: false },
  { name: 'Sulfato Ferroso', anvisa: 'A', fda: 'A', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.A - Suplementação recomendada', teratogenic: false },
  { name: 'Omeprazol', anvisa: 'C', fda: 'C', lactation: 'L2', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.C - Usar se benefício superar risco', teratogenic: false },
  { name: 'Metformina', anvisa: 'B', fda: 'B', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Seguro para DMG', teratogenic: false },
  { name: 'Insulina', anvisa: 'B', fda: 'B', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.B - Escolha para DM gestacional', teratogenic: false },
  { name: 'Levotiroxina', anvisa: 'A', fda: 'A', lactation: 'L1', trimester: { t1: true, t2: true, t3: true }, notes: 'ANVISA Cat.A - Essencial se hipotireoidismo', teratogenic: false },
  { name: 'Misoprostol', anvisa: 'X', fda: 'X', lactation: 'L3', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.X - CONTRAINDICADO (abortivo, Síndrome Moebius)', teratogenic: true },
  { name: 'Isotretinoína', anvisa: 'X', fda: 'X', lactation: 'L5', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.X - CONTRAINDICADO (altamente teratogênico)', teratogenic: true },
  { name: 'Metotrexato', anvisa: 'X', fda: 'X', lactation: 'L5', trimester: { t1: false, t2: false, t3: false }, notes: 'ANVISA Cat.X - CONTRAINDICADO (abortivo)', teratogenic: true }
];

// Protocolos SBOG/FEBRASGO
const protocols = [
  { title: 'Pré-Natal de Baixo Risco', items: ['Ácido fólico 400mcg até 12 sem', 'Sulfato ferroso 40mg após 20 sem', 'Sorologias 1º e 3º trimestre', 'USG morfológico 20-24 sem', 'TOTG 24-28 sem'] },
  { title: 'DMG - Rastreamento', items: ['Glicemia jejum na 1ª consulta', 'TOTG 75g entre 24-28 semanas', 'Critérios: jejum ≥92, 1h ≥180, 2h ≥153', 'Se GJ ≥126: DM prévio'] },
  { title: 'Pré-Eclâmpsia - Prevenção', items: ['AAS 100-150mg após 12 sem se alto risco', 'Cálcio 1-2g/dia se baixa ingesta', 'Manter PA <140/90', 'Proteinúria ≥300mg/24h ou relação P/C ≥0.3'] },
  { title: 'ITU na Gestação', items: ['Bacteriúria assintomática: tratar sempre', '1ª escolha: Nitrofurantoína 100mg 6/6h 7d', 'Alternativa: Cefalexina 500mg 6/6h 7d', 'Evitar: Fluoroquinolonas, SMZ-TMP no 1º e 3º tri'] }
];

export default function Ginecologia() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('medicacoes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFDA, setFilterFDA] = useState('all');
  const [filterSafe, setFilterSafe] = useState('all');
  const [selectedMed, setSelectedMed] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedPartoSection, setExpandedPartoSection] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { contentManager } = await import('../components/content/ContentManager');
      
      const slug = `gineco-med-${searchTerm.toLowerCase().replace(/\s+/g, '-')}`;
      const content = await contentManager.get(slug, {
        modulo: 'ginecologia',
        tipo: 'guideline'
      });

      contentManager.trackAccess(slug);
      setSearchResult(content.conteudo);
    } catch (error) {
      console.error('Erro ao buscar medicamento gineco:', error);
      
      const response = await base44.integrations.Core.InvokeLLM({
      prompt: `
        Forneça informações EDUCACIONAIS sobre "${searchTerm}" na GRAVIDEZ e LACTAÇÃO.
        
        CRÍTICO - MODELO 2:
        - NÃO prescreva ou autorize uso de medicamentos
        - Use: "descrito na literatura como", "classificação de referência científica", "informações educacionais"
        - Evite: "deve usar", "pode tomar", "recomenda-se prescrever"
        - Apenas explique conceitos, classificações e informações de referência
        
        CRÍTICO - PRIORIZE ANVISA:
        - ANVISA (Agência Nacional de Vigilância Sanitária) é o órgão regulatório oficial do Brasil
        - Forneça PRIMEIRO a classificação ANVISA (Cat. A, B, C, D ou X)
        - FDA é referência científica complementar (mencionar após ANVISA)
        - Cite sempre a bula registrada na ANVISA
        
        Base suas informações em: ANVISA (prioritário), FEBRASGO, Williams Obstetrics, Briggs Drugs in Pregnancy and Lactation.
        
        Forneça informações educacionais sobre:
        1. Categoria ANVISA (A, B, C, D ou X) - CLASSIFICAÇÃO REGULATÓRIA BRASILEIRA (prioritário)
        2. Categoria FDA antiga (A, B, C, D ou X) - referência científica complementar
        3. Categoria de Lactação de Hale (L1 a L5) - referência
        4. Informações de segurança por trimestre da literatura
        5. Riscos descritos e conceitos de teratogenicidade
        6. Alternativas descritas na literatura
        7. Conceitos gerais de uso (educacional, não prescrição)
        8. Referências de protocolos FEBRASGO/SBOG
        9. Lembrete: Bula ANVISA é documento oficial para prescrição no Brasil
      `,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          medication_name: { type: 'string' },
          anvisa_category: { type: 'string' },
          fda_category: { type: 'string' },
          lactation_category: { type: 'string' },
          first_trimester: { type: 'object', properties: { safe: { type: 'boolean' }, notes: { type: 'string' } } },
          second_trimester: { type: 'object', properties: { safe: { type: 'boolean' }, notes: { type: 'string' } } },
          third_trimester: { type: 'object', properties: { safe: { type: 'boolean' }, notes: { type: 'string' } } },
          teratogenic_risks: { type: 'array', items: { type: 'string' } },
          breastfeeding_notes: { type: 'string' },
          safe_alternatives: { type: 'array', items: { type: 'string' } },
          contraindications: { type: 'array', items: { type: 'string' } },
          clinical_recommendations: { type: 'string' },
          references: { type: 'array', items: { type: 'string' } }
        }
      }
      });

      setSearchResult(response);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredMedications = medicationsDatabase.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesANVISA = filterFDA === 'all' || med.anvisa === filterFDA;
    const matchesSafe = filterSafe === 'all' || 
                        (filterSafe === 'safe' && !med.teratogenic) ||
                        (filterSafe === 'unsafe' && med.teratogenic);
    return matchesSearch && matchesANVISA && matchesSafe;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-fuchsia-500" />
              GO
            </h1>
            <p className="text-slate-500 mt-1">Referências científicas para segurança na gestação e lactação • Regulação: ANVISA (BR)</p>
          </div>

          {/* ANVISA Categories (Prioridade) + FDA Referência */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Categorias ANVISA - Órgão Regulatório Brasileiro
                  </CardTitle>
                  <p className="text-[10px] text-slate-500 mt-1">
                    🇧🇷 ANVISA (Agência Nacional de Vigilância Sanitária) - RDC 344/1998 e legislação vigente
                  </p>
                </div>
                <Badge className="bg-blue-600 text-white text-[9px]">
                  REGULAÇÃO OFICIAL BR
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-3 mb-3">
                {Object.entries(anvisaCategories).map(([key, cat]) => (
                  <div key={key} className={`p-3 rounded-lg border ${cat.color}`}>
                    <p className="font-bold text-lg">{key}</p>
                    <p className="text-xs mt-1 opacity-80">{cat.description}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-blue-600 text-white rounded-lg">
                <p className="text-[10px] leading-relaxed">
                  <strong>✓ ANVISA é o órgão regulatório oficial do Brasil.</strong> Consulte sempre a <strong>bula registrada na ANVISA</strong> e protocolos brasileiros (FEBRASGO, SBOG) para prescrição. 
                  FDA é referência científica internacional complementar.
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="medicacoes">Banco de Medicações</TabsTrigger>
              <TabsTrigger value="lactacao">Lactação</TabsTrigger>
              <TabsTrigger value="parto">Parto</TabsTrigger>
              <TabsTrigger value="protocolos">Diretrizes do Ministério da Saúde</TabsTrigger>
            </TabsList>

            <TabsContent value="medicacoes">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar medicamento..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="h-10 px-3 rounded-md border border-slate-200 text-sm"
                        value={filterFDA}
                        onChange={(e) => setFilterFDA(e.target.value)}
                      >
                        <option value="all">Todas Categorias ANVISA</option>
                        {Object.keys(anvisaCategories).map(cat => (
                          <option key={cat} value={cat}>ANVISA {cat}</option>
                        ))}
                      </select>
                      <select
                        className="h-10 px-3 rounded-md border border-slate-200 text-sm"
                        value={filterSafe}
                        onChange={(e) => setFilterSafe(e.target.value)}
                      >
                        <option value="all">Todos</option>
                        <option value="safe">Seguros</option>
                        <option value="unsafe">Teratogênicos</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                       <tr className="border-b border-slate-200">
                         <th className="text-left py-3 px-4 font-medium text-slate-600">Medicamento</th>
                         <th className="text-center py-3 px-4 font-medium text-blue-700">ANVISA 🇧🇷</th>
                         <th className="text-center py-3 px-4 font-medium text-slate-500">FDA*</th>
                         <th className="text-center py-3 px-4 font-medium text-slate-600">Lactação</th>
                         <th className="text-center py-3 px-4 font-medium text-slate-600">1º Tri</th>
                         <th className="text-center py-3 px-4 font-medium text-slate-600">2º Tri</th>
                         <th className="text-center py-3 px-4 font-medium text-slate-600">3º Tri</th>
                         <th className="text-left py-3 px-4 font-medium text-slate-600">Observações (ANVISA)</th>
                       </tr>
                      </thead>
                      <tbody>
                        {filteredMedications.map((med, i) => (
                          <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 ${med.teratogenic ? 'bg-red-50/50' : ''}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800">{med.name}</span>
                                {med.teratogenic && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge className={anvisaCategories[med.anvisa]?.color}>{med.anvisa}</Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant="outline" className="text-slate-500 border-slate-300 text-xs">{med.fda}</Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge className={lactationCategories[med.lactation]?.color}>{med.lactation}</Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              {med.trimester.t1 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4">
                              {med.trimester.t2 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4">
                              {med.trimester.t3 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">{med.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">
                    Total: {filteredMedications.length} medicamentos • Teratogênicos: {filteredMedications.filter(m => m.teratogenic).length}
                  </p>
                  <p className="text-[9px] text-blue-700 mt-2 text-center font-medium">
                    🇧🇷 ANVISA: Classificação regulatória brasileira (prioridade) | *FDA: Referência científica complementar
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lactacao">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Milk className="w-4 h-4 text-blue-500" />
                    Categorias de Lactação (Hale)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-3 mb-6">
                    {Object.entries(lactationCategories).map(([key, cat]) => (
                      <div key={key} className={`p-3 rounded-lg border ${cat.color}`}>
                        <p className="font-bold">{key}</p>
                        <p className="text-xs mt-1">{cat.description}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-medium text-slate-800 mb-3">Medicamentos Seguros na Lactação (L1-L2)</h4>
                  <div className="flex flex-wrap gap-2">
                    {medicationsDatabase.filter(m => m.lactation === 'L1' || m.lactation === 'L2').map((med, i) => (
                      <Badge key={i} variant="outline" className="text-green-700 border-green-200">
                        {med.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parto">
              <div className="space-y-4">
                {/* Disclaimer Principal */}
                <Card className="backdrop-blur-xl bg-amber-50 border-amber-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Guia de Emergência Obstétrica</p>
                        <p className="text-xs leading-relaxed">
                          Conteúdo educacional baseado em diretrizes oficiais (Ministério da Saúde, FEBRASGO, OMS). 
                          Não substitui julgamento clínico individual, protocolos institucionais ou avaliação obstétrica especializada.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 1. Avaliação Inicial */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 1 ? null : 1)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-fuchsia-500" />
                        1. Avaliação Inicial na Emergência
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 1 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 1 && (
                    <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Identificação do Trabalho de Parto</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Contrações regulares:</strong> ≥2 em 10 minutos, duração ≥40s</li>
                        <li>• <strong>Dilatação cervical:</strong> Avaliação por toque vaginal (fase ativa ≥4cm)</li>
                        <li>• <strong>Ruptura de membranas:</strong> Espontânea ou artificial</li>
                        <li>• <strong>Apagamento cervical:</strong> Progressivo (≥50% em primíparas)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Idade Gestacional</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Pré-termo:</strong> &lt;37 semanas (considerar tocólise se indicado)</li>
                        <li>• <strong>Termo:</strong> 37-42 semanas (parto seguro)</li>
                        <li>• <strong>Pós-termo:</strong> ≥42 semanas (risco aumentado)</li>
                        <li>• <strong>Confirmar IG:</strong> DUM, USG 1º trimestre, altura uterina</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Avaliação Materna</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Sinais vitais:</strong> PA, FC, Tax, FR, SpO2</li>
                        <li>• <strong>Estado geral:</strong> Consciência, hidratação, palidez</li>
                        <li>• <strong>Sangramento vaginal:</strong> Volume, características</li>
                        <li>• <strong>Dinâmica uterina:</strong> Frequência, intensidade, duração</li>
                        <li>• <strong>Altura uterina:</strong> Compatível com IG</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Avaliação Fetal</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>BCF:</strong> Ausculta (normal: 110-160 bpm)</li>
                        <li>• <strong>Apresentação:</strong> Cefálica, pélvica, transversa</li>
                        <li>• <strong>Movimentação fetal:</strong> Presente/reduzida</li>
                        <li>• <strong>Líquido amniótico:</strong> Claro, meconial, sanguinolento</li>
                        <li>• <strong>Cardiotocografia:</strong> Se disponível (categoria I, II, III)</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Situações de Risco Imediato
                      </h4>
                      <ul className="space-y-1 text-sm text-red-800">
                        <li>• Sangramento ativo intenso (suspeita DPP, placenta prévia)</li>
                        <li>• Prolapso de cordão umbilical</li>
                        <li>• Bradicardia fetal sustentada (&lt;110 bpm)</li>
                        <li>• Hipertensão grave (PA ≥160/110 mmHg) + sintomas</li>
                        <li>• Apresentação anômala em trabalho de parto avançado</li>
                        <li>• Parada da progressão do parto</li>
                      </ul>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* 2. Tipos de Parto */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 2 ? null : 2)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Baby className="w-5 h-5 text-fuchsia-500" />
                        2. Tipos de Parto
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 2 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 2 && (
                    <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Parto Vaginal Eutócico</h4>
                      <p className="text-sm text-slate-600">
                        Parto espontâneo, evolução fisiológica, sem complicações maternas ou fetais. 
                        Apresentação cefálica fletida, progressão adequada, vitalidade fetal preservada.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Parto Vaginal Distócico</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Parto que necessita intervenção adicional (fórcipe, vácuo-extrator) ou apresenta complicações mecânicas.
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Indicações:</strong> Parada da progressão, sofrimento fetal, exaustão materna</li>
                        <li>• <strong>Pré-requisitos:</strong> Dilatação completa, cabeça encaixada, membranas rotas</li>
                        <li>• <strong>Atenção:</strong> Avaliar necessidade de cesariana de emergência</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Parto Pélvico (Emergência)</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Apresentação pélvica com trabalho de parto avançado, impossibilidade de cesariana imediata.
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Manobra de Bracht:</strong> Sustentação e rotação do feto</li>
                        <li>• <strong>Manobra de Mauriceau:</strong> Extração da cabeça derradeira</li>
                        <li>• <strong>Riscos:</strong> Trauma obstétrico, asfixia neonatal</li>
                        <li>• <strong>Equipe completa:</strong> Obstetrícia + Pediatria</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Parto Precipitado</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Parto extremamente rápido (&lt;3 horas desde início do trabalho de parto).
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• Preparar rapidamente: luvas, campo estéril, clamps, tesoura</li>
                        <li>• Proteger períneo durante expulsão</li>
                        <li>• Atenção ao RN: risco de trauma craniano, aspiração</li>
                        <li>• Observar hemorragia pós-parto (atonia uterina)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Parto em Apresentação Anômala</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Transversa:</strong> Cesariana imediata (impossível parto vaginal)</li>
                        <li>• <strong>Face/fronte:</strong> Avaliar via de parto (geralmente cesariana)</li>
                        <li>• <strong>Occipito-posterior persistente:</strong> Rotação manual ou fórcipe</li>
                      </ul>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* 3. Condutas no Parto Vaginal */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 3 ? null : 3)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Clipboard className="w-5 h-5 text-fuchsia-500" />
                        3. Condutas no Parto Vaginal
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 3 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 3 && (
                    <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Conduta Passo a Passo</h4>
                      <ol className="space-y-2 text-sm text-slate-600">
                        <li><strong>1.</strong> Paramentação: luvas estéreis, avental, máscara</li>
                        <li><strong>2.</strong> Campo estéril sob nádegas da parturiente</li>
                        <li><strong>3.</strong> Antissepsia perineal com PVPI ou clorexidina</li>
                        <li><strong>4.</strong> Aguardar coroamento (cabeça visível no anel vulvar)</li>
                        <li><strong>5.</strong> Proteger períneo durante desprendimento</li>
                        <li><strong>6.</strong> Deflexão da cabeça: mão sobre occipital, direção púbis</li>
                        <li><strong>7.</strong> Verificar circular de cordão (desfazer se presente e frouxo)</li>
                        <li><strong>8.</strong> Rotação externa espontânea (alinhamento dos ombros)</li>
                        <li><strong>9.</strong> Tração suave para desprendimento do ombro anterior</li>
                        <li><strong>10.</strong> Elevação para desprendimento do ombro posterior</li>
                        <li><strong>11.</strong> Expulsão do tronco e membros inferiores</li>
                        <li><strong>12.</strong> Clampeamento do cordão (após 1-3 minutos se RN vigoroso)</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Posições para o Parto</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Litotomia (ginecológica):</strong> Tradicional, facilita manobras</li>
                        <li>• <strong>Lateral (Sims):</strong> Reduz lacerações perineais</li>
                        <li>• <strong>Semi-sentada:</strong> Conforto materno, gravidade favorável</li>
                        <li>• <strong>Verticalizada:</strong> Quatro apoios, cócoras (respeitar escolha materna)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Proteção do Períneo</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• Manobra de Ritgen modificada: apoiar períneo com compressa</li>
                        <li>• Controlar velocidade de desprendimento da cabeça</li>
                        <li>• Episiotomia seletiva (não rotineira): apenas se necessário</li>
                        <li>• Tipos: médio-lateral (preferível) ou mediana (maior risco 3º/4º grau)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Assistência ao Período Expulsivo</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• Encorajar puxos efetivos durante contrações</li>
                        <li>• Monitorar BCF continuamente (ideal: cada 5 min)</li>
                        <li>• Avaliar progressão da descida</li>
                        <li>• Limites: período expulsivo primípara ~2h, multípara ~1h</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Assistência à Dequitação (3º Período)</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Manejo ativo (recomendado):</strong> Ocitocina 10 UI IM imediato</li>
                        <li>• Aguardar sinais de descolamento (sangramento, descida cordão, útero globoso)</li>
                        <li>• Tração controlada do cordão (manobra de Brandt-Andrews)</li>
                        <li>• Revisão da placenta: integridade, completude</li>
                        <li>• <strong>Atenção:</strong> Dequitação normal até 30 min (retenção placentária após esse período)</li>
                      </ul>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* 4. Emergências */}
                <Card className="backdrop-blur-xl bg-red-50/80 border-red-200 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 4 ? null : 4)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        4. Emergências Relacionadas ao Parto
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 4 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 4 && (
                    <CardContent className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm text-red-700 mb-2">Distócia de Ombro</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Definição:</strong> Impactação do ombro anterior atrás da sínfise púbica após desprendimento da cabeça.
                      </p>
                      <p className="text-sm text-red-700 mb-2"><strong>⏱️ EMERGÊNCIA - Agir rapidamente (&lt;5 min)</strong></p>
                      <ol className="space-y-1 text-sm text-slate-600">
                        <li><strong>1. CHAMAR AJUDA</strong> (código distócia de ombro)</li>
                        <li><strong>2. McRoberts:</strong> Hiperflexão das coxas maternas sobre abdome</li>
                        <li><strong>3. Pressão suprapúbica:</strong> Assistente pressiona acima sínfise (não fúndica!)</li>
                        <li><strong>4. Tração axial:</strong> Suave, direção sacro materno</li>
                        <li><strong>5. Rubin II:</strong> Rotação do ombro posterior (interno)</li>
                        <li><strong>6. Wood (saca-rolhas):</strong> Rotação 180° do ombro posterior</li>
                        <li><strong>7. Jacquemier:</strong> Extração braço posterior</li>
                        <li><strong>8. Manobras avançadas:</strong> Zavanelli (reposição cabeça), cesariana</li>
                      </ol>
                      <p className="text-xs text-red-600 mt-2">Não tracionar excessivamente - risco de lesão plexo braquial</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm text-red-700 mb-2">Prolapso de Cordão</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Definição:</strong> Cordão umbilical desce antes ou junto com a apresentação.
                      </p>
                      <p className="text-sm text-red-700 mb-2"><strong>⚠️ EMERGÊNCIA ABSOLUTA - Cesariana imediata</strong></p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Posição:</strong> Trendelenburg ou joelhos-tórax (elevar pelve)</li>
                        <li>• <strong>Rechaço manual:</strong> Elevar apresentação fetal com dedos intravaginais</li>
                        <li>• <strong>Não reposicionar cordão</strong></li>
                        <li>• <strong>Oxigênio materno:</strong> 15 L/min máscara não-reinalante</li>
                        <li>• <strong>Monitorar BCF:</strong> Continuamente</li>
                        <li>• <strong>Transporte urgente</strong> ao centro cirúrgico mantendo rechaço</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm text-red-700 mb-2">Hemorragia Pós-Parto (HPP)</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Definição:</strong> Perda sanguínea &gt;500 mL (parto vaginal) ou &gt;1000 mL (cesariana).
                      </p>
                      <p className="text-sm text-red-700 mb-2"><strong>Causas - "4 Ts":</strong></p>
                      <ul className="space-y-1 text-sm text-slate-600 mb-2">
                        <li>• <strong>Tônus:</strong> Atonia uterina (70% dos casos)</li>
                        <li>• <strong>Trauma:</strong> Lacerações, ruptura uterina</li>
                        <li>• <strong>Tecido:</strong> Retenção placentária, acretismo</li>
                        <li>• <strong>Trombina:</strong> Coagulopatia</li>
                      </ul>
                      <p className="text-sm text-slate-700 mb-2"><strong>Conduta Imediata:</strong></p>
                      <ol className="space-y-1 text-sm text-slate-600">
                        <li><strong>1.</strong> Massagem uterina bimanual (externamente + mão intravaginal)</li>
                        <li><strong>2.</strong> Ocitocina 20-40 UI em 1000 mL SF 0,9% (200 mL/h)</li>
                        <li><strong>3.</strong> Misoprostol 800-1000 mcg via retal (ou sublingual 600 mcg)</li>
                        <li><strong>4.</strong> Metilergonovina 0,2 mg IM (CI: hipertensão)</li>
                        <li><strong>5.</strong> Ácido tranexâmico 1g EV em 10 min</li>
                        <li><strong>6.</strong> Revisão de canal de parto (lacerações)</li>
                        <li><strong>7.</strong> Ressuscitação: 2 acessos calibrosos, cristaloides, hemoderivados</li>
                        <li><strong>8.</strong> Tamponamento uterino com balão (Bakri, sonda Foley)</li>
                        <li><strong>9.</strong> Avaliar necessidade de cirurgia (ligadura artérias, histerectomia)</li>
                      </ol>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm text-red-700 mb-2">Sofrimento Fetal Agudo</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Sinais:</strong> Bradicardia (&lt;110 bpm), desacelerações tardias, líquido meconial espesso.
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Posicionar:</strong> Decúbito lateral esquerdo (melhorar fluxo uteroplacentário)</li>
                        <li>• <strong>Oxigênio:</strong> 15 L/min máscara não-reinalante</li>
                        <li>• <strong>Hidratação:</strong> Cristaloide 500 mL rápido</li>
                        <li>• <strong>Suspender ocitocina</strong> se em uso</li>
                        <li>• <strong>Avaliar:</strong> Taquissistolia, hipotensão materna, prolapso cordão</li>
                        <li>• <strong>Conduta:</strong> Apressar parto (fórcipe/vácuo se viável) ou cesariana</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm text-red-700 mb-2">Parada Cardiorrespiratória Materna no Parto</h4>
                      <p className="text-sm text-red-700 mb-2"><strong>⚠️ RCP modificado + Cesariana perimortem</strong></p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Desvio uterino:</strong> Deslocar útero lateralmente (esquerda)</li>
                        <li>• <strong>RCP padrão:</strong> 30:2, compressões mais cefálicas</li>
                        <li>• <strong>Cesariana perimortem:</strong> Indicada se IG ≥20 sem em 4 min sem ROSC</li>
                        <li>• <strong>Objetivo:</strong> Melhorar ressuscitação materna e salvar feto</li>
                        <li>• <strong>Causas:</strong> Embolia amniótica, eclâmpsia, hemorragia maciça</li>
                      </ul>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* 5. Cuidados Imediatos */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 5 ? null : 5)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-fuchsia-500" />
                        5. Cuidados Imediatos Pós-Parto
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 5 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 5 && (
                    <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Avaliação Materna</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Sinais vitais:</strong> A cada 15 min na 1ª hora</li>
                        <li>• <strong>Sangramento:</strong> Quantificar perda (absorvente, compressas)</li>
                        <li>• <strong>Involução uterina:</strong> Palpar útero (altura, consistência)</li>
                        <li>• <strong>Períneo:</strong> Avaliar lacerações, episiorrafia se indicada</li>
                        <li>• <strong>Bexiga:</strong> Esvaziamento (risco retenção urinária)</li>
                        <li>• <strong>Dor:</strong> Avaliar e tratar adequadamente</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Avaliação do Recém-Nascido</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Boletim de Apgar:</strong> 1º e 5º minuto (repetir se &lt;7)</li>
                        <li>• <strong>Aspiração:</strong> Apenas se via aérea obstruída (não rotineira)</li>
                        <li>• <strong>Aquecimento:</strong> Secar + contato pele a pele</li>
                        <li>• <strong>Clampeamento tardio:</strong> 1-3 min se RN vigoroso</li>
                        <li>• <strong>Peso, medidas:</strong> Comprimento, PC, PT</li>
                        <li>• <strong>Aleitamento materno:</strong> Iniciar na 1ª hora (Golden Hour)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Profilaxias Obrigatórias (RN)</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• <strong>Vitamina K:</strong> 1 mg IM (profilaxia doença hemorrágica)</li>
                        <li>• <strong>Nitrato de prata 1%:</strong> Colírio (profilaxia oftalmia gonocócica)</li>
                        <li>• <strong>Vacina Hepatite B:</strong> Nas primeiras 12-24h</li>
                        <li>• <strong>BCG:</strong> Se peso ≥2000g</li>
                        <li>• <strong>Teste do pezinho:</strong> 3-5 dias (triagem neonatal)</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-sm text-amber-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Sinais de Alerta Pós-Parto
                      </h4>
                      <p className="text-sm text-slate-700 mb-2"><strong>Maternos:</strong></p>
                      <ul className="space-y-1 text-sm text-slate-600 mb-2">
                        <li>• Sangramento excessivo (absorver &gt;1 absorvente/hora)</li>
                        <li>• Hipotensão, taquicardia (choque hipovolêmico)</li>
                        <li>• Dor intensa, desproporción</li>
                        <li>• Febre (suspeita infecção puerperal)</li>
                      </ul>
                      <p className="text-sm text-slate-700 mb-2"><strong>Neonatais:</strong></p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• Apgar &lt;7 no 5º minuto</li>
                        <li>• Desconforto respiratório (tiragem, gemência)</li>
                        <li>• Cianose central persistente</li>
                        <li>• Hipotermia (&lt;36°C) ou hipertermia</li>
                      </ul>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* 6. Apoio Especializado */}
                <Card className="backdrop-blur-xl bg-blue-50/80 border-blue-200 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 6 ? null : 6)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-blue-700 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        6. Quando Chamar Apoio Especializado
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 6 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 6 && (
                    <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-blue-700 mb-2">Indicações de Transferência</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• Apresentação não cefálica em trabalho de parto ativo</li>
                        <li>• Sofrimento fetal persistente sem progressão iminente</li>
                        <li>• Prolapso de cordão (transferir em emergência)</li>
                        <li>• Hemorragia grave não controlada</li>
                        <li>• Eclâmpsia / crise hipertensiva</li>
                        <li>• Parada da progressão do trabalho de parto</li>
                        <li>• Prematuridade extrema (&lt;34 semanas)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-blue-700 mb-2">Situações de Alto Risco</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>• Gemelaridade</li>
                        <li>• Crescimento intrauterino restrito</li>
                        <li>• Oligoâmnio / polidrâmnio severo</li>
                        <li>• Placenta prévia / acretismo placentário</li>
                        <li>• Cicatriz uterina prévia (cesárea anterior)</li>
                        <li>• Cardiopatia / pneumopatia materna grave</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                      <h4 className="font-semibold text-sm text-blue-700 mb-2">Limites da Atenção Básica / UPA</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>UBS/UPA pode assistir:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600 mb-2">
                        <li>• Parto eutócico de baixo risco</li>
                        <li>• Gestação a termo, cefálica, feto único</li>
                        <li>• Ausência de comorbidades maternas graves</li>
                      </ul>
                      <p className="text-sm text-slate-600">
                        <strong>Necessita referência para hospital:</strong> Todos os demais casos, especialmente urgências/emergências descritas acima.
                      </p>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* Diretrizes e Fontes */}
                <Card className="backdrop-blur-xl bg-slate-50/80 border-slate-200 shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedPartoSection(expandedPartoSection === 7 ? null : 7)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        Diretrizes e Fontes
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        {expandedPartoSection === 7 ? '−' : '+'}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedPartoSection === 7 && (
                    <CardContent>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li>• <strong>Ministério da Saúde (Brasil):</strong> Manual Técnico de Gestação de Alto Risco, Diretrizes Nacionais de Assistência ao Parto Normal (2017)</li>
                      <li>• <strong>FEBRASGO:</strong> Assistência ao Parto e Tocurgia (2018), Manejo de Hemorragia Pós-Parto</li>
                      <li>• <strong>OMS:</strong> WHO recommendations: Intrapartum care for a positive childbirth experience (2018)</li>
                      <li>• <strong>ACOG:</strong> Shoulder Dystocia (Practice Bulletin), Postpartum Hemorrhage (2017)</li>
                      <li>• <strong>ALSO (Advanced Life Support in Obstetrics):</strong> Manuais de Emergências Obstétricas</li>
                    </ul>
                    </CardContent>
                  )}
                </Card>

                <DisclaimerFooter variant="protocolo" />
              </div>
            </TabsContent>

            <TabsContent value="protocolos">
              <div className="grid md:grid-cols-2 gap-6">
                {protocols.map((protocol, i) => (
                  <Card key={i} className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-fuchsia-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {protocol.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {protocol.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-fuchsia-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DisclaimerFooter variant="medicamento" />
        </div>
      </main>
    </div>
  );
}