import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Newspaper, 
  TrendingUp, 
  Lightbulb, 
  Calendar, 
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Star,
  Share2,
  Moon,
  Search,
  Archive
} from 'lucide-react';

// Dados de exemplo para demonstração
const edicaoExemplo = {
  numero_edicao: 17,
  data_inicio: '2025-02-03',
  data_fim: '2025-02-10',
  atualizacoes_semana: [
    { titulo: 'Novo guideline de hipertensão arterial', resumo: 'A Sociedade Brasileira de Cardiologia publicou atualização nas metas pressóricas para pacientes diabéticos, recomendando PA < 130/80 mmHg.', fonte: 'SBC 2025' },
    { titulo: 'Avanço em terapia gênica para hemofilia', resumo: 'Estudo fase III demonstra eficácia de 94% na redução de episódios hemorrágicos com dose única de terapia gênica.', fonte: 'NEJM' },
    { titulo: 'FDA aprova novo antidepressivo de ação rápida', resumo: 'Medicamento com mecanismo glutamatérgico mostra resposta em 24-48h, revolucionando tratamento de depressão resistente.', fonte: 'FDA News' },
    { titulo: 'Atualização ATLS 11ª edição', resumo: 'Novas recomendações para manejo de trauma torácico e uso de ácido tranexâmico em politraumatizados.', fonte: 'ACS' }
  ],
  curiosidades: [
    { titulo: 'O coração bate 100.000 vezes por dia', conteudo: 'Em média, o coração humano bombeia cerca de 7.500 litros de sangue diariamente, percorrendo aproximadamente 96.000 km de vasos sanguíneos.' },
    { titulo: 'O fígado pode se regenerar', conteudo: 'O fígado é o único órgão interno capaz de se regenerar completamente. Mesmo com apenas 25% funcional, pode voltar ao tamanho original.' },
    { titulo: 'Primeira cirurgia com anestesia: 1846', conteudo: 'William Morton realizou a primeira demonstração pública de cirurgia sob anestesia com éter em Boston, marcando o início da era da anestesiologia.' }
  ],
  agenda: [
    { evento: 'Congresso Brasileiro de Medicina de Emergência', data: '12 a 15 de março de 2025', local: 'São Paulo - SP', link: '#' },
    { evento: 'Jornada Acadêmica de Clínica Médica', data: '20 de fevereiro de 2025', local: 'Online', link: '#' },
    { evento: 'Simpósio Internacional de Cardiologia', data: '08 de abril de 2025', local: 'Rio de Janeiro - RJ', link: '#' },
    { evento: 'Workshop de Ultrassom Point-of-Care', data: '25 de fevereiro de 2025', local: 'Belo Horizonte - MG', link: '#' }
  ],
  coluna_estudos: [
    { titulo: 'Resumo: Manejo da Sepse 2024', resumo: 'Bundle de 1 hora, antibioticoterapia empírica e ressuscitação volêmica guiada por metas.', tipo: 'Resumo' },
    { titulo: 'Mapa Mental: Arritmias Cardíacas', resumo: 'Fluxograma visual para identificação e conduta nas principais arritmias na emergência.', tipo: 'Mapa Mental' },
    { titulo: 'Revisão Rápida: Cetoacidose Diabética', resumo: 'Critérios diagnósticos, protocolo de hidratação e insulinoterapia em 10 passos.', tipo: 'Revisão' }
  ],
  status: 'publicado'
};

