import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from '@/utils';
import BlocoRastreabilidade from '../editorial/BlocoRastreabilidade';
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  FileText,
  Zap,
  ExternalLink,
  Shield,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Activity,
  Pill,
  Calculator
} from 'lucide-react';

const nivelComplexidade = {
  basico: { label: 'Básico', color: 'bg-green-100 text-green-700', icon: '🟢' },
  intermediario: { label: 'Intermediário', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  avancado: { label: 'Avançado', color: 'bg-orange-100 text-orange-700', icon: '🟠' },
  especialista: { label: 'Especialista', color: 'bg-red-100 text-red-700', icon: '🔴' }
};

export default function ProcedimentoViewer({ procedimento, onBack, contextoRetorno }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [conteudoEditorial, setConteudoEditorial] = useState(null);
  
  const procData = procedimento.data || procedimento;
  const nivel = nivelComplexidade[procData.nivel_complexidade] || nivelComplexidade.intermediario;
  const totalSteps = procData.passos?.length || 0;

  useEffect(() => {
    // Carregar usuário atual
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) setCurrentUser(JSON.parse(stored));

    // Buscar conteúdo editorial associado
    const loadEditorialData = async () => {
      try {
        const conteudos = await base44.entities.ConteudoEditorial.filter({
          tipo_modulo: 'procedimento',
          titulo: procData.nome
        });
        if (conteudos.length > 0) {
          setConteudoEditorial(conteudos[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados editoriais:', error);
      }
    };

    if (procData.nome) {
      loadEditorialData();
    }
  }, [procData.nome]);

  return (
    <div className="p-4 md:p-6">
      {/* Back Button com contexto */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (contextoRetorno?.origem === 'plantonista' && contextoRetorno?.afeccao) {
            window.location.href = createPageUrl('Plantonista') + 
              `?retorno_afeccao=${encodeURIComponent(contextoRetorno.afeccao)}`;
          } else {
            onBack();
          }
        }}
        className={`mb-4 text-xs h-7 ${
          contextoRetorno?.origem === 'plantonista' 
            ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' 
            : ''
        }`}
      >
        <ArrowLeft className="w-3 h-3 mr-1" /> 
        {contextoRetorno?.origem === 'plantonista' && contextoRetorno?.afeccao
          ? `Voltar para ${contextoRetorno.afeccao}`
          : 'Voltar'}
      </Button>

      {/* Aviso Legal Fixo */}
      <Card className="bg-amber-50 border-amber-200 mb-4">
        <CardContent className="p-2 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <p className="text-[9px] text-amber-700">
            <strong>Aviso:</strong> Este conteúdo é educacional. Execute apenas se capacitado e treinado.
          </p>
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-800 mb-2">{procData.nome}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge className={nivel.color}>
                  {nivel.icon} {nivel.label}
                </Badge>
                {procData.tempo_medio && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />{procData.tempo_medio}
                  </Badge>
                )}
                {procData.ambiente && (
                  <Badge variant="outline" className="text-xs">
                    {procData.ambiente}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Integrações Clínicas - Navegação Contextual */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {procData.afeccao_relacionada && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
                onClick={() => {
                  window.location.href = createPageUrl('Plantonista') + 
                    `?retorno_afeccao=${encodeURIComponent(procData.afeccao_relacionada)}`;
                }}
              >
                <BookOpen className="w-3 h-3 mr-1" /> Ver Afecção: {procData.afeccao_relacionada}
              </Button>
            )}
            {procData.calculadoras_relacionadas?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {procData.calculadoras_relacionadas.map((calcId, idx) => (
                  <Button 
                    key={idx}
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                    onClick={() => {
                      window.location.href = createPageUrl('Calculadoras') + 
                        `?score=${calcId}&origem=procedimento&procedimento=${encodeURIComponent(procData.nome)}`;
                    }}
                  >
                    <Calculator className="w-3 h-3 mr-1" /> Calcular {calcId.toUpperCase()}
                  </Button>
                ))}
              </div>
            )}
            {procData.medicacoes_relacionadas?.length > 0 && (
              <Link to={createPageUrl('Plantonista') + '?tab=diluicao'}>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <Pill className="w-3 h-3 mr-1" /> Diluição de Drogas
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="passos" className="space-y-4">
        <TabsList className="bg-white/80 border border-slate-200/50 h-9">
          <TabsTrigger value="passos" className="text-xs">Passo a Passo</TabsTrigger>
          <TabsTrigger value="preparacao" className="text-xs">Preparação</TabsTrigger>
          <TabsTrigger value="complicacoes" className="text-xs">Complicações</TabsTrigger>
          <TabsTrigger value="detalhes" className="text-xs">Detalhes</TabsTrigger>
        </TabsList>

        {/* Passo a Passo Interativo */}
        <TabsContent value="passos">
          {totalSteps > 0 ? (
            <>
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      Etapa {currentStep + 1} de {totalSteps}
                    </Badge>
                    {procData.passos[currentStep]?.critico && (
                      <Badge className="bg-red-100 text-red-700 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Passo Crítico
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-800 mb-2">
                    {procData.passos[currentStep]?.titulo}
                  </h3>
                  
                  <p className="text-sm text-slate-700 mb-3">
                    {procData.passos[currentStep]?.descricao}
                  </p>

                  {procData.passos[currentStep]?.imagem_url && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-3 flex items-center justify-center min-h-[200px]">
                      <p className="text-xs text-slate-400">Imagem ilustrativa</p>
                    </div>
                  )}

                  {procData.passos[currentStep]?.tempo_estimado && (
                    <p className="text-xs text-slate-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Tempo estimado: {procData.passos[currentStep].tempo_estimado}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Navegação entre passos */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>

                <div className="flex gap-1">
                  {procData.passos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStep 
                          ? 'bg-blue-600 w-6' 
                          : idx < currentStep 
                          ? 'bg-green-500' 
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant={currentStep === totalSteps - 1 ? 'default' : 'outline'}
                  disabled={currentStep === totalSteps - 1}
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className={currentStep === totalSteps - 1 ? 'bg-green-600 h-9' : 'h-9'}
                >
                  {currentStep === totalSteps - 1 ? (
                    <>Concluído <CheckCircle2 className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Próximo <ChevronRight className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </div>

              {/* Alertas para o passo atual */}
              {procData.alertas?.filter(a => 
                a.mensagem.toLowerCase().includes(procData.passos[currentStep]?.titulo?.toLowerCase() || '')
              ).length > 0 && (
                <Card className="bg-amber-50 border-amber-200 mt-3">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Pontos de Atenção
                    </p>
                    <ul className="space-y-1">
                      {procData.alertas
                        .filter(a => a.mensagem.toLowerCase().includes(procData.passos[currentStep]?.titulo?.toLowerCase() || ''))
                        .map((alert, idx) => (
                          <li key={idx} className="text-xs text-amber-700">• {alert.mensagem}</li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-500">Nenhum passo cadastrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Preparação */}
        <TabsContent value="preparacao">
          <div className="space-y-3">
            {/* Indicações */}
            {procData.indicacoes?.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Indicações
                  </h3>
                  <ul className="space-y-1">
                    {procData.indicacoes.map((ind, idx) => (
                      <li key={idx} className="text-xs text-slate-700">• {ind}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Contraindicações */}
            {procData.contraindicacoes?.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-red-700 uppercase mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Contraindicações
                  </h3>
                  <ul className="space-y-1">
                    {procData.contraindicacoes.map((contra, idx) => (
                      <li key={idx} className="text-xs text-red-800">• {contra}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Material */}
            {procData.materiais?.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-blue-600" /> Material Necessário
                  </h3>
                  <div className="grid md:grid-cols-2 gap-1">
                    {procData.materiais.map((mat, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs">
                        <span className={mat.essencial ? 'text-red-600' : 'text-slate-600'}>
                          {mat.essencial ? '●' : '○'}
                        </span>
                        <span className="text-slate-700">{mat.item}</span>
                        {mat.quantidade && <span className="text-slate-500">({mat.quantidade})</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-red-600 mt-2">● Itens essenciais</p>
                </CardContent>
              </Card>
            )}

            {/* Preparação */}
            {procData.preparacao?.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Preparação do Paciente</h3>
                  <ol className="space-y-1">
                    {procData.preparacao.map((prep, idx) => (
                      <li key={idx} className="text-xs text-slate-700">{idx + 1}. {prep}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Complicações */}
        <TabsContent value="complicacoes">
          <div className="space-y-3">
            {/* Complicações */}
            {procData.complicacoes?.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" /> Complicações Possíveis
                  </h3>
                  <div className="space-y-2">
                    {procData.complicacoes.map((comp, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-slate-800">{comp.nome}</p>
                          <Badge variant="outline" className="text-[9px] h-4">{comp.frequencia}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-600">{comp.conduta}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pós-procedimento */}
            {procData.pos_procedimento?.length > 0 && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-emerald-700 uppercase mb-2">Pós-Procedimento</h3>
                  <ul className="space-y-1">
                    {procData.pos_procedimento.map((pos, idx) => (
                      <li key={idx} className="text-xs text-emerald-800">• {pos}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Quando chamar ajuda */}
            {procData.quando_chamar_ajuda?.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-red-700 uppercase mb-2 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Quando Chamar Especialista
                  </h3>
                  <ul className="space-y-1">
                    {procData.quando_chamar_ajuda.map((ajuda, idx) => (
                      <li key={idx} className="text-xs text-red-800">• {ajuda}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Alertas gerais */}
            {procData.alertas?.length > 0 && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Pontos de Atenção e Erros Comuns
                  </h3>
                  <div className="space-y-1.5">
                    {procData.alertas.map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[8px] h-4 flex-shrink-0">
                          {alert.tipo === 'erro_comum' ? 'Erro Comum' : 
                           alert.tipo === 'dica_tecnica' ? 'Dica' : 'Atenção'}
                        </Badge>
                        <p className="text-xs text-amber-800">{alert.mensagem}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Detalhes */}
        <TabsContent value="detalhes">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {procData.perfil_habilitado?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Perfis Habilitados</h3>
                    <div className="flex flex-wrap gap-1">
                      {procData.perfil_habilitado.map((perfil, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px]">{perfil}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {procData.fontes?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Fontes</h3>
                    <ul className="space-y-0.5">
                      {procData.fontes.map((fonte, idx) => (
                        <li key={idx} className="text-[10px] text-slate-600">• {fonte}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {procData.revisado_por && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 uppercase mb-1">Revisão Clínica</h3>
                    <p className="text-xs text-slate-700">{procData.revisado_por}</p>
                    {procData.data_revisao && (
                      <p className="text-[10px] text-slate-500">
                        Última revisão: {new Date(procData.data_revisao).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bloco de Rastreabilidade Editorial */}
      {conteudoEditorial && (
        <BlocoRastreabilidade 
          conteudo={conteudoEditorial} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
}