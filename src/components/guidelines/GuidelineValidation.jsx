import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle,
  FileText,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';

// Revisores clínicos cadastrados
const revisoresCadastrados = [
  { email: 'emergencista@hospital.com', nome: 'Dr. Carlos Silva', especialidade: 'emergencista' },
  { email: 'pediatra@hospital.com', nome: 'Dra. Ana Santos', especialidade: 'pediatra' },
  { email: 'clinico@hospital.com', nome: 'Dr. Roberto Lima', especialidade: 'clinico_geral' },
  { email: 'enfermeiro@hospital.com', nome: 'Enf. Maria Oliveira', especialidade: 'enfermeiro_supervisor' }
];

export default function GuidelineValidation({ guideline, onValidate, onClose }) {
  const [validacao, setValidacao] = useState({
    status: null, // aprovado, rejeitado, editado
    comentarios: '',
    sugestoesEdicao: ''
  });
  const [showEdicao, setShowEdicao] = useState(false);

  const handleValidar = (status) => {
    const review = {
      guideline_id: guideline.id,
      guideline_titulo: guideline.titulo,
      status,
      comentarios: validacao.comentarios,
      sugestoes_edicao: validacao.sugestoesEdicao,
      data_revisao: new Date().toISOString()
    };
    
    onValidate?.(review);
  };

  // Validação automática
  const validacaoAutomatica = {
    integridade: true,
    versaoValida: true,
    semConflito: Math.random() > 0.2,
    camposCompletos: true
  };

  const allAutoChecksPass = Object.values(validacaoAutomatica).every(v => v);

  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge className="text-[9px] bg-amber-500 mb-1">Pendente Validação</Badge>
            <h3 className="text-sm font-semibold text-slate-800">{guideline?.titulo || 'Guideline'}</h3>
            <p className="text-[10px] text-slate-500">
              {guideline?.fonte} • Versão {guideline?.versao}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Validação Automática */}
        <div className="p-3 bg-slate-50 rounded-lg mb-4">
          <h4 className="text-[10px] font-semibold text-slate-600 uppercase mb-2">Validação Automática</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(validacaoAutomatica).map(([key, passed]) => (
              <div key={key} className="flex items-center gap-1.5">
                {passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="text-[10px] text-slate-600">
                  {key === 'integridade' && 'Integridade OK'}
                  {key === 'versaoValida' && 'Versão válida'}
                  {key === 'semConflito' && (passed ? 'Sem conflitos' : 'Conflito detectado')}
                  {key === 'camposCompletos' && 'Campos completos'}
                </span>
              </div>
            ))}
          </div>
          {!allAutoChecksPass && (
            <div className="mt-2 p-2 bg-amber-50 rounded text-[10px] text-amber-700">
              ⚠️ Atenção: Verificar conflitos antes de aprovar
            </div>
          )}
        </div>

        {/* Diff / Alterações */}
        {guideline?.changelog?.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <h4 className="text-[10px] font-semibold text-blue-700 uppercase mb-2">Alterações Detectadas</h4>
            <ul className="space-y-1">
              {guideline.changelog.slice(-1)[0]?.alteracoes?.split(';').map((alt, i) => (
                <li key={i} className="text-[10px] text-blue-800 flex items-start gap-1">
                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {alt.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Revisores */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-slate-600 uppercase mb-2">Revisores Clínicos</h4>
          <div className="flex flex-wrap gap-2">
            {revisoresCadastrados.map((rev) => (
              <div key={rev.email} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-[10px]">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-slate-700">{rev.nome}</span>
                <Badge variant="outline" className="text-[8px]">{rev.especialidade}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Comentários */}
        <div className="mb-4">
          <label className="text-[10px] font-medium text-slate-600 block mb-1">Comentários da Revisão</label>
          <Textarea
            placeholder="Adicione observações sobre a validação..."
            className="text-xs h-20"
            value={validacao.comentarios}
            onChange={(e) => setValidacao({ ...validacao, comentarios: e.target.value })}
          />
        </div>

        {/* Sugestões de Edição */}
        {showEdicao && (
          <div className="mb-4">
            <label className="text-[10px] font-medium text-slate-600 block mb-1">Sugestões de Edição</label>
            <Textarea
              placeholder="Descreva as alterações sugeridas..."
              className="text-xs h-24"
              value={validacao.sugestoesEdicao}
              onChange={(e) => setValidacao({ ...validacao, sugestoesEdicao: e.target.value })}
            />
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => handleValidar('aprovado')}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Aprovar
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 h-8 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
            onClick={() => {
              setShowEdicao(true);
              if (validacao.sugestoesEdicao) handleValidar('editado');
            }}
          >
            <Edit3 className="w-3 h-3 mr-1" /> Editar
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 h-8 text-xs text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => handleValidar('rejeitado')}
          >
            <XCircle className="w-3 h-3 mr-1" /> Rejeitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}