import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

/**
 * Componente de revisão administrativa
 * VISÍVEL APENAS PARA ADMIN
 */
export default function RevisaoAdmin({ afeccao, onChange, isAdmin }) {
  if (!isAdmin) return null;

  const updateField = (field, value) => {
    onChange({ ...afeccao, [field]: value });
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
          <Shield className="w-4 h-4" />
          Controle de Revisão (Admin Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-purple-100/50 border border-purple-200 rounded-lg p-2">
          <p className="text-[10px] text-purple-800 font-medium">
            ⚠️ Informações desta seção NÃO aparecem para o usuário final
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Autor Original
              </label>
              <Input
                value={afeccao.autor_id || 'Não definido'}
                disabled
                className="h-9 text-sm bg-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Revisor/Aprovador
              </label>
              <Input
                value={afeccao.revisor_id || 'Aguardando aprovação'}
                disabled
                className="h-9 text-sm bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Data da Revisão
            </label>
            <Input
              value={afeccao.data_revisao ? new Date(afeccao.data_revisao).toLocaleString('pt-BR') : 'Não revisado'}
              disabled
              className="h-9 text-sm bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Data da Revisão
          </label>
          <Input
            type="date"
            value={afeccao.data_revisao ? new Date(afeccao.data_revisao).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              if (e.target.value) {
                updateField('data_revisao', new Date(e.target.value).toISOString());
              }
            }}
            className="h-9 text-sm"
          />
        </div>

        {afeccao.status === 'publicado' && afeccao.revisor_id && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-800">✅ Conteúdo Publicado</p>
              <p className="text-[10px] text-green-700">
                Aprovado por {afeccao.revisor_id} • {afeccao.data_revisao ? new Date(afeccao.data_revisao).toLocaleDateString('pt-BR') : ''}
              </p>
            </div>
          </div>
        )}

        {afeccao.status === 'em_revisao' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-800">⏳ Aguardando Aprovação Admin</p>
              <p className="text-[10px] text-amber-700">
                Apenas administradores podem publicar este conteúdo
              </p>
            </div>
          </div>
        )}

        {afeccao.autor_id === afeccao.revisor_id && afeccao.status === 'publicado' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-800">⚠️ Alerta: Autor = Aprovador</p>
              <p className="text-[10px] text-red-700">
                Isso não deveria acontecer. Conteúdo precisa ser revisado por outra pessoa.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}