import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const riscoColors = {
  4: '#dc2626', // red-600
  3: '#f97316', // orange-500
  2: '#f59e0b', // amber-500
  1: '#3b82f6', // blue-500
  0: '#22c55e'  // green-500
};

const riscoLabels = {
  4: 'Grave',
  3: 'Alto',
  2: 'Moderado',
  1: 'Baixo',
  0: 'Sem interação'
};

export default function InteracoesVisualMap({ medicamentos, interacoes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || medicamentos.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Calcular posições dos medicamentos em círculo
    const positions = medicamentos.map((med, i) => {
      const angle = (i / medicamentos.length) * 2 * Math.PI - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        name: med
      };
    });

    // Desenhar conexões (interações)
    interacoes.forEach(int => {
      const pos1 = positions.find(p => p.name === int.med1);
      const pos2 = positions.find(p => p.name === int.med2);
      
      if (pos1 && pos2 && int.risco > 0) {
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.strokeStyle = riscoColors[int.risco];
        ctx.lineWidth = int.risco >= 3 ? 3 : int.risco >= 2 ? 2 : 1;
        ctx.stroke();

        // Label no meio da linha
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        
        ctx.fillStyle = riscoColors[int.risco];
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(riscoLabels[int.risco], midX, midY - 5);
      }
    });

    // Desenhar nós (medicamentos)
    positions.forEach((pos, i) => {
      // Círculo do nó
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto do medicamento
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Quebrar texto se necessário
      const words = pos.name.split(' ');
      if (pos.name.length > 10) {
        ctx.fillText(pos.name.substring(0, 8) + '...', pos.x, pos.y);
      } else {
        ctx.fillText(pos.name, pos.x, pos.y);
      }
    });

  }, [medicamentos, interacoes]);

  // Matriz de interações
  const getInteracao = (med1, med2) => {
    return interacoes.find(
      i => (i.med1 === med1 && i.med2 === med2) || (i.med1 === med2 && i.med2 === med1)
    );
  };

  return (
    <div className="space-y-4">
      {/* Canvas do Mapa */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-3">Mapa Visual de Interações</h4>
          <div className="flex justify-center">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400}
              className="border border-slate-100 rounded-lg bg-slate-50"
            />
          </div>
          <div className="flex justify-center gap-3 mt-3">
            {[4, 3, 2, 1].map(risco => (
              <div key={risco} className="flex items-center gap-1">
                <span 
                  className="w-3 h-1 rounded"
                  style={{ backgroundColor: riscoColors[risco] }}
                />
                <span className="text-[9px] text-slate-600">{riscoLabels[risco]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Interações */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-3">Matriz de Interações</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr>
                  <th className="p-1 border border-slate-200 bg-slate-50"></th>
                  {medicamentos.map(med => (
                    <th key={med} className="p-1 border border-slate-200 bg-slate-50 font-medium text-slate-700">
                      {med.substring(0, 8)}{med.length > 8 ? '...' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medicamentos.map((med1, i) => (
                  <tr key={med1}>
                    <td className="p-1 border border-slate-200 bg-slate-50 font-medium text-slate-700">
                      {med1.substring(0, 8)}{med1.length > 8 ? '...' : ''}
                    </td>
                    {medicamentos.map((med2, j) => {
                      if (i === j) {
                        return <td key={med2} className="p-1 border border-slate-200 bg-slate-100">-</td>;
                      }
                      const int = getInteracao(med1, med2);
                      const risco = int?.risco ?? 0;
                      return (
                        <td 
                          key={med2} 
                          className="p-1 border border-slate-200 text-center"
                          style={{ backgroundColor: `${riscoColors[risco]}20` }}
                        >
                          <span 
                            className="inline-block w-4 h-4 rounded-full text-white text-[8px] leading-4"
                            style={{ backgroundColor: riscoColors[risco] }}
                          >
                            {risco}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="bg-slate-50 border border-slate-200">
        <CardContent className="p-3">
          <h4 className="text-[10px] font-semibold text-slate-600 mb-2">Legenda de Risco</h4>
          <div className="grid grid-cols-5 gap-2">
            {[4, 3, 2, 1, 0].map(risco => (
              <div 
                key={risco} 
                className="p-2 rounded text-center"
                style={{ backgroundColor: `${riscoColors[risco]}20` }}
              >
                <span 
                  className="inline-block w-5 h-5 rounded-full text-white text-[10px] leading-5 font-bold"
                  style={{ backgroundColor: riscoColors[risco] }}
                >
                  {risco}
                </span>
                <p className="text-[9px] mt-1" style={{ color: riscoColors[risco] }}>
                  {riscoLabels[risco]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}