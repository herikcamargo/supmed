import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import StatusEditorial from './StatusEditorial';

export default function AprovacaoCorpoClinico({ conteudo, onChange, isCorpoClinico, currentUser }) {
  const [motivo, setMotivo] = useState(conteudo.motivo_ajustes || '');
  
  if (!isCorpoClinico) return null;

  const handleAprovar = () => {
    onChange({
      ...conteudo,
      status_editorial: 'aprovado',
      publicado: true,
      revisor_id: currentUser.email,
      data_revisao: new Date().toISOString()
    });
  };

  const handleSolicitarAjustes = () => {
    if (!motivo.trim()) {
      alert('Por favor, descreva os ajustes necessários');
      return;
    }
    onChange({
      ...conteudo,
      status_editorial: 'ajustes_solicitados',
      publicado: false,
      motivo_ajustes: motivo,
      revisor_id: currentUser.email,
      data_revisao: new Date().toISOString()
    });
  };

  const handleReprovar = () => {
    if (!motivo.trim()) {
      alert('Por favor, descreva o motivo da reprovação');
      return;
    }
    onChange({
      ...conteudo,
      status_editorial: 'reprovado',
      publicado: false,
      motivo_ajustes: motivo,
      revisor_id: currentUser.email,
      data_revisao: new Date().toISOString()
    });
  };

  const handleDespublicar = () => {
    onChange({
      ...conteudo,
      publicado: false
    });
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-700" />
          <h3 className="text-sm font-semibold text-blue-900">Painel do Corpo Clínico</h3>
        </div>

        <div className="space-y-3">
          {/* Status Atual */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-slate-600 mb-2">Status Editorial Atual:</p>
            <StatusEditorial 
              status={conteudo.status_editorial || 'pendente_revisao'} 
              publicado={conteudo.publicado}
              size="default"
            />
            
            {conteudo.autor_id && (
              <p className="text-xs text-slate-500 mt-2">
                Autor: <strong>{conteudo.autor_id}</strong>
              </p>
            )}
            
            {conteudo.revisor_id && (
              <p className="text-xs text-slate-500">
                Revisado por: <strong>{conteudo.revisor_id}</strong> em{' '}
                {new Date(conteudo.data_revisao).toLocaleDateString('pt-BR')}
              </p>
            )}

            {conteudo.motivo_ajustes && (
              <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-1">Motivo dos ajustes:</p>
                <p className="text-xs text-amber-700">{conteudo.motivo_ajustes}</p>
              </div>
            )}
          </div>

          {/* Campo para justificativa */}
          {conteudo.status_editorial !== 'aprovado' && (
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Justificativa / Ajustes Solicitados
              </label>
              <Textarea
                placeholder="Descreva os ajustes necessários ou motivo da reprovação..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          {/* Ações do Corpo Clínico */}
          <div className="flex flex-wrap gap-2">
            {conteudo.status_editorial !== 'aprovado' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                  onClick={handleAprovar}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Aprovar e Publicar
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 h-8 text-xs"
                  onClick={handleSolicitarAjustes}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Solicitar Ajustes
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 h-8 text-xs"
                  onClick={handleReprovar}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reprovar
                </Button>
              </>
            )}

            {conteudo.publicado && (
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 h-8 text-xs"
                onClick={handleDespublicar}
              >
                Despublicar
              </Button>
            )}
          </div>

          <div className="bg-blue-100 rounded p-2 text-xs text-blue-800">
            <strong>⚠️ Regra Editorial:</strong> Apenas o corpo clínico pode aprovar e publicar conteúdo.
            O autor não pode aprovar seu próprio trabalho.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}