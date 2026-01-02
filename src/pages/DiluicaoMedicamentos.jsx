import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Syringe,
  Activity,
  Pill,
  Heart,
  Droplets,
  AlertTriangle,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';

const categorias = [
  { 
    id: 'vasoativas', 
    nome: 'Drogas Vasoativas', 
    icon: Activity, 
    color: 'bg-red-500',
    desc: 'Choque e suporte hemodinâmico'
  },
  { 
    id: 'sedacao_analgesia', 
    nome: 'Sedação / Analgesia', 
    icon: Pill, 
    color: 'bg-purple-500',
    desc: 'IOT, VM e procedimentos'
  },
  { 
    id: 'antibioticos', 
    nome: 'Antibióticos EV', 
    icon: Syringe, 
    color: 'bg-green-500',
    desc: 'Infecções graves e sepse'
  },
  { 
    id: 'emergencia_cardiologica', 
    nome: 'Emergência Cardiológica', 
    icon: Heart, 
    color: 'bg-rose-500',
    desc: 'Arritmias, ICC e SCA'
  },
  { 
    id: 'metabolicas_endocrinas', 
    nome: 'Metabólicas / Endócrinas', 
    icon: Droplets, 
    color: 'bg-cyan-500',
    desc: 'Eletrólitos e emergências'
  },
  { 
    id: 'outros', 
    nome: 'Outros', 
    icon: Syringe, 
    color: 'bg-slate-500',
    desc: 'Outros medicamentos EV'
  }
];

