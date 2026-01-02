import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, CheckCircle, Calendar } from 'lucide-react';

export default function BlocoRastreabilidade({ conteudo, currentUser }) {
  // Apenas visível para admin e corpo clínico
  const isAdmin = currentUser?.role === 'admin';
  const isCorpoClinico = currentUser?.papel_editorial === 'corpo_clinico';
  
  if (!isAdmin && !isCorpoClinico) {
    return null;
  }

  return (
    <Card className="border-2 border-indigo-200 bg-indigo-50/30 mt-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-indigo-700" />
          <h3 className="text-sm font-semibold text-indigo-900">
            Informações Editoriais (Admin/Corpo Clínico)
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Autor */}
          <div className="bg-white/50 p-3 rounded border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-slate-700">Autor</span>
            </div>
            <p className="text-slate-600">
              {conteudo.autor_id || conteudo.created_by || 'Sistema'}
            </p>
            {conteudo.created_date && (
              <p className="text-slate-500 text-[10px] mt-1">
                Criado em: {new Date(conteudo.created_date).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Revisor */}
          <div className="bg-white/50 p-3 rounded border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-slate-700">Revisor</span>
            </div>
            <p className="text-slate-600">
              {conteudo.revisor_id || 'Não revisado'}
            </p>
            {conteudo.data_revisao && (
              <p className="text-slate-500 text-[10px] mt-1">
                Revisado em: {new Date(conteudo.data_revisao).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Status Editorial */}
          <div className="bg-white/50 p-3 rounded border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-slate-700">Status Editorial</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] ${
                conteudo.status_editorial === 'aprovado' ? 'bg-green-50 text-green-700' :
                conteudo.status_editorial === 'pendente_revisao' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-50 text-slate-700'
              }`}>
                {conteudo.status_editorial || 'pendente_revisao'}
              </Badge>
              {conteudo.publicado && (
                <Badge className="bg-green-100 text-green-700 text-[10px]">
                  Publicado
                </Badge>
              )}
            </div>
          </div>

          {/* Versão */}
          <div className="bg-white/50 p-3 rounded border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-slate-700">Versão</span>
            </div>
            <p className="text-slate-600">
              v{conteudo.versao || '1.0'}
            </p>
            {conteudo.data_publicacao && (
              <p className="text-slate-500 text-[10px] mt-1">
                Publicado em: {new Date(conteudo.data_publicacao).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {conteudo.motivo_ajustes && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs font-semibold text-amber-800 mb-1">Observações:</p>
            <p className="text-xs text-amber-700">{conteudo.motivo_ajustes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}