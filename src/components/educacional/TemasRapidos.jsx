import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, CheckCircle, ChevronRight } from 'lucide-react';

export default function TemasRapidos({ userEmail }) {
  const [temaSelecionado, setTemaSelecionado] = useState(null);

  const { data: temas = [] } = useQuery({
    queryKey: ['edu_temas_rapidos'],
    queryFn: () => base44.entities.EduTemaRapido.list()
  });

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Temas para Revisão Rápida</p>
              <p className="text-xs text-slate-500">Resumos de 2-3 minutos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {temas.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhum tema disponível</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {temas.map((tema) => (
            <Card 
              key={tema.id} 
              className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setTemaSelecionado(tema)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">{tema.titulo}</h3>
                    <div className="flex gap-1 mb-2">
                      <Badge variant="outline" className="text-[8px]">{tema.especialidade}</Badge>
                      <Badge className="text-[8px] bg-blue-50 text-blue-700 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {tema.tempo_estimado} min
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{tema.conteudo_resumido.substring(0, 100)}...</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {temaSelecionado && (
        <Dialog open={!!temaSelecionado} onOpenChange={() => setTemaSelecionado(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{temaSelecionado.titulo}</span>
                <Badge className="text-[8px]">{temaSelecionado.especialidade}</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700 whitespace-pre-line">{temaSelecionado.conteudo_resumido}</p>
              </div>

              {temaSelecionado.pontos_chave?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">Pontos-Chave</h4>
                  <ul className="space-y-1">
                    {temaSelecionado.pontos_chave.map((ponto, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {temaSelecionado.checklist?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">Checklist</h4>
                  <ul className="space-y-1">
                    {temaSelecionado.checklist.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {temaSelecionado.referencia && (
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-600">
                    <strong>Referência:</strong> {temaSelecionado.referencia}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}