export default function Jornal() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState('capa');
  const [modoNoturno, setModoNoturno] = useState(false);
  const [edicaoAtual, setEdicaoAtual] = useState(edicaoExemplo);

  const { data: edicoes = [] } = useQuery({
    queryKey: ['jornal-edicoes'],
    queryFn: () => base44.entities.JornalEdicao.filter({ status: 'publicado' }, '-numero_edicao', 10),
    initialData: []
  });

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const bgClass = modoNoturno ? 'bg-stone-900' : 'bg-amber-50';
  const textClass = modoNoturno ? 'text-stone-200' : 'text-stone-800';
  const paperClass = modoNoturno ? 'bg-stone-800 border-stone-700' : 'bg-amber-50 border-stone-300';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Controles */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-amber-100" />
              </div>
              <span className={`text-sm font-medium ${textClass}`}>Modo Jornal</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setModoNoturno(!modoNoturno)}>
                <Moon className="w-3 h-3" /> {modoNoturno ? 'Dia' : 'Noite'}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Archive className="w-3 h-3" /> Edições Anteriores
              </Button>
            </div>
          </div>

          {/* JORNAL - Design de Papel */}
          <div className={`max-w-4xl mx-auto ${paperClass} border-2 shadow-2xl`} style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
            
            {/* CABEÇALHO DO JORNAL */}
            <div className={`border-b-4 border-double ${modoNoturno ? 'border-stone-600' : 'border-stone-800'} p-4 text-center`}>
              <div className="flex justify-between items-center text-[10px] mb-2">
                <span className={textClass}>Sua fonte de conhecimento médico</span>
                <span className={textClass}>Atualizado semanalmente</span>
              </div>
              
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${textClass}`} style={{ fontFamily: "'Old Standard TT', Georgia, serif" }}>
                SUPMED JORNAL
              </h1>
              
              <div className={`flex justify-center items-center gap-4 mt-2 text-xs ${textClass}`}>
                <span>Edição #{edicaoAtual.numero_edicao}</span>
                <span>•</span>
                <span>Semana: {formatarData(edicaoAtual.data_inicio)} a {formatarData(edicaoAtual.data_fim)}</span>
              </div>
              
              <div className={`border-t border-b ${modoNoturno ? 'border-stone-600' : 'border-stone-400'} mt-3 py-1`}>
                <p className={`text-[10px] italic ${modoNoturno ? 'text-stone-400' : 'text-stone-600'}`}>
                  "Informação que salva vidas, conhecimento que transforma carreiras"
                </p>
              </div>
            </div>

            {/* NAVEGAÇÃO */}
            <div className={`flex border-b ${modoNoturno ? 'border-stone-700' : 'border-stone-300'}`}>
              {[
                { id: 'capa', label: 'Capa' },
                { id: 'atualizacoes', label: 'Atualizações' },
                { id: 'curiosidades', label: 'Curiosidades' },
                { id: 'agenda', label: 'Agenda' },
                { id: 'estudos', label: 'Estudos' }
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSecaoAtiva(sec.id)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    secaoAtiva === sec.id 
                      ? (modoNoturno ? 'bg-stone-700 text-amber-200' : 'bg-stone-800 text-amber-50')
                      : (modoNoturno ? 'text-stone-300 hover:bg-stone-700' : 'text-stone-700 hover:bg-stone-100')
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* CONTEÚDO */}
            <div className="p-6">
              
              {/* CAPA */}
              {secaoAtiva === 'capa' && (
                <div className="space-y-6">
                  {/* Manchete Principal */}
                  <div className={`border-b-2 ${modoNoturno ? 'border-stone-600' : 'border-stone-400'} pb-4`}>
                    <h2 className={`text-2xl font-bold ${textClass} mb-2`}>
                      {edicaoAtual.atualizacoes_semana[0]?.titulo}
                    </h2>
                    <p className={`text-sm leading-relaxed ${modoNoturno ? 'text-stone-300' : 'text-stone-600'}`}>
                      {edicaoAtual.atualizacoes_semana[0]?.resumo}
                    </p>
                    <span className={`text-[10px] ${modoNoturno ? 'text-stone-500' : 'text-stone-400'}`}>
                      Fonte: {edicaoAtual.atualizacoes_semana[0]?.fonte}
                    </span>
                  </div>

                  {/* Grid de Seções */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Atualizações */}
                    <div className={`border-r md:pr-6 ${modoNoturno ? 'border-stone-700' : 'border-stone-300'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className={`w-4 h-4 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${textClass}`}>
                          Atualizações da Semana
                        </h3>
                      </div>
                      <p className={`text-xs mb-3 ${modoNoturno ? 'text-stone-400' : 'text-stone-600'}`}>
                        Resumo dos estudos mais recentes, alterações em guidelines e avanços terapêuticos.
                      </p>
                      <button 
                        onClick={() => setSecaoAtiva('atualizacoes')}
                        className={`text-xs font-medium flex items-center gap-1 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`}
                      >
                        Ler seção completa <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Curiosidades */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className={`w-4 h-4 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${textClass}`}>
                          Curiosidades Médicas
                        </h3>
                      </div>
                      <p className={`text-xs mb-3 ${modoNoturno ? 'text-stone-400' : 'text-stone-600'}`}>
                        Fatos curiosos, descobertas históricas e peculiaridades sobre o corpo humano.
                      </p>
                      <button 
                        onClick={() => setSecaoAtiva('curiosidades')}
                        className={`text-xs font-medium flex items-center gap-1 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`}
                      >
                        Ler seção completa <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Agenda */}
                    <div className={`border-r md:pr-6 ${modoNoturno ? 'border-stone-700' : 'border-stone-300'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className={`w-4 h-4 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${textClass}`}>
                          Agenda Acadêmica
                        </h3>
                      </div>
                      <p className={`text-xs mb-3 ${modoNoturno ? 'text-stone-400' : 'text-stone-600'}`}>
                        Congressos, simpósios, jornadas acadêmicas e eventos médicos.
                      </p>
                      <button 
                        onClick={() => setSecaoAtiva('agenda')}
                        className={`text-xs font-medium flex items-center gap-1 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`}
                      >
                        Ver agenda <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Estudos */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className={`w-4 h-4 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${textClass}`}>
                          Coluna de Estudos
                        </h3>
                      </div>
                      <p className={`text-xs mb-3 ${modoNoturno ? 'text-stone-400' : 'text-stone-600'}`}>
                        Resumos de artigos, revisões rápidas e mapas mentais para estudo contínuo.
                      </p>
                      <button 
                        onClick={() => setSecaoAtiva('estudos')}
                        className={`text-xs font-medium flex items-center gap-1 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`}
                      >
                        Acessar coluna <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ATUALIZAÇÕES */}
              {secaoAtiva === 'atualizacoes' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className={`w-5 h-5 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                    <h2 className={`text-xl font-bold ${textClass}`}>Atualizações Médicas da Semana</h2>
                  </div>
                  <div className="space-y-4">
                    {edicaoAtual.atualizacoes_semana.map((item, i) => (
                      <div key={i} className={`border-b pb-4 ${modoNoturno ? 'border-stone-700' : 'border-stone-200'}`}>
                        <h3 className={`text-sm font-bold ${textClass} mb-1`}>• {item.titulo}</h3>
                        <p className={`text-xs leading-relaxed ${modoNoturno ? 'text-stone-300' : 'text-stone-600'}`}>
                          {item.resumo}
                        </p>
                        <span className={`text-[10px] italic ${modoNoturno ? 'text-stone-500' : 'text-stone-400'}`}>
                          Fonte: {item.fonte}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CURIOSIDADES */}
              {secaoAtiva === 'curiosidades' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className={`w-5 h-5 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                    <h2 className={`text-xl font-bold ${textClass}`}>Curiosidades do Mundo Médico</h2>
                  </div>
                  <div className="space-y-4">
                    {edicaoAtual.curiosidades.map((item, i) => (
                      <div key={i} className={`p-4 ${modoNoturno ? 'bg-stone-700/50' : 'bg-amber-100/50'} rounded`}>
                        <h3 className={`text-sm font-bold ${textClass} mb-2`}>💡 {item.titulo}</h3>
                        <p className={`text-xs leading-relaxed ${modoNoturno ? 'text-stone-300' : 'text-stone-600'}`}>
                          {item.conteudo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AGENDA */}
              {secaoAtiva === 'agenda' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className={`w-5 h-5 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                    <h2 className={`text-xl font-bold ${textClass}`}>Agenda Acadêmica e Eventos</h2>
                  </div>
                  <div className="space-y-3">
                    {edicaoAtual.agenda.map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 border ${modoNoturno ? 'border-stone-700 bg-stone-700/30' : 'border-stone-200 bg-white/50'} rounded`}>
                        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${modoNoturno ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                          <Calendar className={`w-5 h-5 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-sm font-bold ${textClass}`}>{item.evento}</h3>
                          <p className={`text-xs ${modoNoturno ? 'text-stone-400' : 'text-stone-500'}`}>
                            📅 {item.data} • 📍 {item.local}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ESTUDOS */}
              {secaoAtiva === 'estudos' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className={`w-5 h-5 ${modoNoturno ? 'text-amber-400' : 'text-amber-700'}`} />
                    <h2 className={`text-xl font-bold ${textClass}`}>Coluna de Estudos</h2>
                  </div>
                  <div className="space-y-3">
                    {edicaoAtual.coluna_estudos.map((item, i) => (
                      <div key={i} className={`p-4 border ${modoNoturno ? 'border-stone-700' : 'border-stone-200'} rounded`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className={`text-[9px] mb-2 ${modoNoturno ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'}`}>
                              {item.tipo}
                            </Badge>
                            <h3 className={`text-sm font-bold ${textClass}`}>{item.titulo}</h3>
                            <p className={`text-xs mt-1 ${modoNoturno ? 'text-stone-400' : 'text-stone-600'}`}>
                              {item.resumo}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Star className={`w-4 h-4 ${modoNoturno ? 'text-stone-500' : 'text-stone-400'}`} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ */}
            <div className={`border-t-2 ${modoNoturno ? 'border-stone-600' : 'border-stone-400'} p-4 text-center`}>
              <div className="flex justify-center gap-4 mb-2">
                <Button variant="ghost" size="sm" className={`h-7 text-xs ${textClass}`}>
                  <Star className="w-3 h-3 mr-1" /> Salvar
                </Button>
                <Button variant="ghost" size="sm" className={`h-7 text-xs ${textClass}`}>
                  <Share2 className="w-3 h-3 mr-1" /> Compartilhar
                </Button>
              </div>
              <p className={`text-[10px] ${modoNoturno ? 'text-stone-500' : 'text-stone-400'}`}>
                SUPMED Jornal © 2025 • Todos os direitos reservados
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}