import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  Clock,
  Stethoscope,
  MapPin
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const especialidadeIcons = {
  cardiologia: '❤️',
  emergencia: '🚨',
  clinica_medica: '🩺',
  neurologia: '🧠',
  pediatria: '👶',
  ginecologia: '🤰',
  exames_diagnostico: '🔬',
  infectologia: '🦠',
  cirurgia: '🔪',
  psiquiatria: '🧘',
  outros: '📋'
};

const ambienteLabels = {
  ubs: 'UBS',
  upa: 'UPA',
  hospital: 'Hospital',
  pronto_socorro: 'PS',
  ambulatorio: 'Ambulatório',
  uti: 'UTI'
};

export default function PostCard({ post, onClick }) {
  const tempoDecorrido = (data) => {
    const agora = new Date();
    const criado = new Date(data);
    const diff = Math.floor((agora - criado) / 1000 / 60);
    
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <Card 
      className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{especialidadeIcons[post.especialidade] || '📋'}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{post.titulo}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[8px]">{post.especialidade}</Badge>
                <Badge variant="outline" className="text-[8px]">
                  <MapPin className="w-2.5 h-2.5 mr-0.5" />
                  {ambienteLabels[post.ambiente]}
                </Badge>
                {post.afeccao && (
                  <Badge variant="outline" className="text-[8px]">{post.afeccao}</Badge>
                )}
              </div>
            </div>
          </div>
          
          {post.status === 'pendente' && (
            <Badge className="text-[8px] bg-amber-100 text-amber-700">Moderação</Badge>
          )}
        </div>

        {/* Conteúdo */}
        <p className="text-xs text-slate-600 line-clamp-3 mb-3">{post.conteudo}</p>

        {/* Pergunta */}
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 mb-3">
          <p className="text-xs text-blue-700">❓ {post.pergunta}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" /> {post.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {post.respostas_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {post.visualizacoes || 0}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {post.autor_profissao}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tempoDecorrido(post.created_date)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}