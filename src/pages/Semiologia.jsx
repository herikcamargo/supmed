import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BlocoRastreabilidade from '../components/editorial/BlocoRastreabilidade';
import { 
  Search,
  ChevronLeft,
  Stethoscope,
  Eye,
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const SISTEMAS = [
  { id: 'geral', nome: 'Semiologia Geral', icon: Stethoscope, color: 'bg-slate-500' },
  { id: 'cardiologia', nome: 'Cardiovascular', icon: Activity, color: 'bg-red-500' },
  { id: 'pneumologia', nome: 'Respiratório', icon: Activity, color: 'bg-blue-500' },
  { id: 'neurologia', nome: 'Neurológico', icon: Activity, color: 'bg-purple-500' },
  { id: 'gastroenterologia', nome: 'Gastroenterológico', icon: Activity, color: 'bg-amber-500' },
  { id: 'musculoesqueletico', nome: 'Musculoesquelético', icon: Activity, color: 'bg-green-500' },
  { id: 'psiquiatria', nome: 'Psiquiátrico', icon: Activity, color: 'bg-indigo-500' },
  { id: 'pediatria', nome: 'Pediátrico', icon: Activity, color: 'bg-pink-500' },
  { id: 'ginecologia', nome: 'Ginecológico', icon: Activity, color: 'bg-fuchsia-500' },
  { id: 'dermatologia', nome: 'Dermatológico', icon: Activity, color: 'bg-orange-500' },
  { id: 'oftalmologia', nome: 'Oftalmológico', icon: Eye, color: 'bg-cyan-500' },
  { id: 'otorrinolaringologia', nome: 'Otorrinolaringológico', icon: Activity, color: 'bg-teal-500' }
];

export default function Semiologia() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sistemaSelecionado, setSistemaSelecionado] = useState(null);
  const [topicoSelecionado, setTopicoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const { data: topicos = [], isLoading } = useQuery({
    queryKey: ['semiologia-topicos'],
    queryFn: async () => {
      // Apenas conteúdos APROVADOS e PUBLICADOS
      const result = await base44.entities.Semiologia.filter({ 
        status_editorial: 'aprovado',
        publicado: true
      });
      return result;
    }
  });

  const topicosFiltrados = topicos.filter(t => {
    if (sistemaSelecionado && t.sistema_dominio !== sistemaSelecionado) return false;
    if (busca && !t.nome_topico.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`flex-1 overflow-y-auto transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {(sistemaSelecionado || topicoSelecionado) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (topicoSelecionado) {
                      setTopicoSelecionado(null);
                    } else {
                      setSistemaSelecionado(null);
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Semiologia Médica</h1>
                <p className="text-sm text-slate-500">Exame clínico estruturado por sistema</p>
              </div>
            </div>

            {!topicoSelecionado && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar tópico de semiologia..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          {!sistemaSelecionado && !topicoSelecionado && (
            <div className="grid md:grid-cols-3 gap-4">
              {SISTEMAS.map(sistema => (
                <Card 
                  key={sistema.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSistemaSelecionado(sistema.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${sistema.color} flex items-center justify-center`}>
                        <sistema.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{sistema.nome}</h3>
                        <p className="text-xs text-slate-500">
                          {topicos.filter(t => t.sistema_dominio === sistema.id).length} tópicos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {sistemaSelecionado && !topicoSelecionado && (
            <div className="space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-slate-500">
                    Carregando...
                  </CardContent>
                </Card>
              ) : topicosFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum tópico publicado neste sistema ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                topicosFiltrados.map(topico => (
                  <Card 
                    key={topico.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setTopicoSelecionado(topico)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-800 mb-1">
                            {topico.nome_topico}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {topico.objetivo_clinico}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              v{topico.versao}
                            </Badge>
                            {topico.red_flags_semiologicas?.length > 0 && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Red Flags
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {topicoSelecionado && (
            <VisualizarTopico topico={topicoSelecionado} currentUser={currentUser} />
          )}
        </div>
      </main>
    </div>
  );
}

function VisualizarTopico({ topico, currentUser }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{topico.nome_topico}</CardTitle>
              <p className="text-sm text-slate-500 mt-1 capitalize">
                {topico.sistema_dominio?.replace(/_/g, ' ')}
              </p>
            </div>
            <Badge variant="outline">v{topico.versao}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objetivo */}
          {topico.objetivo_clinico && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Objetivo Clínico
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {topico.objetivo_clinico}
              </p>
            </div>
          )}

          {/* Fundamentos */}
          {topico.fundamentos_fisiopatologicos && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Fundamentos Fisiopatológicos</h3>
              <p className="text-sm text-slate-600">{topico.fundamentos_fisiopatologicos}</p>
            </div>
          )}

          {/* Anamnese Dirigida */}
          {topico.anamnese_dirigida?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Anamnese Dirigida</h3>
              <ul className="space-y-1">
                {topico.anamnese_dirigida.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sinais e Sintomas */}
          {topico.sinais_sintomas_relevantes?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Sinais e Sintomas Relevantes</h3>
              <div className="flex flex-wrap gap-2">
                {topico.sinais_sintomas_relevantes.map((item, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Exame Físico */}
          {topico.exame_fisico_passos?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Exame Físico Passo a Passo</h3>
              <div className="space-y-3">
                {topico.exame_fisico_passos.map((passo, i) => (
                  <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {passo.ordem || i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-slate-800 mb-1">{passo.passo}</h4>
                        <p className="text-xs text-slate-600">{passo.tecnica}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achados Normais */}
          {topico.achados_normais?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Achados Normais</h3>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <ul className="space-y-1">
                  {topico.achados_normais.map((item, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Achados Patológicos */}
          {topico.achados_patologicos?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Achados Patológicos</h3>
              <div className="space-y-2">
                {topico.achados_patologicos.map((item, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <h4 className="font-medium text-sm text-amber-900 mb-1">{item.achado}</h4>
                    <p className="text-xs text-amber-700">{item.interpretacao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {topico.red_flags_semiologicas?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Red Flags Semiológicas
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="space-y-1">
                  {topico.red_flags_semiologicas.map((item, i) => (
                    <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quando Avançar Investigação */}
          {topico.quando_avancar_investigacao?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Quando Avançar Investigação</h3>
              <ul className="space-y-1">
                {topico.quando_avancar_investigacao.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aplicação Prática */}
          {topico.aplicacao_pratica && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Aplicação Prática no PA e APS</h3>
              <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                {topico.aplicacao_pratica}
              </p>
            </div>
          )}

          {/* Afecções Relacionadas */}
          {topico.afeccoes_relacionadas?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Afecções Clínicas Relacionadas</h3>
              <div className="flex flex-wrap gap-2">
                {topico.afeccoes_relacionadas.map((slug, i) => (
                  <Link key={i} to={createPageUrl('Plantonista', { slug })}>
                    <Badge className="bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200">
                      {slug.replace(/-/g, ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Referências */}
          {topico.referencias_utilizadas?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Referências</h3>
              <div className="space-y-1">
                {topico.referencias_utilizadas.map((ref, i) => (
                  <p key={i} className="text-xs text-slate-600">
                    {i + 1}. {ref.referencia_completa}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Aviso:</strong> {topico.disclaimer}
            </p>
          </div>

          {/* Bloco de Rastreabilidade Editorial */}
          <BlocoRastreabilidade 
            conteudo={topico} 
            currentUser={currentUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}