import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Flag para controle futuro de imagens reais
const USE_REAL_IMAGES = false;

export default function IllustrativePathologyCard({ 
  titulo, 
  tipo, 
  modalidade,
  descricao,
  achados = [],
  image_placeholder,
  image_real = null,
  severity = 'medium'
}) {
  const [showDetail, setShowDetail] = useState(false);

  const imageSource = USE_REAL_IMAGES && image_real ? image_real : image_placeholder;

  const severityColors = {
    critical: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    medium: 'border-amber-300 bg-amber-50',
    low: 'border-blue-300 bg-blue-50'
  };

  return (
    <>
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all ${severityColors[severity]} border-2`}
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-3">
          {/* Imagem Ilustrativa */}
          <div className="relative mb-2 rounded-lg overflow-hidden bg-white border border-slate-200">
            <img 
              src={imageSource} 
              alt={`Ilustração: ${titulo}`}
              className="w-full h-32 object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-[9px] bg-white/90 backdrop-blur">
                {modalidade}
              </Badge>
            </div>
            {severity === 'critical' && (
              <div className="absolute top-2 left-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            )}
          </div>

          {/* Título */}
          <h4 className="text-xs font-semibold text-slate-800 mb-1">{titulo}</h4>
          
          {/* Disclaimer */}
          <div className="flex items-center gap-1 text-[9px] text-slate-500 italic">
            <Info className="w-2.5 h-2.5" />
            {tipo === 'ecg' ? 'Traçado ilustrativo' : 'Imagem ilustrativa'}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {titulo}
              <Badge variant="outline" className="text-xs">{modalidade}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Imagem Ampliada */}
            <div className="relative rounded-lg overflow-hidden bg-slate-50 border border-slate-200">
              <img 
                src={imageSource} 
                alt={`Ilustração ampliada: ${titulo}`}
                className="w-full h-64 object-contain"
              />
            </div>

            {/* Aviso Educacional Destacado */}
            <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <strong>Conteúdo educacional.</strong> {tipo === 'ecg' 
                    ? 'Traçado ilustrativo – não utilizar para diagnóstico.' 
                    : 'Imagem ilustrativa – conteúdo educacional.'}
                </div>
              </div>
            </div>

            {/* Descrição */}
            {descricao && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-700 font-medium mb-2">Descrição Educacional:</p>
                <p className="text-xs text-slate-600">{descricao}</p>
              </div>
            )}

            {/* Achados Chave */}
            {achados.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-2">Achados Típicos:</p>
                <ul className="space-y-1">
                  {achados.map((achado, i) => (
                    <li key={i} className="text-xs text-blue-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      {achado}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}