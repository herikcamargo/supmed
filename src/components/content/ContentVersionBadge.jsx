import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Badge que exibe informações de versão e atualização do conteúdo
 */
export default function ContentVersionBadge({ content, variant = 'compact' }) {
  if (!content) return null;

  const lastUpdate = content.ultima_atualizacao || content.data_atualizacao ? new Date(content.ultima_atualizacao || content.data_atualizacao) : null;
  const lastCheck = content.ultima_verificacao ? new Date(content.ultima_verificacao) : null;
  
  const daysSinceUpdate = lastUpdate ? Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const daysSinceCheck = lastCheck ? Math.floor((Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Status de atualização
  const updateStatus = {
    recent: daysSinceUpdate !== null && daysSinceUpdate < 30,
    moderate: daysSinceUpdate !== null && daysSinceUpdate >= 30 && daysSinceUpdate < 90,
    old: daysSinceUpdate !== null && daysSinceUpdate >= 90
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-[9px] bg-white/80 border-slate-200">
          <Info className="w-2.5 h-2.5 mr-1" />
          v{content.versao}
        </Badge>
        
        {lastUpdate && (
          <Badge 
            variant="outline" 
            className={`text-[9px] ${
              updateStatus.recent 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : updateStatus.moderate
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Clock className="w-2.5 h-2.5 mr-1" />
            {format(lastUpdate, "dd/MM/yyyy", { locale: ptBR })}
          </Badge>
        )}

        {(content.fonte_primaria || content.fonte) && (
          <Badge variant="outline" className="text-[9px] bg-blue-50 border-blue-200 text-blue-700">
            {content.fonte_primaria || content.fonte}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">Informações do Conteúdo</span>
          {updateStatus.recent && (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          )}
          {updateStatus.moderate && (
            <Clock className="w-4 h-4 text-amber-600" />
          )}
          {updateStatus.old && (
            <AlertCircle className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-slate-500">Versão:</span>
            <span className="ml-1 font-medium text-slate-700">v{content.versao}</span>
          </div>
          
          {lastUpdate && (
            <div>
              <span className="text-slate-500">Atualizado:</span>
              <span className="ml-1 font-medium text-slate-700">
                {format(lastUpdate, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          )}
          
          {(content.fonte_primaria || content.fonte) && (
            <div>
              <span className="text-slate-500">Fonte:</span>
              <span className="ml-1 font-medium text-slate-700">{content.fonte_primaria || content.fonte}</span>
            </div>
          )}
          
          {daysSinceCheck !== null && (
            <div>
              <span className="text-slate-500">Verificado há:</span>
              <span className="ml-1 font-medium text-slate-700">{daysSinceCheck}d</span>
            </div>
          )}
        </div>

        {updateStatus.old && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-[9px] text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Conteúdo com mais de 90 dias. Verificação agendada.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}