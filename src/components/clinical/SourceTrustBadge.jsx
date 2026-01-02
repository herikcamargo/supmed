import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  ExternalLink,
  Clock,
  User,
  AlertTriangle,
  BookOpen,
  FileText
} from 'lucide-react';

// Trust Score Colors
const getTrustColor = (score) => {
  if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-700', icon: ShieldCheck };
  if (score >= 70) return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Shield };
  if (score >= 50) return { bg: 'bg-amber-100', text: 'text-amber-700', icon: ShieldAlert };
  return { bg: 'bg-red-100', text: 'text-red-700', icon: ShieldX };
};

// Nível de Evidência
const nivelEvidenciaLabels = {
  'A': { label: 'Nível A - Diretriz/Consenso', color: 'bg-green-600' },
  'B': { label: 'Nível B - Meta-análise', color: 'bg-blue-600' },
  'C': { label: 'Nível C - Estudo RCT', color: 'bg-cyan-600' },
  'D': { label: 'Nível D - Observacional', color: 'bg-amber-600' },
  'P': { label: 'Provisório - Preprint', color: 'bg-red-600' }
};

// Força de Recomendação
const forcaRecomendacaoLabels = {
  'I': 'Classe I - Recomendado',
  'IIa': 'Classe IIa - Razoável',
  'IIb': 'Classe IIb - Pode ser considerado',
  'III': 'Classe III - Não recomendado'
};

export function TrustScoreBadge({ score, size = 'sm' }) {
  const { bg, text, icon: Icon } = getTrustColor(score);
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${bg}`}>
      <Icon className={`w-3 h-3 ${text}`} />
      <span className={`text-[10px] font-medium ${text}`}>
        {score}/100
      </span>
    </div>
  );
}

export function EvidenceLevelBadge({ level }) {
  const config = nivelEvidenciaLabels[level] || nivelEvidenciaLabels['D'];
  
  return (
    <Badge className={`text-[9px] ${config.color} text-white`}>
      {config.label}
    </Badge>
  );
}

export function SourceInfoBar({ 
  fonte, 
  versao, 
  nivel_evidencia, 
  trust_score, 
  revisor, 
  data_revisao,
  url_fonte,
  is_provisorio 
}) {
  const trustConfig = getTrustColor(trust_score);
  const TrustIcon = trustConfig.icon;

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
      {/* Alerta Provisório */}
      {is_provisorio && (
        <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs text-red-700 font-medium">
            CONTEÚDO PROVISÓRIO — Baseado em preprint não validado. Não aplicar automaticamente em condutas.
          </span>
        </div>
      )}

      {/* Badges principais */}
      <div className="flex flex-wrap items-center gap-2">
        {fonte && (
          <Badge variant="outline" className="text-[10px] gap-1">
            <BookOpen className="w-3 h-3" /> {fonte}
          </Badge>
        )}
        {versao && (
          <Badge variant="outline" className="text-[10px]">
            v{versao}
          </Badge>
        )}
        {nivel_evidencia && (
          <EvidenceLevelBadge level={nivel_evidencia} />
        )}
        {trust_score !== undefined && (
          <TrustScoreBadge score={trust_score} />
        )}
      </div>

      {/* Revisor e Data */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-3">
          {revisor && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> Aprovado por {revisor}
            </span>
          )}
          {data_revisao && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(data_revisao).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
        {url_fonte && (
          <a 
            href={url_fonte} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> Ver fonte original
          </a>
        )}
      </div>
    </div>
  );
}

export function SourceTypeIcon({ tipo }) {
  const icons = {
    sociedade: '🏛️',
    livro: '📚',
    atlas: '🗺️',
    plataforma: '💻',
    journal: '📰',
    guideline: '📋',
    preprint: '⚠️'
  };
  return <span>{icons[tipo] || '📄'}</span>;
}

export default { TrustScoreBadge, EvidenceLevelBadge, SourceInfoBar, SourceTypeIcon };