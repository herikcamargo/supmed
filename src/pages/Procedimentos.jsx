import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scissors, 
  Heart,
  Wind,
  Droplets,
  Brain,
  Baby,
  User,
  Clock,
  ChevronRight,
  BookOpen,
  Shield,
  Loader2
} from 'lucide-react';
import ProcedimentoViewer from '../components/procedimentos/ProcedimentoViewer';

const categorias = [
  { id: 'via_aerea', label: 'Via Aérea e Respiração', icon: Wind, color: 'bg-sky-500', desc: 'IOT, VM e oxigenoterapia' },
  { id: 'acesso_vascular', label: 'Acessos Vasculares', icon: Droplets, color: 'bg-blue-500', desc: 'Periféricos e centrais' },
  { id: 'cardiovascular', label: 'Cardiovasculares', icon: Heart, color: 'bg-rose-500', desc: 'RCP e cardioversão' },
  { id: 'toracico', label: 'Procedimentos Torácicos', icon: Heart, color: 'bg-red-500', desc: 'Drenagem e toracocentese' },
  { id: 'neurologico', label: 'Procedimentos Neurológicos', icon: Brain, color: 'bg-purple-500', desc: 'Punção lombar e PIC' },
  { id: 'abdominal', label: 'Abdominais/Gastrointestinais', icon: User, color: 'bg-amber-500', desc: 'Sondas e paracentese' },
  { id: 'urologico', label: 'Procedimentos Urológicos', icon: Droplets, color: 'bg-cyan-500', desc: 'Sondagem vesical' },
  { id: 'infecto_choque', label: 'Infectologia/Suporte Choque', icon: Shield, color: 'bg-emerald-500', desc: 'Sepse e PAM invasiva' },
  { id: 'trauma', label: 'Trauma', icon: Scissors, color: 'bg-orange-500', desc: 'ATLS e PHTLS' },
  { id: 'outros', label: 'Outros', icon: BookOpen, color: 'bg-gray-500', desc: 'Procedimentos diversos' }
];

const nivelComplexidade = {
  basico: { label: 'Básico', color: 'bg-green-100 text-green-700' },
  intermediario: { label: 'Intermediário', color: 'bg-yellow-100 text-yellow-700' },
  avancado: { label: 'Avançado', color: 'bg-orange-100 text-orange-700' },
  especialista: { label: 'Especialista', color: 'bg-red-100 text-red-700' }
};

