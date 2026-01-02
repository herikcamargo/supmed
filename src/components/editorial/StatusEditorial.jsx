import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pendente_revisao: {
    label: 'Pendente de Revisão',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    desc: 'Aguardando análise do corpo clínico'
  },
  ajustes_solicitados: {
    label: 'Ajustes Solicitados',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    desc: 'Corpo clínico solicitou alterações'
  },
  aprovado: {
    label: 'Aprovado',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-300',
    desc: 'Aprovado pelo corpo clínico'
  },
  reprovado: {
    label: 'Reprovado',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-300',
    desc: 'Não aprovado pelo corpo clínico'
  }
};

export default function StatusEditorial({ status, publicado, size = 'default' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendente_revisao;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-[9px] h-4 px-1.5',
    default: 'text-xs h-5 px-2',
    lg: 'text-sm h-6 px-3'
  };

  return (
    <div className="flex items-center gap-1.5">
      <Badge className={`${config.color} ${sizeClasses[size]} border flex items-center gap-1`}>
        <Icon className="w-2.5 h-2.5" />
        {config.label}
      </Badge>
      {publicado && (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[9px] h-4 px-1.5">
          ✓ Publicado
        </Badge>
      )}
    </div>
  );
}

export { STATUS_CONFIG };