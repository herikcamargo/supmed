import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  MessageCircle, 
  ArrowLeft,
  Send,
  Star,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { analisarTexto } from './PrivacyFilter';

const modulosIntegrados = {
  'IAM': { modulo: 'Plantonista', query: 'IAM' },
  'AVC': { modulo: 'Plantonista', query: 'AVC' },
  'Sepse': { modulo: 'Plantonista', query: 'Sepse' },
  'TEP': { modulo: 'Plantonista', query: 'TEP' }
};

export default function PostViewer({ postId, onBack }) {
  const queryClient = useQueryClient();
  const [novaResposta, setNovaResposta] = useState('');
  const [avisoPrivacidade, setAvisoPrivacidade] = useState(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ['community_post', postId],
    queryFn: async () => {
      const posts = await base44.entities.CommunityPost.filter({ id: postId });
      if (posts.length > 0) {
        // Incrementar visualizações
        await base44.entities.CommunityPost.update(postId, {
          visualizacoes: (posts[0].visualizacoes || 0) + 1
        });
        return posts[0];
      }
      return null;
    }
  });

  const { data: respostas = [] } = useQuery({
    queryKey: ['community_replies', postId],
    queryFn: () => base44.entities.CommunityReply.filter({ post_id: postId }),
    initialData: []
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CommunityPost.update(postId, {
        likes: (post.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['community_post', postId]);
      toast.success('Marcado como útil!');
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (conteudo) => {
      const user = JSON.parse(localStorage.getItem('supmed_doctor') || '{}');
      
      await base44.entities.CommunityReply.create({
        post_id: postId,
        conteudo,
        autor_nome: user.full_name || user.fullName || 'Anônimo',
        autor_profissao: user.profissao || 'Profissional',
        status: 'ativo'
      });

      await base44.entities.CommunityPost.update(postId, {
        respostas_count: (post.respostas_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['community_replies', postId]);
      queryClient.invalidateQueries(['community_post', postId]);
      setNovaResposta('');
      toast.success('Resposta publicada!');
    }
  });

  const handleEnviarResposta = () => {
    if (!novaResposta.trim()) return;

    const analise = analisarTexto(novaResposta);
    if (!analise.seguro) {
      toast.error('Resposta bloqueada: dados identificáveis detectados');
      return;
    }

    if (analise.avisos.length > 0) {
      setAvisoPrivacidade(analise.avisos);
      setTimeout(() => setAvisoPrivacidade(null), 5000);
    }

    replyMutation.mutate(novaResposta);
  };

  if (isLoading) {
    return <div className="text-center p-6 text-sm text-slate-500">Carregando...</div>;
  }

  if (!post) {
    return <div className="text-center p-6 text-sm text-slate-500">Post não encontrado</div>;
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack} className="h-7 text-xs">
        <ArrowLeft className="w-3 h-3 mr-1" /> Voltar
      </Button>

      {/* Post Principal */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-800">{post.titulo}</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => likeMutation.mutate()}
              className="h-7 gap-1"
            >
              <ThumbsUp className="w-3 h-3" /> {post.likes || 0}
            </Button>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge>{post.especialidade}</Badge>
            <Badge variant="outline">{post.ambiente}</Badge>
            {post.afeccao && <Badge variant="outline">{post.afeccao}</Badge>}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.conteudo}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">❓ Pergunta:</p>
            <p className="text-sm text-blue-700">{post.pergunta}</p>
          </div>

          {post.evolucao && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-3">
              <p className="text-xs font-semibold text-emerald-900 mb-1">📊 Evolução:</p>
              <p className="text-sm text-emerald-700">{post.evolucao}</p>
            </div>
          )}

          {/* Links para Módulos Integrados */}
          {Object.entries(modulosIntegrados).map(([termo, info]) => {
            if (post.conteudo.includes(termo) || post.titulo.includes(termo)) {
              return (
                <Link key={termo} to={createPageUrl(info.modulo)} className="inline-block mr-2 mb-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <ExternalLink className="w-3 h-3" /> Ver {termo} no {info.modulo}
                  </Button>
                </Link>
              );
            }
            return null;
          })}

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t">
            <span>Por {post.autor_nome} ({post.autor_profissao})</span>
            <span>{new Date(post.created_date).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Respostas */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Respostas ({respostas.length})
          </h3>

          <div className="space-y-3 mb-4">
            {respostas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma resposta ainda. Seja o primeiro!</p>
            ) : (
              respostas.map(r => (
                <div key={r.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                  <p className="text-sm text-slate-700 mb-2">{r.conteudo}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{r.autor_nome} ({r.autor_profissao})</span>
                    <span>{new Date(r.created_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {r.esclarecedora && (
                    <Badge className="mt-2 text-[8px] bg-green-100 text-green-700">
                      <Star className="w-2.5 h-2.5 mr-0.5" /> Esclarecedora
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Nova Resposta */}
          <div className="space-y-2">
            {avisoPrivacidade && (
              <div className="p-2 bg-amber-50 rounded border border-amber-200 flex items-start gap-2">
                <Shield className="w-3 h-3 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-700">
                  {avisoPrivacidade.map((a, i) => (
                    <p key={i}>{a.mensagem}</p>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              placeholder="Compartilhe sua experiência clínica (sem dados identificáveis)..."
              className="text-sm h-24"
              value={novaResposta}
              onChange={(e) => setNovaResposta(e.target.value)}
            />
            <Button
              onClick={handleEnviarResposta}
              disabled={!novaResposta.trim() || replyMutation.isPending}
              className="w-full h-9 text-sm bg-blue-900 hover:bg-blue-800"
            >
              <Send className="w-3 h-3 mr-1" /> Enviar Resposta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}