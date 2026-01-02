import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Skull,
  AlertTriangle,
  Phone,
  Info,
  Pill,
  Bug,
  Leaf,
  Droplets,
  Loader2,
  Shield,
  Activity,
  Syringe,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  MapPin,
  Copy,
  PhoneCall
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import ContentVersionBadge from '../components/content/ContentVersionBadge';
import OfflineIndicator from '../components/content/OfflineIndicator';
import { normalizeCeatoxData } from '../components/ceatox/CeatoxValidator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from 'sonner';

const toxicCategories = [
  { id: 'medicamentos', label: 'Medicamentos', icon: Pill, color: 'from-blue-500 to-blue-600' },
  { id: 'animais', label: 'Animais Peçonhentos', icon: Bug, color: 'from-red-500 to-rose-600' },
  { id: 'plantas', label: 'Plantas Tóxicas', icon: Leaf, color: 'from-green-500 to-emerald-600' },
  { id: 'quimicos', label: 'Produtos Químicos', icon: Droplets, color: 'from-purple-500 to-violet-600' },
  { id: 'drogas', label: 'Drogas Alucinógenas', icon: Syringe, color: 'from-orange-500 to-amber-600' },
  { id: 'sindromes', label: 'Síndromes Toxicológicas', icon: Activity, color: 'from-pink-500 to-rose-600' }
];

const ceatoxBrasil = [
  {
    regiao: 'Norte',
    centros: [
      { nome: 'CEATOX Amazonas', cidade: 'Manaus', estado: 'AM', telefone: '0800-280-8280' },
      { nome: 'CEATOX Pará', cidade: 'Belém', estado: 'PA', telefone: '(91) 3241-4849' },
      { nome: 'CEATOX Rondônia', cidade: 'Porto Velho', estado: 'RO', telefone: '(69) 3216-5353' }
    ]
  },
  {
    regiao: 'Nordeste',
    centros: [
      { nome: 'CEATOX Bahia', cidade: 'Salvador', estado: 'BA', telefone: '0800-284-4343' },
      { nome: 'CEATOX Ceará', cidade: 'Fortaleza', estado: 'CE', telefone: '0800-275-3633' },
      { nome: 'CEATOX Pernambuco', cidade: 'Recife', estado: 'PE', telefone: '0800-722-6001' },
      { nome: 'CEATOX Maranhão', cidade: 'São Luís', estado: 'MA', telefone: '(98) 3216-8249' },
      { nome: 'CEATOX Sergipe', cidade: 'Aracaju', estado: 'SE', telefone: '(79) 3259-3077' },
      { nome: 'CEATOX Rio Grande do Norte', cidade: 'Natal', estado: 'RN', telefone: '(84) 3232-7872' },
      { nome: 'CEATOX Paraíba', cidade: 'João Pessoa', estado: 'PB', telefone: '(83) 3218-6114' }
    ]
  },
  {
    regiao: 'Centro-Oeste',
    centros: [
      { nome: 'CEATOX Distrito Federal', cidade: 'Brasília', estado: 'DF', telefone: '0800-722-6001' },
      { nome: 'CEATOX Goiás', cidade: 'Goiânia', estado: 'GO', telefone: '(62) 3201-4700' },
      { nome: 'CEATOX Mato Grosso', cidade: 'Cuiabá', estado: 'MT', telefone: '0800-647-3633' },
      { nome: 'CEATOX Mato Grosso do Sul', cidade: 'Campo Grande', estado: 'MS', telefone: '(67) 3378-3800' }
    ]
  },
  {
    regiao: 'Sudeste',
    centros: [
      { nome: 'CEATOX São Paulo', cidade: 'São Paulo', estado: 'SP', telefone: '0800-014-8110' },
      { nome: 'CEATOX Campinas', cidade: 'Campinas', estado: 'SP', telefone: '(19) 3521-7555' },
      { nome: 'CEATOX Santos', cidade: 'Santos', estado: 'SP', telefone: '(13) 3222-2372' },
      { nome: 'CEATOX Rio de Janeiro', cidade: 'Rio de Janeiro', estado: 'RJ', telefone: '0800-722-6001' },
      { nome: 'CEATOX Niterói', cidade: 'Niterói', estado: 'RJ', telefone: '(21) 2671-5555' },
      { nome: 'CEATOX Minas Gerais', cidade: 'Belo Horizonte', estado: 'MG', telefone: '(31) 3239-9308' },
      { nome: 'CEATOX Juiz de Fora', cidade: 'Juiz de Fora', estado: 'MG', telefone: '(32) 3239-3920' },
      { nome: 'CEATOX Espírito Santo', cidade: 'Vitória', estado: 'ES', telefone: '(27) 3137-2394' }
    ]
  },
  {
    regiao: 'Sul',
    centros: [
      { nome: 'CEATOX Paraná', cidade: 'Curitiba', estado: 'PR', telefone: '0800-410-148' },
      { nome: 'CEATOX Londrina', cidade: 'Londrina', estado: 'PR', telefone: '(43) 3371-2244' },
      { nome: 'CEATOX Santa Catarina', cidade: 'Florianópolis', estado: 'SC', telefone: '0800-643-5252' },
      { nome: 'CEATOX Rio Grande do Sul', cidade: 'Porto Alegre', estado: 'RS', telefone: '(51) 3320-6000' }
    ]
  }
];

