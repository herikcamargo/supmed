import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import ImagePlaceholder from '../components/medical/ImagePlaceholder';
import {
  Activity,
  Search,
  Filter,
  AlertTriangle,
  Zap,
  Heart,
  Clock,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  BookOpen
} from 'lucide-react';

// Dados seed de patologias ECG
const ecgPatologiasSeed = [
  {
    nome_patologia: 'IAM com Supra de ST - Parede Anterior',
    categoria: 'isquemia_infarto',
    classificacao_clinica: 'urgente',
    descricao_clinica: 'Dor torácica precordial intensa, sudorese, náuseas. Janela terapêutica crítica <12h para reperfusão.',
    sintomas_associados: ['dor torácica', 'dispneia', 'sudorese', 'náuseas'],
    achados_chave: [
      'Supradesnivelamento ST em V1-V4',
      'Onda Q patológica (>0.04s)',
      'Inversão de onda T',
      'Imagem em espelho (infra ST em parede inferior)'
    ],
    peculiaridades: [
      'V1-V2: Septo e parede anterior',
      'V3-V4: Ápice e parede anterior',
      'Elevação côncava: pericardite (diferencial)'
    ],
    variacoes_comuns: [
      'IAMCST extenso anterior (V1-V6 + DI, aVL)',
      'Killip I-IV dependendo da extensão'
    ],
    diferenciais: ['Pericardite aguda', 'Aneurisma ventricular', 'Repolarização precoce', 'Brugada'],
    armadilhas: [
      'BRE pode mascarar IAMCST',
      'Critério de Sgarbossa em BRE prévio',
      'Não esperar troponina se IAMCST nítido'
    ],
    nivel_urgencia: 'critico',
    plantonista_slug: 'IAM',
    frequencia: 'muito_comum',
    fontes: ['AHA STEMI Guidelines 2023', 'ESC Acute MI Guidelines']
  },
  {
    nome_patologia: 'IAM com Supra de ST - Parede Inferior',
    categoria: 'isquemia_infarto',
    classificacao_clinica: 'urgente',
    descricao_clinica: 'Dor torácica, pode ter sintomas atípicos (epigastralgia, náuseas). Risco de BAV e bradicardia.',
    sintomas_associados: ['dor torácica', 'náuseas', 'vômitos', 'bradicardia'],
    achados_chave: [
      'Supradesnivelamento ST em DII, DIII, aVF',
      'Infra ST recíproco em I, aVL',
      'Avaliar V3R-V4R (VD)',
      'Onda Q patológica'
    ],
    peculiaridades: [
      'Se DIII > DII: pensar em coronária direita',
      'Avaliar sempre VD (V3R, V4R)',
      'Risco de BAV 2º/3º grau'
    ],
    variacoes_comuns: [
      'IAM inferior + VD (fatal se nitrato)',
      'IAM inferolateral',
      'IAM inferoposterior'
    ],
    diferenciais: ['Pericardite', 'Miocardite', 'Repolarização precoce'],
    armadilhas: [
      'NUNCA nitrato se suspeita de VD',
      'BAV pode ser transitório',
      'Pode ter dor atípica (epigástrica)'
    ],
    nivel_urgencia: 'critico',
    plantonista_slug: 'IAM',
    frequencia: 'muito_comum',
    fontes: ['AHA STEMI Guidelines', 'Circulation 2023']
  },
  {
    nome_patologia: 'Fibrilação Atrial',
    categoria: 'arritmias',
    classificacao_clinica: 'potencialmente_grave',
    descricao_clinica: 'Palpitações, dispneia, fadiga. Pode ser assintomática. Risco de AVC e IC.',
    sintomas_associados: ['palpitações', 'dispneia', 'fadiga', 'tontura'],
    achados_chave: [
      'Ausência de ondas P',
      'Linha de base irregular (ondas f)',
      'RR irregularmente irregular',
      'Resposta ventricular variável'
    ],
    peculiaridades: [
      'FC pode ser rápida (>100) ou controlada',
      'Avaliar sempre CHA2DS2-VASc',
      'Avaliar HAS-BLED se anticoagular'
    ],
    variacoes_comuns: [
      'FA com RVR (resposta ventricular rápida)',
      'FA com BRE ou BRD',
      'FA paroxística vs persistente vs permanente'
    ],
    diferenciais: ['Flutter atrial', 'TPSV com BAV variável', 'Taquicardia atrial multifocal'],
    armadilhas: [
      'BRE + FA pode parecer TV',
      'Não cardioverter se >48h sem anticoagulação',
      'Avaliar sempre tireoide'
    ],
    nivel_urgencia: 'alto',
    plantonista_slug: 'Fibrilação Atrial',
    frequencia: 'muito_comum',
    fontes: ['ESC AF Guidelines 2024', 'AHA AF Management']
  },
  {
    nome_patologia: 'Taquicardia Ventricular',
    categoria: 'arritmias',
    classificacao_clinica: 'urgente',
    descricao_clinica: 'Palpitações, síncope, instabilidade hemodinâmica. Risco de FV e morte súbita.',
    sintomas_associados: ['palpitações', 'síncope', 'dor torácica', 'dispneia'],
    achados_chave: [
      'QRS alargado (>0.12s)',
      'FC 100-250 bpm',
      'Dissociação AV (ondas P independentes)',
      'Batimentos de captura/fusão'
    ],
    peculiaridades: [
      'TV monomórfica vs polimórfica',
      'Torsades de Pointes (QT longo)',
      'Critérios de Brugada para TV'
    ],
    variacoes_comuns: [
      'TV sustentada (>30s)',
      'TV não sustentada',
      'Torsades de Pointes'
    ],
    diferenciais: ['TSV com aberrância', 'TSV com BRE prévio', 'Ritmo de marca-passo'],
    armadilhas: [
      'NUNCA usar verapamil (fatal)',
      'QRS largo + irregular = FA com BRE (não TV)',
      'Na dúvida, tratar como TV'
    ],
    nivel_urgencia: 'critico',
    plantonista_slug: 'Taquicardia Ventricular',
    frequencia: 'comum',
    fontes: ['AHA ACLS 2024', 'ESC Ventricular Arrhythmias']
  },
  {
    nome_patologia: 'Bloqueio AV 3º Grau (BAV Total)',
    categoria: 'disturbios_conducao',
    classificacao_clinica: 'urgente',
    descricao_clinica: 'Síncope, tontura, fadiga extrema. Pode evoluir para assistolia.',
    sintomas_associados: ['síncope', 'tontura', 'fadiga', 'dispneia'],
    achados_chave: [
      'Dissociação AV completa',
      'Ondas P regulares',
      'QRS regulares (próprio)',
      'Nenhuma relação P-QRS',
      'FC ventricular <40-60 bpm'
    ],
    peculiaridades: [
      'QRS estreito: bloqueio nodal (bom prognóstico)',
      'QRS largo: bloqueio infranodal (pior prognóstico)',
      'Ritmo de escape juncional vs ventricular'
    ],
    variacoes_comuns: [
      'BAV total congênito',
      'BAV total pós-IAM inferior',
      'BAV total por lesão do sistema His-Purkinje'
    ],
    diferenciais: ['BAV 2º grau avançado', 'Ritmo juncional com BAV 1º'],
    armadilhas: [
      'Indicação de marca-passo definitivo',
      'Atropina pode não funcionar se infranodal',
      'Pode evoluir para assistolia'
    ],
    nivel_urgencia: 'critico',
    plantonista_slug: 'Bloqueio AV',
    frequencia: 'comum',
    fontes: ['AHA Bradycardia Guidelines', 'ACC Pacemaker Guidelines']
  },
  {
    nome_patologia: 'Hipercalemia',
    categoria: 'alteracoes_metabolicas',
    classificacao_clinica: 'urgente',
    descricao_clinica: 'Fraqueza muscular, parestesias. Risco de arritmias fatais. IRA, uso de IECA/BRA.',
    sintomas_associados: ['fraqueza', 'parestesias', 'náuseas'],
    achados_chave: [
      'Ondas T apiculadas (picudas)',
      'Alargamento QRS',
      'Achatamento/ausência de onda P',
      'Padrão sinusoidal (grave)'
    ],
    peculiaridades: [
      'Progressão: T picuda → QRS largo → sinusoidal → FV',
      'Correlação ECG-K+ nem sempre linear',
      'Tratamento urgente se K+ >6.5 ou alterações ECG'
    ],
    variacoes_comuns: [
      'Hipercalemia leve (T picuda isolada)',
      'Hipercalemia grave (QRS largo)',
      'Hipercalemia crítica (sinusoidal)'
    ],
    diferenciais: ['IAM hiperagudo', 'Isquemia', 'Efeito digitálico'],
    armadilhas: [
      'T picuda pode ser única alteração',
      'Não esperar K+ laboratorial para tratar',
      'Gluconato de cálcio não baixa K+ (estabiliza)'
    ],
    nivel_urgencia: 'critico',
    plantonista_slug: 'Hipercalemia',
    frequencia: 'comum',
    fontes: ['NEJM Hyperkalemia 2023', 'UpToDate']
  },
  {
    nome_patologia: 'Síndrome de Brugada',
    categoria: 'sindromes_especiais',
    classificacao_clinica: 'potencialmente_grave',
    descricao_clinica: 'Síncope, morte súbita familiar. Pode desmascarar com febre ou drogas.',
    sintomas_associados: ['síncope', 'palpitações', 'morte súbita abortada'],
    achados_chave: [
      'Padrão tipo 1: Supra ST "em cúpula" V1-V3',
      'BRD incompleto',
      'Inversão de onda T em V1-V3',
      'Pode ser intermitente'
    ],
    peculiaridades: [
      'Tipo 1: diagnóstico (supra ≥2mm + descida)',
      'Tipo 2 e 3: sugestivos (teste com flecainida)',
      'Desmascarar com derivações altas (V1-V2 2º EIC)'
    ],
    variacoes_comuns: [
      'Brugada tipo 1 (diagnóstico)',
      'Brugada tipo 2 (em sela)',
      'Brugada tipo 3 (supra <1mm)'
    ],
    diferenciais: ['BRD típico', 'IAMCST anterior', 'Pericardite', 'Atleta'],
    armadilhas: [
      'Pode ser intermitente (normal em alguns ECGs)',
      'Febre pode desmascarar',
      'Evitar antiarrítmicos IC'
    ],
    nivel_urgencia: 'alto',
    plantonista_slug: 'Brugada',
    frequencia: 'incomum',
    fontes: ['HRS Brugada Guidelines', 'ESC Sudden Death']
  },
  {
    nome_patologia: 'Pericardite Aguda',
    categoria: 'outros',
    classificacao_clinica: 'potencialmente_grave',
    descricao_clinica: 'Dor torácica pleurítica, melhora sentado. Atrito pericárdico. Pós-viral comum.',
    sintomas_associados: ['dor torácica', 'febre', 'dispneia'],
    achados_chave: [
      'Supra ST difuso (côncavo)',
      'Infra PR em todas derivações (específico)',
      'Ausência de ondas Q',
      'Ausência de imagem em espelho'
    ],
    peculiaridades: [
      'Supra ST côncavo (vs IAM convexo)',
      'Infra PR muito específico',
      'Evolui para inversão T difusa'
    ],
    variacoes_comuns: [
      'Pericardite viral',
      'Pericardite pós-IAM (Dressler)',
      'Pericardite urêmica'
    ],
    diferenciais: ['IAM', 'Repolarização precoce', 'Miocardite'],
    armadilhas: [
      'Pode ter troponina elevada (miopericardite)',
      'Derrame pode evoluir para tamponamento',
      'Evitar anticoagulação (risco hemopericárdio)'
    ],
    nivel_urgencia: 'moderado',
    plantonista_slug: 'Pericardite',
    frequencia: 'comum',
    fontes: ['ESC Pericardial Diseases', 'Circulation']
  }
];

