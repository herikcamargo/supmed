import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  FileText, 
  User, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function GuidelineVersionHistory({ guideline, onClose }) {
  // Histórico de versões simulado
  const versoes = guideline?.changelog || [
    {
      versao: '2.0',
      data: '2024-12-01',
      alteracoes: 'Atualização completa baseada em novo consenso; Revisão de doses de medicamentos; Novos critérios diagnósticos',
      autor: 'Dr. Sistema Automático',
      status: 'atual'
    },
    {
      versao: '1.5',
      data: '2024-06-15',
      alteracoes: 'Correção de doses pediátricas; Adição de contraindicações',
      autor: 'Dra. Ana Santos',
      status: 'arquivado'
    },
    {
      versao: '1.4',
      data: '2024-01-10',
      alteracoes: 'Inclusão de novos medicamentos na lista; Atualização de fluxogramas',
      autor: 'Dr. Carlos Lima',
      status: 'arquivado'
    },
    {
      versao: '1.0',
      data: '2023-03-01',
      alteracoes: 'Versão inicial do guideline',
      autor: 'Equipe SUPMED',
      status: 'arquivado'
    }
  ];

  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Histórico de Versões</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          )}
        </div>

        {/* Info do Guideline */}
        <div className="p-3 bg-slate-50 rounded-lg mb-4">
          <h4 className="text-xs font-medium text-slate-800">{guideline?.titulo || 'Guideline'}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[9px]">{guideline?.fonte || 'Fonte'}</Badge>
            <span className="text-[10px] text-slate-500">
              Versão atual: {guideline?.versao || versoes[0]?.versao}
            </span>
          </div>
        </div>

        {/* Timeline de versões */}
        <div className="relative">
          {versoes.map((versao, index) => (
            <div key={versao.versao} className="relative pl-6 pb-4">
              {/* Linha vertical */}
              {index < versoes.length - 1 && (
                <div className="absolute left-2 top-4 bottom-0 w-0.5 bg-slate-200" />
              )}
              
              {/* Ponto */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-green-500' : 'bg-slate-300'
              }`}>
                {index === 0 ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                ) : (
                  <Clock className="w-2 h-2 text-white" />
                )}
              </div>

              {/* Conteúdo */}
              <div className={`p-3 rounded-lg border ${
                index === 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] ${index === 0 ? 'bg-green-500' : 'bg-slate-400'}`}>
                      v{versao.versao}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline" className="text-[8px] text-green-600 border-green-300">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(versao.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-[10px] text-slate-600 mb-2">
                    {versao.alteracoes.split(';').map((alt, i) => (
                      <span key={i} className="block">
                        <ArrowRight className="w-2.5 h-2.5 inline mr-1 text-slate-400" />
                        {alt.trim()}
                      </span>
                    ))}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <User className="w-3 h-3" />
                    {versao.autor}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info de auditoria */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h5 className="text-[10px] font-semibold text-blue-800 mb-1">Informações de Auditoria</h5>
          <div className="grid grid-cols-2 gap-2 text-[9px] text-blue-700">
            <div>
              <span className="text-blue-500">Fonte oficial:</span>
              <span className="ml-1">{guideline?.url_fonte || 'N/A'}</span>
            </div>
            <div>
              <span className="text-blue-500">Nível evidência:</span>
              <span className="ml-1">{guideline?.nivel_evidencia || 'A'}</span>
            </div>
            <div>
              <span className="text-blue-500">Última revisão:</span>
              <span className="ml-1">{guideline?.data_ultima_revisao || new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-blue-500">Aprovado por:</span>
              <span className="ml-1">{guideline?.revisor_aprovador || 'Sistema'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}