export default function DiluicaoMedicamentos() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nivel, setNivel] = useState(1); // 1=categorias, 2=medicacoes, 3=diluicao
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState(null);

  const { data: medicacoes = [], isLoading } = useQuery({
    queryKey: ['diluicoes'],
    queryFn: async () => {
      const result = await base44.entities.DiluicaoMedicamento.list();
      return result.sort((a, b) => {
        const nomeA = (a.data?.nome || a.nome || '').toLowerCase();
        const nomeB = (b.data?.nome || b.nome || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
      });
    },
    staleTime: Infinity
  });

  const handleSelectCategoria = (cat) => {
    setCategoriaAtiva(cat);
    setNivel(2);
  };

  const handleSelectMedicacao = (med) => {
    setMedicacaoAtiva(med);
    setNivel(3);
  };

  const handleVoltar = () => {
    if (nivel === 3) {
      setMedicacaoAtiva(null);
      setNivel(2);
    } else if (nivel === 2) {
      setCategoriaAtiva(null);
      setNivel(1);
    }
  };

  const medicacoesFiltradas = React.useMemo(() => {
    if (!categoriaAtiva) return [];
    return medicacoes.filter(m => {
      const medData = m.data || m;
      return medData.categoria === categoriaAtiva.id;
    });
  }, [medicacoes, categoriaAtiva]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Syringe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Diluição de Medicações</h1>
              <p className="text-xs text-slate-500">Navegação guiada • Máximo 3 cliques</p>
            </div>
          </div>

          {/* Aviso Institucional */}
          <Card className="bg-amber-50 border-amber-200 mb-4">
            <CardContent className="p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium">Sempre conferir protocolo institucional local</p>
                <p className="text-[10px] mt-0.5">As diluições apresentadas são padronizações de referência baseadas no Manual de Medicina de Emergência FMUSP 18ª ed.</p>
              </div>
            </CardContent>
          </Card>

          {/* NÍVEL 1: CATEGORIAS */}
          {nivel === 1 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((cat) => {
                const Icon = cat.icon;
                const count = medicacoes.filter(m => {
                  const medData = m.data || m;
                  return medData.categoria === cat.id;
                }).length;
                
                return (
                  <Card 
                    key={cat.id}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-xl hover:border-teal-300 transition-all cursor-pointer"
                    onClick={() => handleSelectCategoria(cat)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-800 mb-1">{cat.nome}</h3>
                          <p className="text-xs text-slate-500">{cat.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {count} medicação(ões)
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-teal-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* NÍVEL 2: MEDICAÇÕES */}
          {nivel === 2 && categoriaAtiva && (
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVoltar}
                className="text-xs h-7 mb-4"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Voltar às Categorias
              </Button>

              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(categoriaAtiva.icon, { 
                      className: `w-6 h-6 text-white p-1 rounded ${categoriaAtiva.color}` 
                    })}
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">{categoriaAtiva.nome}</h2>
                      <p className="text-xs text-slate-500">{medicacoesFiltradas.length} medicação(ões) disponível(is)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-3">
                {medicacoesFiltradas.map((med) => {
                  const medData = med.data || med;
                  return (
                    <Card 
                      key={med.id}
                      className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
                      onClick={() => handleSelectMedicacao(med)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-800">{medData.nome}</h3>
                          <Syringe className="w-4 h-4 text-teal-500" />
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{medData.subtitulo}</p>
                        <Badge variant="outline" className="text-[9px]">
                          {medData.apresentacao}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* NÍVEL 3: DILUIÇÃO COMPLETA */}
          {nivel === 3 && medicacaoAtiva && (() => {
            const medData = medicacaoAtiva.data || medicacaoAtiva;
            return (
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVoltar}
                  className="text-xs h-7 mb-4"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" /> Voltar às Medicações
                </Button>

                <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                  <CardContent className="p-5">
                    {/* Cabeçalho */}
                    <div className="mb-5">
                      <h2 className="text-xl font-bold text-slate-800 mb-2">{medData.nome}</h2>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-teal-500 text-white text-xs">{medData.subtitulo}</Badge>
                        <Badge variant="outline" className="text-xs">{medData.apresentacao}</Badge>
                      </div>
                    </div>

                    {/* Indicação */}
                    {medData.indicacao_principal && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Indicação Principal</h3>
                        <p className="text-sm text-slate-700">{medData.indicacao_principal}</p>
                      </div>
                    )}

                    {/* Diluição Padrão */}
                    <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <h3 className="text-xs font-semibold text-teal-800 uppercase mb-3">Diluição Padrão</h3>
                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] text-teal-600 font-medium mb-1">Solvente</p>
                          <p className="text-teal-900 font-semibold">{medData.diluicao_solvente}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-teal-600 font-medium mb-1">Volume Final</p>
                          <p className="text-teal-900 font-semibold">{medData.diluicao_volume_final}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-teal-600 font-medium mb-1">Concentração</p>
                          <p className="text-teal-900 font-semibold">{medData.diluicao_concentracao}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dose */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Dose Usual</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500">Dose Inicial</p>
                          <p className="text-sm text-slate-800 font-medium">{medData.dose_inicial}</p>
                        </div>
                        {medData.dose_maxima && (
                          <div>
                            <p className="text-[10px] text-slate-500">Dose Máxima</p>
                            <p className="text-sm text-slate-800 font-medium">{medData.dose_maxima}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Velocidade */}
                    {medData.velocidade_infusao && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Velocidade de Infusão</h3>
                        <p className="text-sm text-slate-700">{medData.velocidade_infusao}</p>
                      </div>
                    )}

                    {/* Alertas */}
                    {medData.alertas?.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="text-xs font-semibold text-red-700 uppercase mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Cuidados e Alertas
                        </h3>
                        <ul className="space-y-1">
                          {medData.alertas.map((alerta, i) => (
                            <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                              {alerta}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Observações */}
                    {medData.observacoes && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Observações Clínicas</h3>
                        <p className="text-xs text-slate-600">{medData.observacoes}</p>
                      </div>
                    )}

                    {/* Referência */}
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-[10px] text-slate-500">
                        <strong>Referência:</strong> {medData.referencia || 'Manual de Medicina de Emergência – Abordagem Prática, 18ª ed. FMUSP'}
                      </p>
                      {medData.revisado_em && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Última revisão: {new Date(medData.revisado_em).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          <DisclaimerFooter variant="medicacao" />
        </div>
      </main>
    </div>
  );
}