export default function ECG({ embedded = false }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [urgenciaFiltro, setUrgenciaFiltro] = useState('todas');
  const [selectedPatologia, setSelectedPatologia] = useState(null);
  const navigate = useNavigate();

  // Carregar patologias
  const { data: patologias = [] } = useQuery({
    queryKey: ['ecg_patologias'],
    queryFn: async () => {
      try {
        const data = await base44.entities.ECGPatologia.list();
        if (data.length === 0) return ecgPatologiasSeed;
        return data;
      } catch {
        return ecgPatologiasSeed;
      }
    },
    initialData: ecgPatologiasSeed
  });

  // Filtrar patologias
  const patologiasFiltradas = patologias.filter(p => {
    const matchSearch = !searchTerm || 
      p.nome_patologia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.achados_chave?.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.sintomas_associados?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategoria = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro;
    const matchUrgencia = urgenciaFiltro === 'todas' || p.nivel_urgencia === urgenciaFiltro;
    
    return matchSearch && matchCategoria && matchUrgencia;
  });

  const urgenciaColors = {
    baixo: 'bg-green-100 text-green-700',
    moderado: 'bg-yellow-100 text-yellow-700',
    alto: 'bg-orange-100 text-orange-700',
    critico: 'bg-red-100 text-red-700'
  };

  const categoriaLabels = {
    isquemia_infarto: 'Isquemia/Infarto',
    arritmias: 'Arritmias',
    disturbios_conducao: 'Distúrbios de Condução',
    sindromes_especiais: 'Síndromes Especiais',
    alteracoes_metabolicas: 'Alterações Metabólicas',
    outros: 'Outros'
  };

  const irParaPlantonista = (slug) => {
    navigate(createPageUrl('Plantonista'), { state: { searchQuery: slug } });
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-slate-100'}>
      {!embedded && <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />}
      
      <main className={embedded ? '' : `transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className={embedded ? '' : 'p-4 md:p-6'}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Atlas de ECG</h1>
                <p className="text-xs text-slate-500">Apoio visual para interpretação eletrocardiográfica</p>
              </div>
            </div>
          </div>

          {/* Aviso Legal */}
          <Card className="mb-4 bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>Aviso Legal:</strong> Este atlas é apenas para apoio educacional e comparação visual. 
                  NÃO realiza interpretação automática, NÃO emite laudos e NÃO substitui avaliação médica.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Busca e Filtros */}
          <Card className="bg-white/80 border-slate-200 mb-4">
            <CardContent className="p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por patologia, achados ou sintomas..."
                  className="pl-9 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas Categorias</SelectItem>
                    <SelectItem value="isquemia_infarto">Isquemia/Infarto</SelectItem>
                    <SelectItem value="arritmias">Arritmias</SelectItem>
                    <SelectItem value="disturbios_conducao">Distúrbios Condução</SelectItem>
                    <SelectItem value="sindromes_especiais">Síndromes Especiais</SelectItem>
                    <SelectItem value="alteracoes_metabolicas">Alt. Metabólicas</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={urgenciaFiltro} onValueChange={setUrgenciaFiltro}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Urgência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-slate-500">
                {patologiasFiltradas.length} patologia(s) encontrada(s)
              </div>
            </CardContent>
          </Card>

          {/* Grid de Patologias */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {patologiasFiltradas.map((pat, i) => (
              <Card 
                key={i} 
                className="bg-white/80 border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPatologia(pat)}
              >
                <CardContent className="p-0">
                  {/* Placeholder ECG */}
                  <div className="w-full h-24">
                    <ImagePlaceholder 
                      tipo="ECG"
                      titulo={pat.nome_patologia}
                      className="w-full h-full rounded-t-lg"
                    />
                  </div>
                  
                  <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-1">
                        {pat.nome_patologia}
                      </h3>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
                          {categoriaLabels[pat.categoria]}
                        </Badge>
                        {pat.classificacao_clinica === 'urgente' && (
                          <Badge className="text-[8px] bg-red-100 text-red-700 px-1 py-0 h-4">
                            URGENTE
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-[8px] ml-2 ${urgenciaColors[pat.nivel_urgencia]}`}>
                      {pat.nivel_urgencia}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                    {pat.descricao_clinica}
                  </p>
                  
                  <div className="flex gap-1 flex-wrap">
                    {pat.achados_chave?.slice(0, 2).map((ach, j) => (
                      <Badge key={j} className="text-[8px] bg-blue-50 text-blue-700 px-1 py-0 h-4">
                        {ach.substring(0, 20)}...
                      </Badge>
                    ))}
                    {pat.achados_chave?.length > 2 && (
                      <Badge className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0 h-4">
                        +{pat.achados_chave.length - 2}
                      </Badge>
                    )}
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dialog de Detalhes */}
          {selectedPatologia && (
            <Dialog open={!!selectedPatologia} onOpenChange={() => setSelectedPatologia(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between pr-8">
                    <span className="text-base">{selectedPatologia.nome_patologia}</span>
                    <div className="flex gap-2">
                      <Badge className="text-[8px]">{categoriaLabels[selectedPatologia.categoria]}</Badge>
                      <Badge className={`text-[8px] ${urgenciaColors[selectedPatologia.nivel_urgencia]}`}>
                        {selectedPatologia.nivel_urgencia}
                      </Badge>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* ECG Placeholder */}
                  <ImagePlaceholder 
                    tipo="ECG"
                    titulo={selectedPatologia.nome_patologia}
                    descricao="Traçado ilustrativo para fins educacionais"
                    className="w-full h-40"
                  />

                  <Separator />

                  {/* Botão Plantonista - DESTAQUE */}
                  <Button 
                    className="w-full h-10 bg-blue-900 hover:bg-blue-800 text-sm"
                    onClick={() => {
                      setSelectedPatologia(null);
                      irParaPlantonista(selectedPatologia.plantonista_slug);
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ver Conduta no Plantonista
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Separator />

                  {/* Contexto Clínico */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Contexto Clínico
                    </h4>
                    <p className="text-xs text-slate-700">{selectedPatologia.descricao_clinica}</p>
                  </div>

                  {/* Achados ECG */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Achados Eletrocardiográficos
                    </h4>
                    <ul className="space-y-0.5">
                      {selectedPatologia.achados_chave?.map((ach, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Peculiaridades */}
                  {selectedPatologia.peculiaridades?.length > 0 && (
                    <div className="p-2 bg-blue-50 rounded border border-blue-100">
                      <h4 className="text-xs font-semibold text-blue-700 uppercase mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Peculiaridades
                      </h4>
                      <ul className="space-y-0.5">
                        {selectedPatologia.peculiaridades.map((pec, i) => (
                          <li key={i} className="text-xs text-blue-700">• {pec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Variações */}
                  {selectedPatologia.variacoes_comuns?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Variações Comuns</h4>
                      <ul className="space-y-0.5">
                        {selectedPatologia.variacoes_comuns.map((var_, i) => (
                          <li key={i} className="text-xs text-slate-700">• {var_}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Diferenciais */}
                  {selectedPatologia.diferenciais?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Diagnósticos Diferenciais</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPatologia.diferenciais.map((dif, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{dif}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Armadilhas */}
                  {selectedPatologia.armadilhas?.length > 0 && (
                    <div className="p-2 bg-red-50 rounded border border-red-100">
                      <h4 className="text-xs font-semibold text-red-700 uppercase mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Armadilhas
                      </h4>
                      <ul className="space-y-0.5">
                        {selectedPatologia.armadilhas.map((arm, i) => (
                          <li key={i} className="text-xs text-red-700">⚠️ {arm}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  {/* Botão Plantonista - Repetido no final */}
                  <Button 
                    className="w-full h-9 bg-blue-900 hover:bg-blue-800 text-xs"
                    onClick={() => {
                      setSelectedPatologia(null);
                      irParaPlantonista(selectedPatologia.plantonista_slug);
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Ver Conduta Completa no Plantonista
                  </Button>

                  {/* Fontes */}
                  <div className="text-[10px] text-slate-400 border-t pt-2">
                    <p className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> 
                      <strong>Fontes:</strong> {selectedPatologia.fontes?.join(', ')}
                    </p>
                    <p className="mt-1">⚠️ Conteúdo educacional. Não substitui avaliação médica.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  );
}