export default function Procedimentos() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nivel, setNivel] = useState(1); // 1=categorias, 2=procedimentos, 3=detalhe
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState(null);
  const [contextoRetorno, setContextoRetorno] = useState(null);

  // BUSCAR APENAS PROCEDIMENTOS APROVADOS
  const { data: procedimentos = [], isLoading } = useQuery({
    queryKey: ['procedimentos-aprovados'],
    queryFn: async () => {
      const result = await base44.entities.Procedimento.filter({
        status_editorial: 'aprovado',
        publicado: true
      });
      return result;
    },
    initialData: []
  });

  // Detectar chegada via URL com contexto
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const procId = urlParams.get('proc_id');
    const origem = urlParams.get('origem');
    const afeccao = urlParams.get('afeccao');
    
    if (procId && procedimentos.length > 0) {
      const proc = procedimentos.find(p => {
        const pData = p.data || p;
        return pData.slug === procId || p.id === procId;
      });
      
      if (proc) {
        setSelectedProcedimento(proc);
        setNivel(3);
        
        if (origem && afeccao) {
          setContextoRetorno({ origem, afeccao });
        }
      }
    }
  }, [procedimentos]);

  const handleSelectCategoria = (cat) => {
    setCategoriaAtiva(cat);
    setNivel(2);
  };

  const handleSelectProcedimento = (proc) => {
    setSelectedProcedimento(proc);
    setNivel(3);
  };

  const handleVoltar = () => {
    // Se veio de outra página (com contexto), voltar para lá
    if (nivel === 3 && contextoRetorno) {
      if (contextoRetorno.origem === 'plantonista') {
        window.location.href = createPageUrl('Plantonista') + 
          `?retorno_afeccao=${encodeURIComponent(contextoRetorno.afeccao)}`;
        return;
      }
    }
    
    // Navegação normal dentro da página
    if (nivel === 3) {
      setSelectedProcedimento(null);
      setContextoRetorno(null);
      setNivel(2);
    } else if (nivel === 2) {
      setCategoriaAtiva(null);
      setNivel(1);
    }
  };

  const procedimentosFiltrados = React.useMemo(() => {
    if (!categoriaAtiva) return [];
    return procedimentos.filter(p => {
      const procData = p.data || p;
      return procData.categoria === categoriaAtiva.id;
    });
  }, [procedimentos, categoriaAtiva]);



  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Procedimentos Médicos</h1>
                <p className="text-xs text-slate-500">Guia visual passo a passo</p>
              </div>
            </div>
          </div>

          {/* Aviso Legal ANVISA-safe */}
          <Card className="bg-amber-50 border-amber-200 mb-4">
            <CardContent className="p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-0.5">Aviso Importante</p>
                <p className="text-[10px] text-amber-700">
                  Este conteúdo é educacional e de apoio. Execute procedimentos apenas se estiver devidamente capacitado e treinado. 
                  Não substitui treinamento formal nem avalia habilidade técnica.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* NÍVEL 1: CATEGORIAS */}
          {nivel === 1 && (
            <>
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                    <span className="text-sm text-slate-600">Carregando procedimentos aprovados...</span>
                  </CardContent>
                </Card>
              ) : procedimentos.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-slate-600">Nenhum procedimento aprovado</p>
                    <p className="text-xs text-slate-400 mt-1">Aguarde a publicação de conteúdos pelo painel editorial</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorias.map((cat) => {
                    const Icon = cat.icon;
                    const count = procedimentos.filter(p => {
                      const procData = p.data || p;
                      return procData.categoria === cat.id;
                    }).length;
                    
                    if (count === 0) return null;
                    
                    return (
                      <Card 
                        key={cat.id}
                        className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-xl hover:border-violet-300 transition-all cursor-pointer"
                        onClick={() => handleSelectCategoria(cat)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-slate-800 mb-1">{cat.label}</h3>
                              <p className="text-xs text-slate-500">{count} procedimento(s)</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end text-xs text-violet-600 font-medium">
                            Ver procedimentos <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* NÍVEL 2: PROCEDIMENTOS */}
          {nivel === 2 && categoriaAtiva && (
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVoltar}
                className="text-xs h-7 mb-4"
              >
                <ChevronRight className="w-3 h-3 mr-1 rotate-180" /> Voltar às Categorias
              </Button>

              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(categoriaAtiva.icon, { 
                      className: `w-6 h-6 text-white p-1 rounded ${categoriaAtiva.color}` 
                    })}
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">{categoriaAtiva.label}</h2>
                      <p className="text-xs text-slate-500">{procedimentosFiltrados.length} procedimento(s) disponível(is)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-3">
                {procedimentosFiltrados.map((proc) => {
                  const procData = proc.data || proc;
                  const nivelInfo = nivelComplexidade[procData.nivel_complexidade] || nivelComplexidade.intermediario;
                  
                  return (
                    <Card 
                      key={proc.id}
                      className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-md hover:border-violet-300 transition-all cursor-pointer"
                      onClick={() => handleSelectProcedimento(proc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-800 flex-1">{procData.nome}</h3>
                          <Scissors className="w-4 h-4 text-violet-500 flex-shrink-0 ml-2" />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className={`text-[8px] px-1.5 py-0 h-4 ${nivelInfo.color}`}>
                            {nivelInfo.label}
                          </Badge>
                          {procData.tempo_medio && (
                            <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 text-slate-600">
                              <Clock className="w-2 h-2 mr-0.5" />{procData.tempo_medio}
                            </Badge>
                          )}
                        </div>
                        {procData.indicacoes?.length > 0 && (
                          <p className="text-[10px] text-slate-600">
                            {procData.indicacoes[0]}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* NÍVEL 3: DETALHES DO PROCEDIMENTO */}
          {nivel === 3 && selectedProcedimento && (
            <ProcedimentoViewer 
              procedimento={selectedProcedimento} 
              onBack={handleVoltar}
              contextoRetorno={contextoRetorno}
            />
          )}
        </div>
      </main>
    </div>
  );
}