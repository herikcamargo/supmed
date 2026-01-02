import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { isDemoMode, getAutoUser } from '../auth/DevConfig';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit2,
  AlertTriangle,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import StatusEditorial from './StatusEditorial';
import VisualizadorConteudo from './VisualizadorConteudo';

export default function PainelValidacao({ currentUser: userProp, onRetornoEdicao }) {
  const currentUser = isDemoMode() ? getAutoUser() : userProp;
  
  const [conteudoSelecionado, setConteudoSelecionado] = useState(null);
  const [justificativa, setJustificativa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('pendente_revisao');
  const [tipoConteudo, setTipoConteudo] = useState('todos');
  const queryClient = useQueryClient();

  // Buscar conteúdos pendentes de TODAS as entidades (incluindo pré-existentes)
  const { data: conteudosPendentes = [], isLoading } = useQuery({
    queryKey: ['validacao-corpo-clinico', filtroStatus, tipoConteudo],
    queryFn: async () => {
      const filtro = filtroStatus === 'todos' ? {} : { status_editorial: filtroStatus };
      
      let resultados = [];
      
      if (tipoConteudo === 'todos' || tipoConteudo === 'afeccoes') {
        // Buscar AfeccaoEditorial + ConteudoClinico (afecções legadas)
        const [afeccoesEdit, afeccoesLegado] = await Promise.all([
          base44.entities.AfeccaoEditorial.filter(filtro),
          base44.entities.ConteudoClinico.list()
        ]);
        
        // Normalizar ConteudoClinico para formato editorial
        const legadoNormalizado = afeccoesLegado
          .filter(c => !filtro.status_editorial || (c.status_editorial || 'pendente_revisao') === filtro.status_editorial)
          .map(c => ({
            ...c,
            nome_afeccao: c.titulo,
            especialidade: c.categoria,
            definicao: c.conteudo?.definicao || '',
            status_editorial: c.status_editorial || 'pendente_revisao',
            publicado: c.publicado || false,
            _tipo: 'afeccao',
            _origem: 'legado'
          }));
        
        resultados.push(...afeccoesEdit.map(a => ({ ...a, _tipo: 'afeccao' })));
        resultados.push(...legadoNormalizado);
      }
      
      if (tipoConteudo === 'todos' || tipoConteudo === 'semiologia') {
        const semiologias = await base44.entities.Semiologia.list();
        const filtradas = semiologias.filter(s => 
          !filtro.status_editorial || (s.status_editorial || 'pendente_revisao') === filtro.status_editorial
        );
        resultados.push(...filtradas.map(s => ({ ...s, _tipo: 'semiologia', status_editorial: s.status_editorial || 'pendente_revisao' })));
      }
      
      if (tipoConteudo === 'todos' || tipoConteudo === 'procedimentos') {
        const procedimentos = await base44.entities.Procedimento.list();
        const filtrados = procedimentos.filter(p => 
          !filtro.status_editorial || (p.status_editorial || 'pendente_revisao') === filtro.status_editorial
        );
        resultados.push(...filtrados.map(p => ({ ...p, _tipo: 'procedimento', status_editorial: p.status_editorial || 'pendente_revisao' })));
      }
      
      if (tipoConteudo === 'todos' || tipoConteudo === 'calculadoras') {
        const calculadoras = await base44.entities.ConteudoEditorial.list();
        const filtradas = calculadoras
          .filter(c => c.tipo_modulo === 'calculadora')
          .filter(c => !filtro.status_editorial || (c.status_editorial || 'pendente_revisao') === filtro.status_editorial);
        resultados.push(...filtradas.map(c => ({ ...c, _tipo: 'calculadora', status_editorial: c.status_editorial || 'pendente_revisao' })));
      }
      
      if (tipoConteudo === 'todos' || tipoConteudo === 'escalas') {
        const escalas = await base44.entities.ConteudoEditorial.list();
        const filtradas = escalas
          .filter(e => e.tipo_modulo === 'escala')
          .filter(e => !filtro.status_editorial || (e.status_editorial || 'pendente_revisao') === filtro.status_editorial);
        resultados.push(...filtradas.map(e => ({ ...e, _tipo: 'escala', status_editorial: e.status_editorial || 'pendente_revisao' })));
      }
      
      if (tipoConteudo === 'todos' || tipoConteudo === 'protocolos') {
        const protocolos = await base44.entities.ConteudoEditorial.list();
        const filtrados = protocolos
          .filter(p => p.tipo_modulo === 'protocolo')
          .filter(p => !filtro.status_editorial || (p.status_editorial || 'pendente_revisao') === filtro.status_editorial);
        resultados.push(...filtrados.map(p => ({ ...p, _tipo: 'protocolo', status_editorial: p.status_editorial || 'pendente_revisao' })));
      }
      
      return resultados.sort(
        (a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date)
      );
    }
  });

  const aprovarMutation = useMutation({
    mutationFn: async ({ conteudo, acao }) => {
      console.log('🔵 AÇÃO EDITORIAL:', acao, 'Conteúdo ID:', conteudo.id);
      
      const updates = {
        status_editorial: acao,
        revisor_id: currentUser.email,
        data_revisao: new Date().toISOString()
      };

      if (acao === 'aprovado') {
        updates.publicado = true;
        updates.data_publicacao = new Date().toISOString();
        console.log('✅ Aprovando e publicando conteúdo');
      } else if (acao === 'ajustes_solicitados') {
        updates.motivo_ajustes = justificativa;
        updates.publicado = false;
        console.log('📝 Solicitando ajustes:', justificativa);
      } else if (acao === 'reprovado') {
        updates.motivo_ajustes = justificativa;
        updates.publicado = false;
        console.log('❌ Reprovando conteúdo:', justificativa);
      }

      // Detectar entidade correta
      let entidade = 'AfeccaoEditorial';
      if (conteudo.nome_topico) entidade = 'Semiologia';
      else if (conteudo.passos && conteudo.categoria) entidade = 'Procedimento';
      else if (conteudo.tipo_modulo) entidade = 'ConteudoEditorial';
      
      console.log('📦 Atualizando entidade:', entidade, 'com dados:', updates);
      const result = await base44.entities[entidade].update(conteudo.id, updates);
      console.log('✅ Conteúdo atualizado no banco:', result);
      
      return { result, acao, conteudo };
    },
    onSuccess: (data) => {
      console.log('✅ Ação editorial concluída com sucesso:', data);
      
      // CRÍTICO: Invalidar queries para atualizar a lista imediatamente
      queryClient.invalidateQueries({ queryKey: ['validacao-corpo-clinico'] });
      queryClient.invalidateQueries({ queryKey: ['conteudo-editorial'] });
      
      // Forçar refetch imediato
      queryClient.refetchQueries({ queryKey: ['validacao-corpo-clinico'] });
      
      if (data.acao === 'aprovado') {
        toast.success('✓ Conteúdo aprovado e publicado! Removido da fila de pendentes.', {
          duration: 5000,
          position: 'top-center'
        });
      } else if (data.acao === 'ajustes_solicitados') {
        toast.success('📝 Ajustes solicitados. Conteúdo movido para "Ajustes Solicitados".', {
          duration: 5000,
          position: 'top-center'
        });
      } else if (data.acao === 'reprovado') {
        toast.warning('❌ Conteúdo reprovado e movido para "Reprovados".', {
          duration: 5000,
          position: 'top-center'
        });
      }
      
      // Limpar seleção
      setConteudoSelecionado(null);
      setJustificativa('');
    },
    onError: (error) => {
      console.error('❌ Erro ao processar validação:', error);
      toast.error('❌ Erro ao processar validação: ' + error.message, {
        duration: 8000
      });
    }
  });

  const despublicarMutation = useMutation({
    mutationFn: async (conteudo) => {
      console.log('🔵 Despublicando conteúdo ID:', conteudo.id);
      
      // Detectar entidade correta
      let entidade = 'AfeccaoEditorial';
      if (conteudo.nome_topico) entidade = 'Semiologia';
      else if (conteudo.passos && conteudo.categoria) entidade = 'Procedimento';
      else if (conteudo.tipo_modulo) entidade = 'ConteudoEditorial';
      
      const updates = {
        publicado: false,
        status_editorial: 'ajustes_solicitados',
        motivo_ajustes: justificativa || 'Despublicado pelo corpo clínico para revisão'
      };
      
      console.log('📦 Despublicando entidade:', entidade, 'com dados:', updates);
      const result = await base44.entities[entidade].update(conteudo.id, updates);
      console.log('✅ Conteúdo despublicado no banco:', result);
      
      return result;
    },
    onSuccess: () => {
      console.log('✅ Despublicação concluída');
      
      // CRÍTICO: Invalidar e refetch imediato
      queryClient.invalidateQueries({ queryKey: ['validacao-corpo-clinico'] });
      queryClient.invalidateQueries({ queryKey: ['conteudo-editorial'] });
      queryClient.refetchQueries({ queryKey: ['validacao-corpo-clinico'] });
      
      toast.success('Conteúdo despublicado e movido para "Ajustes Solicitados"', {
        duration: 5000
      });
      setConteudoSelecionado(null);
      setJustificativa('');
    },
    onError: (error) => {
      console.error('❌ Erro ao despublicar:', error);
      toast.error('❌ Erro ao despublicar: ' + error.message);
    }
  });

  const handleAcao = (acao) => {
    if ((acao === 'ajustes_solicitados' || acao === 'reprovado') && !justificativa) {
      toast.error('Justificativa obrigatória para esta ação');
      return;
    }
    aprovarMutation.mutate({ conteudo: conteudoSelecionado, acao });
  };

  return (
    <div className="space-y-4">
      {/* Tabs por Tipo de Conteúdo */}
      <Tabs value={tipoConteudo} onValueChange={setTipoConteudo}>
        <TabsList className="grid w-full grid-cols-7 mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="afeccoes">Afecções</TabsTrigger>
          <TabsTrigger value="semiologia">Semiologia</TabsTrigger>
          <TabsTrigger value="procedimentos">Procedimentos</TabsTrigger>
          <TabsTrigger value="calculadoras">Calculadoras</TabsTrigger>
          <TabsTrigger value="escalas">Escalas</TabsTrigger>
          <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filtros de Status */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroStatus === 'pendente_revisao' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('pendente_revisao')}
              className={filtroStatus === 'pendente_revisao' ? 'bg-amber-600' : ''}
            >
              <Clock className="w-3 h-3 mr-1" />
              Pendente
            </Button>
            <Button
              variant={filtroStatus === 'ajustes_solicitados' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('ajustes_solicitados')}
              className={filtroStatus === 'ajustes_solicitados' ? 'bg-orange-600' : ''}
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Ajustes Solicitados
            </Button>
            <Button
              variant={filtroStatus === 'aprovado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('aprovado')}
              className={filtroStatus === 'aprovado' ? 'bg-green-600' : ''}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Aprovado
            </Button>
            <Button
              variant={filtroStatus === 'reprovado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('reprovado')}
              className={filtroStatus === 'reprovado' ? 'bg-red-600' : ''}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reprovado
            </Button>
            <Button
              variant={filtroStatus === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroStatus('todos')}
            >
              Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            Carregando conteúdos para validação...
          </CardContent>
        </Card>
      ) : conteudosPendentes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600">Nenhum conteúdo {filtroStatus !== 'todos' && `com status "${filtroStatus}"`}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conteudosPendentes.map((conteudo) => (
            <Card 
              key={conteudo.id} 
              className={`border-2 ${
                conteudoSelecionado?.id === conteudo.id 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-slate-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-800">
                        {conteudo.nome_afeccao || conteudo.nome_topico || conteudo.nome || conteudo.titulo}
                      </h3>
                      <StatusEditorial 
                        status={conteudo.status_editorial} 
                        publicado={conteudo.publicado}
                      />
                      <Badge variant="outline" className="text-xs capitalize bg-blue-50">
                        {conteudo._tipo}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>Autor: <strong>{conteudo.autor_id || conteudo.created_by || 'Sistema'}</strong></span>
                      <span>•</span>
                      <span>{new Date(conteudo.created_date).toLocaleDateString('pt-BR')}</span>
                      {(conteudo.especialidade || conteudo.categoria) && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{(conteudo.especialidade || conteudo.categoria)?.replace(/_/g, ' ')}</span>
                        </>
                      )}
                    </div>
                    
                    {conteudo.motivo_ajustes && (
                      <div className="bg-amber-50 border border-amber-200 p-2 rounded mt-2">
                        <p className="text-xs text-amber-800">
                          <strong>Ajustes solicitados:</strong> {conteudo.motivo_ajustes}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConteudoSelecionado(
                      conteudoSelecionado?.id === conteudo.id ? null : conteudo
                    )}
                  >
                    {conteudoSelecionado?.id === conteudo.id ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Visualização Completa do Conteúdo */}
                {conteudoSelecionado?.id === conteudo.id && (
                  <div className="mt-4 pt-4 border-t">
                    <VisualizadorConteudo conteudo={conteudo} />
                  </div>
                )}

                {/* Ações de Validação */}
                {conteudoSelecionado?.id === conteudo.id && (
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <Textarea
                      placeholder="Justificativa (opcional para aprovação, obrigatória para ajustes/reprovação)"
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      {conteudo.status_editorial !== 'aprovado' && (
                        <Button
                          onClick={() => handleAcao('aprovado')}
                          disabled={aprovarMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar e Publicar
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleAcao('ajustes_solicitados')}
                        disabled={aprovarMutation.isPending}
                        variant="outline"
                        className="border-orange-500 text-orange-700 hover:bg-orange-50"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Solicitar Ajustes
                      </Button>
                      
                      <Button
                        onClick={() => handleAcao('reprovado')}
                        disabled={aprovarMutation.isPending}
                        variant="outline"
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reprovar
                      </Button>

                      {conteudo.publicado && (
                        <Button
                          onClick={() => {
                            if (confirm('Deseja despublicar este conteúdo?')) {
                              despublicarMutation.mutate(conteudo);
                            }
                          }}
                          disabled={despublicarMutation.isPending}
                          variant="outline"
                          className="border-slate-400 text-slate-700 hover:bg-slate-50"
                        >
                          <EyeOff className="w-4 h-4 mr-2" />
                          Despublicar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}