export default function Ceatox() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navigationLevel, setNavigationLevel] = useState(1);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedIntoxication, setSelectedIntoxication] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false);
  const [showCeatoxDialog, setShowCeatoxDialog] = useState(false);

  // BUSCAR CONTEÚDOS APROVADOS DO BANCO
  const { data: conteudosCeatox = [], isLoading } = useQuery({
    queryKey: ['ceatox-aprovados'],
    queryFn: async () => {
      const conteudos = await base44.entities.ConteudoEditorial.filter({
        tipo_modulo: 'protocolo',
        categoria: 'toxicologia',
        status_editorial: 'aprovado',
        publicado: true
      });
      return conteudos;
    },
    initialData: []
  });

  // Agrupar por categoria
  const intoxicationsByCategory = React.useMemo(() => {
    const grouped = {
      medicamentos: [],
      animais: [],
      plantas: [],
      quimicos: [],
      drogas: [],
      sindromes: []
    };

    conteudosCeatox.forEach(content => {
      const tags = content.tags || [];
      const titulo = content.titulo || '';
      
      if (tags.includes('medicamentos') || titulo.toLowerCase().includes('medicamento')) {
        grouped.medicamentos.push({ 
          name: content.titulo, 
          severity: content.conteudo_estruturado?.gravidade || 'média',
          id: content.id,
          content
        });
      } else if (tags.includes('animais') || titulo.toLowerCase().includes('serpente') || titulo.toLowerCase().includes('escorpião')) {
        grouped.animais.push({ 
          name: content.titulo, 
          severity: 'alta',
          id: content.id,
          content
        });
      } else if (tags.includes('plantas')) {
        grouped.plantas.push({ 
          name: content.titulo, 
          severity: content.conteudo_estruturado?.gravidade || 'média',
          id: content.id,
          content
        });
      } else if (tags.includes('quimicos')) {
        grouped.quimicos.push({ 
          name: content.titulo, 
          severity: 'alta',
          id: content.id,
          content
        });
      } else if (tags.includes('drogas')) {
        grouped.drogas.push({ 
          name: content.titulo, 
          severity: 'alta',
          id: content.id,
          content
        });
      } else if (tags.includes('sindromes') || titulo.toLowerCase().includes('síndrome')) {
        grouped.sindromes.push({ 
          name: content.titulo, 
          severity: 'alta',
          id: content.id,
          content
        });
      }
    });

    return grouped;
  }, [conteudosCeatox]);

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    setNavigationLevel(2);
  };

  const handleSelectIntoxication = (intox) => {
    setSelectedIntoxication(intox);
    setNavigationLevel(3);
    
    // Se vier do banco, já temos o conteúdo
    if (intox.content) {
      const normalized = {
        agent_name: intox.content.titulo,
        commercial_names: intox.content.conteudo_estruturado?.nomes_comerciais || [],
        drug_class: intox.content.conteudo_estruturado?.classe || '',
        mechanism: intox.content.conteudo_estruturado?.mecanismo || '',
        toxic_dose: intox.content.conteudo_estruturado?.dose_toxica || '',
        lethal_dose: intox.content.conteudo_estruturado?.dose_letal || '',
        onset_time: intox.content.conteudo_estruturado?.tempo_inicio || '',
        symptoms_by_system: intox.content.conteudo_estruturado?.sintomas_sistema || [],
        initial_stabilization: intox.content.conteudo_estruturado?.estabilizacao || [],
        decontamination: intox.content.conteudo_estruturado?.descontaminacao || {},
        antidote: intox.content.conteudo_estruturado?.antidoto || {},
        supportive_care: intox.content.conteudo_estruturado?.suporte || [],
        recommended_labs: intox.content.conteudo_estruturado?.exames || [],
        icu_criteria: intox.content.conteudo_estruturado?.criterios_uti || [],
        prognosis: intox.content.conteudo_estruturado?.prognostico || '',
        red_flags: intox.content.conteudo_estruturado?.red_flags || [],
        _metadata: {
          versao: intox.content.versao,
          data_atualizacao: intox.content.updated_date,
          fonte: 'Base Editorial',
          do_banco: true
        }
      };
      setSearchResult(normalized);
    }
  };

  const handleBack = () => {
    if (navigationLevel === 3) {
      setSelectedIntoxication(null);
      setSearchResult(null);
      setNavigationLevel(2);
    } else if (navigationLevel === 2) {
      setActiveCategory(null);
      setNavigationLevel(1);
    }
  };

  const handleSearch = async (term) => {
    if (!term) return;
    
    setIsSearching(true);
    setIsLoadingFromDB(true);
    
    try {
      const { contentManager } = await import('../components/content/ContentManager');
      
      const slug = `ceatox-${term.toLowerCase().replace(/\s+/g, '-')}`;
      const content = await contentManager.get(slug, {
        modulo: 'ceatox',
        tipo: 'guideline'
      });

      contentManager.trackAccess(slug);
      
      // VALIDAÇÃO OBRIGATÓRIA: normalizar dados para seguir template da Digoxina
      const normalizedData = normalizeCeatoxData({
        ...(content.conteudo || content),
        _metadata: {
          versao: content.versao || '1.0',
          data_atualizacao: content.ultima_atualizacao || content.created_date,
          fonte: content.fonte_primaria || 'Literatura Toxicológica',
          do_banco: true,
          diretrizes: content.diretrizes || [],
          livros_utilizados: content.livros_utilizados || []
        }
      });
      
      setSearchResult(normalizedData);
      setIsLoadingFromDB(false);
    } catch (error) {
      console.error('Erro ao buscar conteúdo toxicológico:', error);
      setIsLoadingFromDB(false);
      
      // Fallback para busca direta apenas se falhar completamente
      const response = await base44.integrations.Core.InvokeLLM({
      prompt: `
        Forneça informações EDUCACIONAIS sobre toxicologia para: ${term}
        Categoria: ${activeCategory?.id || 'geral'}
        
        CRÍTICO - MODELO 2 (Apenas Educacional):
        - NÃO prescreva tratamentos ou condutas específicas
        - Use linguagem educacional: "pode incluir", "abordagens comuns incluem", "conceitos gerais"
        - Evite: "deve", "indica-se", "prescrever", "tratamento definitivo"
        - Apenas explique conceitos, padrões toxicológicos e informações gerais
        - Sempre reforce: "Em casos de intoxicação real, CONTATAR CEATOX IMEDIATAMENTE"
        
        Forneça INFORMAÇÕES EDUCACIONAIS sobre:
        
        1. Nome do agente tóxico (comercial e princípio ativo se aplicável)
        2. Mecanismo de toxicidade (conceitos gerais)
        3. Dose tóxica de referência (educacional)
        4. Dose letal de referência (educacional)
        5. Sinais e sintomas descritos na literatura por sistema
        6. Tempo de início típico dos sintomas
        7. Abordagem geral educacional (conceitos de estabilização, descontaminação, suporte)
        8. Antídoto descrito na literatura (se existir) com informações gerais
        9. Conceitos de manejo hospitalar (educacional)
        10. Exames descritos na literatura
        11. Conceitos de gravidade
        12. Conceitos de indicação de cuidados intensivos
        13. Informações prognósticas da literatura
        14. Referências de fontes oficiais (ANVISA, Fiocruz, SINITOX)
      `,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          agent_name: { type: 'string' },
          commercial_names: { type: 'array', items: { type: 'string' } },
          drug_class: { type: 'string' },
          mechanism: { type: 'string' },
          toxic_dose: { type: 'string' },
          lethal_dose: { type: 'string' },
          onset_time: { type: 'string' },
          symptoms_by_system: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                system: { type: 'string' },
                symptoms: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          initial_stabilization: { type: 'array', items: { type: 'string' } },
          decontamination: {
            type: 'object',
            properties: {
              method: { type: 'string' },
              indications: { type: 'array', items: { type: 'string' } },
              contraindications: { type: 'array', items: { type: 'string' } }
            }
          },
          antidote: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dose: { type: 'string' },
              route: { type: 'string' },
              mechanism: { type: 'string' }
            }
          },
          supportive_care: { type: 'array', items: { type: 'string' } },
          recommended_labs: { type: 'array', items: { type: 'string' } },
          icu_criteria: { type: 'array', items: { type: 'string' } },
          prognosis: { type: 'string' },
          red_flags: { type: 'array', items: { type: 'string' } },
          references: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                info: { type: 'string' }
              }
            }
          }
        }
      }
      });

      // Normalizar também resposta do LLM
      const normalizedResponse = normalizeCeatoxData(response);
      setSearchResult(normalizedResponse);
    } finally {
      setIsSearching(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      'alta': 'bg-red-100 text-red-700 border-red-200',
      'grave': 'bg-red-100 text-red-700 border-red-200',
      'média': 'bg-amber-100 text-amber-700 border-amber-200',
      'moderada': 'bg-amber-100 text-amber-700 border-amber-200',
      'baixa': 'bg-green-100 text-green-700 border-green-200',
      'leve': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[severity?.toLowerCase()] || 'bg-slate-100 text-slate-700';
  };

  const handleCallCeatox = (telefone) => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
    } else {
      navigator.clipboard.writeText(telefone);
      toast.success(`Telefone copiado: ${telefone}`);
    }
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
                <Skull className="w-6 h-6 text-orange-500" />
                CEATOX - Toxicologia Clínica
              </h1>
              <p className="text-slate-500 mt-1">Centro de Assistência Toxicológica</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCeatoxDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                📞 Contatar CEATOX
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleCallCeatox('192')}
              >
                <Phone className="w-4 h-4 mr-2" />
                SAMU: 192
              </Button>
            </div>
          </div>

          {/* Emergency Alert */}
          <Card className="backdrop-blur-xl bg-red-50/80 border-red-200 shadow-lg mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="text-sm text-red-800">
                <span className="font-medium">Em caso de intoxicação REAL:</span> Contatar CEATOX imediatamente ou SAMU (192). NÃO provoque vômito sem orientação especializada.
              </div>
            </CardContent>
          </Card>

          {/* NÍVEL 1: CATEGORIAS */}
          {navigationLevel === 1 && (
            <>
              <Card className="backdrop-blur-xl bg-gradient-to-r from-orange-600 to-red-600 border-0 mb-6">
                <CardContent className="p-4">
                  <h2 className="text-white font-semibold text-base mb-1">Navegação por Categoria</h2>
                  <p className="text-orange-100 text-xs">Conteúdos aprovados do painel editorial</p>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card>
                  <CardContent className="p-8 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                    <span className="text-sm text-slate-600">Carregando conteúdos...</span>
                  </CardContent>
                </Card>
              ) : conteudosCeatox.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Nenhum conteúdo toxicológico aprovado</p>
                    <p className="text-xs text-slate-400 mt-1">Aguarde a publicação de conteúdos pelo painel editorial</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toxicCategories.map((cat) => {
                    const Icon = cat.icon;
                    const count = intoxicationsByCategory[cat.id]?.length || 0;
                    
                    if (count === 0) return null;
                    
                    return (
                      <Card
                        key={cat.id}
                        className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleSelectCategory(cat)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${cat.color} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-slate-800">{cat.label}</h3>
                              <p className="text-[10px] text-slate-500">{count} conteúdo(s)</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-orange-600 font-medium">
                            <span>Ver lista →</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* NÍVEL 2: LISTA DE INTOXICAÇÕES */}
          {navigationLevel === 2 && activeCategory && (
            <>
              <Button variant="outline" size="sm" onClick={handleBack} className="text-xs h-7 mb-4">
                ← Voltar às Categorias
              </Button>

              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(activeCategory.icon, { className: "w-6 h-6 text-white p-1 rounded bg-gradient-to-r " + activeCategory.color })}
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">{activeCategory.label}</h2>
                      <p className="text-[10px] text-slate-500">Clique em uma intoxicação para ver detalhes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-3">
                {intoxicationsByCategory[activeCategory.id]?.map((intox, idx) => (
                  <Card
                    key={idx}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer"
                    onClick={() => handleSelectIntoxication(intox)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-800">{intox.name}</h3>
                          <Badge className={`mt-1 text-[9px] ${getSeverityBadge(intox.severity)}`}>
                            {intox.severity === 'alta' ? '🔴 Alta' : intox.severity === 'média' ? '🟡 Média' : '🟢 Baixa'}
                          </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* NÍVEL 3: DETALHES */}
          {navigationLevel === 3 && isLoadingFromDB && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-3" />
                <p className="text-sm text-slate-600">Carregando do banco local...</p>
              </CardContent>
            </Card>
          )}

          {navigationLevel === 3 && isSearching && !isLoadingFromDB && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-3" />
                <p className="text-sm text-slate-600">Baixando e salvando informações toxicológicas...</p>
                <p className="text-xs text-slate-400 mt-2">Este conteúdo será salvo para acesso offline</p>
              </CardContent>
            </Card>
          )}

          {navigationLevel === 3 && searchResult && !isSearching && (
            <>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={handleBack} className="text-xs h-7">
                  ← Voltar à Lista
                </Button>
                <div className="flex items-center gap-2">
                  <OfflineIndicator />
                  {searchResult._metadata && (
                    <ContentVersionBadge content={searchResult._metadata} variant="compact" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Agent Info Header */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{searchResult.agent_name || searchResult.titulo}</CardTitle>
                        {(searchResult.drug_class || searchResult.classe_toxicologica) && (
                          <Badge variant="outline" className="mt-2">
                            {searchResult.drug_class || searchResult.classe_toxicologica}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        {(searchResult.toxic_dose || searchResult.dose_toxica) && (
                          <div className="text-sm">
                            <span className="text-slate-500">Dose tóxica:</span>
                            <Badge className="ml-2 bg-amber-100 text-amber-700">
                              {searchResult.toxic_dose || searchResult.dose_toxica}
                            </Badge>
                          </div>
                        )}
                        {(searchResult.lethal_dose || searchResult.dose_letal) && (
                          <div className="text-sm mt-1">
                            <span className="text-slate-500">Dose letal:</span>
                            <Badge className="ml-2 bg-red-100 text-red-700">
                              {searchResult.lethal_dose || searchResult.dose_letal}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(searchResult.commercial_names || searchResult.nomes_comerciais)?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">Nomes comerciais:</p>
                        <div className="flex flex-wrap gap-1">
                          {(searchResult.commercial_names || searchResult.nomes_comerciais).map((name, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Mecanismo de Toxicidade
                      </p>
                      <p className="text-slate-700">
                        {searchResult.mechanism || searchResult.mecanismo_toxicidade || 'Não especificado'}
                      </p>
                    </div>
                    {(searchResult.onset_time || searchResult.tempo_inicio_sintomas) && (
                      <div className="mt-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Início dos sintomas: {searchResult.onset_time || searchResult.tempo_inicio_sintomas}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Red Flags - SEMPRE EXIBIR */}
                <Card className="backdrop-blur-xl bg-red-50/80 border-red-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      SINAIS DE ALARME - BUSCAR ATENDIMENTO IMEDIATO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-2">
                      {searchResult.red_flags?.map((flag, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-800">
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          {flag}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Symptoms by System - SEMPRE EXIBIR */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      Sinais e Sintomas por Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {searchResult.symptoms_by_system?.map((sys, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-medium text-slate-800 mb-2">{sys.system || 'Sistema'}</p>
                          <ul className="space-y-1">
                            {(Array.isArray(sys.symptoms) ? sys.symptoms : [sys.symptoms || 'Não especificado']).map((s, j) => (
                              <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Treatment Protocol - SEMPRE EXIBIR AMBOS */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Initial Stabilization - SEMPRE EXIBIR */}
                  <Card className="backdrop-blur-xl bg-blue-50/80 border-blue-200 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          1. Estabilização
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {searchResult.initial_stabilization?.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                  {/* Decontamination - SEMPRE EXIBIR */}
                  <Card className="backdrop-blur-xl bg-amber-50/80 border-amber-200 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          2. Descontaminação
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="font-medium text-amber-800">
                            {searchResult.decontamination?.method || searchResult.decontamination?.metodo || 'Não especificado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-700 mb-1">✓ Indicações:</p>
                          <ul className="space-y-1">
                            {(searchResult.decontamination?.indications || searchResult.decontamination?.indicacoes || ['Não aplicável']).map((ind, i) => (
                              <li key={i} className="text-sm text-green-800">• {ind}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                </div>

                {/* Antidote - SEMPRE EXIBIR */}
                <Card className="backdrop-blur-xl bg-emerald-50/80 border-emerald-200 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-emerald-700 flex items-center gap-2 text-sm">
                        <Syringe className="w-4 h-4" />
                        3. ANTÍDOTO ESPECÍFICO
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-white/50 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-800">
                          {searchResult.antidote?.name || searchResult.antidote?.nome || 'Não existe antídoto específico'}
                        </p>
                        <div className="mt-3 space-y-2 text-sm">
                          <p>
                            <span className="text-emerald-600">Dose:</span>{' '}
                            <span className="font-medium text-emerald-800">
                              {searchResult.antidote?.dose || 'Não aplicável'}
                            </span>
                          </p>
                          <p>
                            <span className="text-emerald-600">Via:</span>{' '}
                            <span className="font-medium text-emerald-800">
                              {searchResult.antidote?.route || searchResult.antidote?.via || 'Não aplicável'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                {/* Supportive Care & Labs - SEMPRE EXIBIR AMBOS */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700">
                          4. Suporte Clínico
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {searchResult.supportive_care?.map((care, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {care}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700">
                          Exames Recomendados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {searchResult.recommended_labs?.map((lab, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {lab}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                </div>

                {/* ICU Criteria - SEMPRE EXIBIR */}
                <Card className="backdrop-blur-xl bg-red-50/80 border-red-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-red-700">
                      Critérios de Internação em UTI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-2">
                      {searchResult.icu_criteria?.map((criteria, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-800">
                          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          {criteria}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Prognosis - SEMPRE EXIBIR */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      Prognóstico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{searchResult.prognosis || 'Não especificado'}</p>
                  </CardContent>
                </Card>

                {/* Referencias Utilizadas (formato novo) */}
                {searchResult._metadata && (searchResult._metadata.diretrizes?.length > 0 || searchResult._metadata.livros_utilizados?.length > 0) && (
                  <Card className="backdrop-blur-xl bg-slate-50/80 border-slate-200 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        📚 Referências Utilizadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {searchResult._metadata.diretrizes?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-blue-600 font-semibold mb-2">Diretrizes e Protocolos:</p>
                          {searchResult._metadata.diretrizes.map((dir, i) => (
                            <div key={i} className="p-2 bg-blue-50 rounded border border-blue-100 mb-1">
                              <p className="text-xs text-blue-900 font-semibold">{dir.nome_completo}</p>
                              <p className="text-[10px] text-blue-700">{dir.sociedade} • {dir.ano}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResult._metadata.livros_utilizados?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-600 font-semibold mb-2">Livros-texto:</p>
                          {searchResult._metadata.livros_utilizados.map((livro, i) => (
                            <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100 mb-1">
                              <p className="text-xs text-slate-800">
                                {livro.autor_sobrenome}, {livro.autor_nome}. {livro.titulo_completo}. {livro.edicao}. {livro.local}: {livro.editora}; {livro.ano}.
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Versão Detalhada */}
                {searchResult._metadata && (
                  <ContentVersionBadge content={searchResult._metadata} variant="detailed" />
                )}

                {/* References antigas (fallback) */}
                {searchResult.references?.length > 0 && !searchResult._metadata && (
                  <Card className="backdrop-blur-xl bg-cyan-50/80 border-cyan-200 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-cyan-700 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Referências Oficiais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {searchResult.references.map((ref, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <p className="font-medium text-cyan-800 text-sm">{ref.source}</p>
                          <p className="text-xs text-cyan-600">{ref.info}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Dialog CEATOX Brasil */}
          <Dialog open={showCeatoxDialog} onOpenChange={setShowCeatoxDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
                  <PhoneCall className="w-6 h-6" />
                  Centros de Assistência Toxicológica - Brasil
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Contato direto com centros de toxicologia. Utilizar conforme necessidade clínica.
                </DialogDescription>
              </DialogHeader>

              <Accordion type="single" collapsible className="w-full">
                {ceatoxBrasil.map((regiao, idx) => (
                  <AccordionItem key={idx} value={`regiao-${idx}`}>
                    <AccordionTrigger className="text-lg font-semibold text-slate-800 hover:text-blue-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {regiao.regiao} ({regiao.centros.length} centros)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {regiao.centros.map((centro, cidx) => (
                          <Card key={cidx} className="bg-slate-50 hover:bg-slate-100 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-800 mb-1">
                                    {centro.nome}
                                  </h4>
                                  <p className="text-sm text-slate-600 mb-2">
                                    {centro.cidade} - {centro.estado}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-red-600" />
                                    <span className="font-mono font-semibold text-red-700">
                                      {centro.telefone}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleCallCeatox(centro.telefone)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <PhoneCall className="w-4 h-4 mr-1" />
                                    Ligar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(centro.telefone);
                                      toast.success('Telefone copiado!');
                                    }}
                                  >
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copiar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <Info className="w-3.5 h-3.5 inline mr-1" />
                  Em dispositivos móveis, clique em "Ligar" para iniciar a ligação direta. No desktop, o número será copiado automaticamente.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <DisclaimerFooter variant="ia" />
        </div>
      </main>
    </div>
  );
}