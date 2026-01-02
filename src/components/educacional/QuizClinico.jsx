import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BookOpen,
  Lightbulb,
  RotateCcw,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function QuizClinico({ userEmail }) {
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todas');
  const [filtroDificuldade, setFiltroDificuldade] = useState('todas');
  const [questaoAtual, setQuestaoAtual] = useState(null);
  const [respostaSelecionada, setRespostaSelecionada] = useState('');
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [tempoInicio, setTempoInicio] = useState(null);
  const [pontuacaoSessao, setPontuacaoSessao] = useState(0);
  const [sequenciaAcertos, setSequenciaAcertos] = useState(0);

  const queryClient = useQueryClient();

  // Carregar questões
  const { data: questoes = [], isLoading } = useQuery({
    queryKey: ['edu_questoes', filtroEspecialidade, filtroDificuldade],
    queryFn: async () => {
      let filter = {};
      if (filtroEspecialidade !== 'todas') filter.especialidade = filtroEspecialidade;
      if (filtroDificuldade !== 'todas') filter.dificuldade = filtroDificuldade;
      
      const result = await base44.entities.EduQuestao.filter(filter);
      return result.length > 0 ? result : [];
    }
  });

  // Salvar histórico
  const salvarHistoricoMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.EduHistorico.create(data);
    }
  });

  // Atualizar pontuação
  const atualizarPontuacaoMutation = useMutation({
    mutationFn: async (pontos) => {
      const result = await base44.entities.EduPontuacao.filter({ usuario_email: userEmail });
      if (result.length > 0) {
        const atual = result[0];
        await base44.entities.EduPontuacao.update(atual.id, {
          pontos_totais: atual.pontos_totais + pontos,
          quizzes_respondidos: atual.quizzes_respondidos + 1,
          acertos_total: atual.acertos_total + (pontos > 0 ? 1 : 0),
          erros_total: atual.erros_total + (pontos === 0 ? 1 : 0),
          nivel: Math.floor((atual.pontos_totais + pontos) / 100) + 1,
          ultimo_acesso: new Date().toISOString().split('T')[0]
        });
      } else {
        await base44.entities.EduPontuacao.create({
          usuario_email: userEmail,
          pontos_totais: pontos,
          quizzes_respondidos: 1,
          acertos_total: pontos > 0 ? 1 : 0,
          erros_total: pontos === 0 ? 1 : 0,
          nivel: 1,
          streak_dias: 1,
          ultimo_acesso: new Date().toISOString().split('T')[0]
        });
      }
      queryClient.invalidateQueries(['edu_pontuacao']);
    }
  });

  const iniciarQuestao = () => {
    if (questoes.length === 0) {
      toast.error('Nenhuma questão disponível para os filtros selecionados');
      return;
    }
    const random = questoes[Math.floor(Math.random() * questoes.length)];
    setQuestaoAtual(random);
    setRespostaSelecionada('');
    setMostrarResposta(false);
    setTempoInicio(Date.now());
  };

  const verificarResposta = () => {
    if (!respostaSelecionada) {
      toast.error('Selecione uma alternativa');
      return;
    }

    const acertou = respostaSelecionada === questaoAtual.resposta_correta;
    const tempoResposta = Math.floor((Date.now() - tempoInicio) / 1000);
    
    let pontos = 0;
    if (acertou) {
      pontos = 10;
      if (questaoAtual.dificuldade === 'medio') pontos = 15;
      if (questaoAtual.dificuldade === 'dificil') pontos = 25;
      if (tempoResposta < 60) pontos += 5; // Bônus velocidade
      pontos += sequenciaAcertos * 2; // Bônus sequência
      
      setSequenciaAcertos(sequenciaAcertos + 1);
      toast.success(`Correto! +${pontos} pontos`);
    } else {
      setSequenciaAcertos(0);
      toast.error('Resposta incorreta');
    }

    setPontuacaoSessao(pontuacaoSessao + pontos);
    setMostrarResposta(true);

    // Salvar histórico
    salvarHistoricoMutation.mutate({
      usuario_email: userEmail,
      tipo: 'quiz',
      item_id: questaoAtual.id,
      acertou,
      tempo_resposta: tempoResposta,
      pontos_ganhos: pontos
    });

    // Atualizar pontuação global
    atualizarPontuacaoMutation.mutate(pontos);
  };

  useEffect(() => {
    if (questoes.length > 0 && !questaoAtual) {
      iniciarQuestao();
    }
  }, [questoes]);

  const dificuldadeColors = {
    facil: 'bg-green-100 text-green-700',
    medio: 'bg-yellow-100 text-yellow-700',
    dificil: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Quiz Clínico</p>
                <p className="text-xs text-slate-500">Pontos da sessão: {pontuacaoSessao}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-700 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Sequência: {sequenciaAcertos}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Especialidades</SelectItem>
                <SelectItem value="cardiologia">Cardiologia</SelectItem>
                <SelectItem value="emergencia">Emergência</SelectItem>
                <SelectItem value="neurologia">Neurologia</SelectItem>
                <SelectItem value="pediatria">Pediatria</SelectItem>
                <SelectItem value="ginecologia">Ginecologia</SelectItem>
                <SelectItem value="infectologia">Infectologia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroDificuldade} onValueChange={setFiltroDificuldade}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Dificuldades</SelectItem>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questão */}
      {isLoading ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-slate-500">Carregando questões...</p>
          </CardContent>
        </Card>
      ) : !questaoAtual ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Nenhuma questão encontrada para os filtros selecionados</p>
            <Button size="sm" onClick={() => { setFiltroEspecialidade('todas'); setFiltroDificuldade('todas'); }}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[8px]">{questaoAtual.especialidade}</Badge>
                <Badge className={`text-[8px] ${dificuldadeColors[questaoAtual.dificuldade]}`}>
                  {questaoAtual.dificuldade}
                </Badge>
              </div>
              {questaoAtual.tempo_sugerido && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {questaoAtual.tempo_sugerido}s
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {questaoAtual.pergunta}
              </p>
            </div>

            {!mostrarResposta ? (
              <>
                <RadioGroup value={respostaSelecionada} onValueChange={setRespostaSelecionada}>
                  <div className="space-y-2">
                    {questaoAtual.alternativas?.map((alt) => (
                      <div key={alt.letra} className="flex items-start gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 transition-colors">
                        <RadioGroupItem value={alt.letra} id={alt.letra} />
                        <Label htmlFor={alt.letra} className="text-xs cursor-pointer flex-1">
                          <strong>{alt.letra})</strong> {alt.texto}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <Button 
                  className="w-full h-9 text-xs bg-purple-600 hover:bg-purple-700"
                  onClick={verificarResposta}
                  disabled={!respostaSelecionada}
                >
                  Verificar Resposta
                </Button>
              </>
            ) : (
              <>
                {/* Resposta Correta */}
                <div className={`p-3 rounded-lg border-2 ${respostaSelecionada === questaoAtual.resposta_correta ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {respostaSelecionada === questaoAtual.resposta_correta ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-800 mb-1">
                        Resposta correta: {questaoAtual.resposta_correta})
                      </p>
                      <p className="text-xs text-slate-700">
                        {questaoAtual.alternativas.find(a => a.letra === questaoAtual.resposta_correta)?.texto}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explicação */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-800 mb-1">Explicação:</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{questaoAtual.explicacao}</p>
                    </div>
                  </div>
                </div>

                {/* Referência */}
                {questaoAtual.referencia && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-600">
                        <strong>Referência:</strong> {questaoAtual.referencia}
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-9 text-xs"
                  onClick={iniciarQuestao}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Próxima Questão
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}