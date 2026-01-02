import React from 'react';
import { AlertCircle } from 'lucide-react';

const placeholderSVGs = {
  RX: () => (
    <svg viewBox="0 0 200 240" className="w-full h-full">
      <defs>
        <linearGradient id="rxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#334155', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="240" fill="url(#rxGrad)" opacity="0.1"/>
      
      {/* Silhueta Torácica */}
      <ellipse cx="100" cy="120" rx="60" ry="90" fill="none" stroke="#64748b" strokeWidth="2" opacity="0.3"/>
      <ellipse cx="100" cy="120" rx="50" ry="75" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.2"/>
      
      {/* Costelas */}
      <path d="M 60 80 Q 80 90, 100 80" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
      <path d="M 60 100 Q 80 110, 100 100" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
      <path d="M 60 120 Q 80 130, 100 120" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
      <path d="M 140 80 Q 120 90, 100 80" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
      <path d="M 140 100 Q 120 110, 100 100" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
      <path d="M 140 120 Q 120 130, 100 120" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
      
      {/* Coluna */}
      <line x1="100" y1="50" x2="100" y2="180" stroke="#94a3b8" strokeWidth="2" opacity="0.2"/>
      
      <text x="100" y="220" textAnchor="middle" fill="#94a3b8" fontSize="10" opacity="0.5">ILUSTRATIVO</text>
    </svg>
  ),
  
  TC: () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="tcGrad">
          <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: '#334155', stopOpacity: 0.3 }} />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#tcGrad)"/>
      
      {/* Círculos concêntricos */}
      <circle cx="100" cy="100" r="80" fill="none" stroke="#64748b" strokeWidth="2" opacity="0.3"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.25"/>
      <circle cx="100" cy="100" r="40" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.2"/>
      <circle cx="100" cy="100" r="20" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.15"/>
      
      {/* Cruz central */}
      <line x1="100" y1="85" x2="100" y2="115" stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>
      <line x1="85" y1="100" x2="115" y2="100" stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>
      
      <text x="100" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10" opacity="0.5">CORTE AXIAL ILUSTRATIVO</text>
    </svg>
  ),
  
  RM: () => (
    <svg viewBox="0 0 200 240" className="w-full h-full">
      <defs>
        <linearGradient id="rmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="240" fill="url(#rmGrad)"/>
      
      {/* Corte sagital estilizado */}
      <ellipse cx="100" cy="80" rx="40" ry="50" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.3"/>
      <path d="M 80 130 Q 100 110, 120 130" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.25"/>
      <path d="M 85 150 Q 100 140, 115 150" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.2"/>
      
      {/* Linhas de contraste */}
      <line x1="60" y1="70" x2="140" y2="70" stroke="#93c5fd" strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2"/>
      <line x1="60" y1="90" x2="140" y2="90" stroke="#93c5fd" strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2"/>
      <line x1="60" y1="110" x2="140" y2="110" stroke="#93c5fd" strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2"/>
      
      <text x="100" y="220" textAnchor="middle" fill="#60a5fa" fontSize="10" opacity="0.5">RM ILUSTRATIVA</text>
    </svg>
  ),
  
  USG: () => (
    <svg viewBox="0 0 200 180" className="w-full h-full">
      <defs>
        <radialGradient id="usgGrad">
          <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#1e293b', stopOpacity: 0.9 }} />
        </radialGradient>
      </defs>
      <rect width="200" height="180" fill="url(#usgGrad)"/>
      
      {/* Setor ultrassônico */}
      <path d="M 100 20 L 40 160 Q 100 150, 160 160 Z" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.3"/>
      
      {/* Ondas sonoras */}
      <path d="M 100 30 Q 80 80, 70 130" stroke="#94a3b8" strokeWidth="0.5" fill="none" opacity="0.2"/>
      <path d="M 100 30 Q 100 80, 100 130" stroke="#94a3b8" strokeWidth="0.5" fill="none" opacity="0.25"/>
      <path d="M 100 30 Q 120 80, 130 130" stroke="#94a3b8" strokeWidth="0.5" fill="none" opacity="0.2"/>
      
      {/* Estruturas genéricas */}
      <ellipse cx="100" cy="90" rx="30" ry="20" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.2"/>
      <ellipse cx="85" cy="110" rx="15" ry="10" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.15"/>
      
      <text x="100" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10" opacity="0.5">USG ILUSTRATIVO</text>
    </svg>
  ),
  
  ECG: () => (
    <svg viewBox="0 0 300 150" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <pattern id="ecgGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#fca5a5" strokeWidth="0.5" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="300" height="150" fill="#fef2f2"/>
      <rect width="300" height="150" fill="url(#ecgGrid)"/>
      
      {/* Traçado ECG estilizado */}
      <path d="M 0 75 L 20 75 L 25 20 L 30 75 L 35 85 L 45 65 L 50 75 L 70 75 L 75 20 L 80 75 L 85 85 L 95 65 L 100 75 L 120 75 L 125 20 L 130 75 L 135 85 L 145 65 L 150 75 L 170 75 L 175 20 L 180 75 L 185 85 L 195 65 L 200 75 L 220 75 L 225 20 L 230 75 L 235 85 L 245 65 L 250 75 L 270 75 L 275 20 L 280 75 L 285 85 L 295 65 L 300 75" 
        stroke="#dc2626" 
        strokeWidth="1.5" 
        fill="none"/>
      
      <text x="10" y="140" fill="#dc2626" fontSize="10" opacity="0.5">TRAÇADO ILUSTRATIVO - NÃO DIAGNÓSTICO</text>
    </svg>
  )
};

export default function ImagePlaceholder({ tipo = 'RX', titulo, descricao, className = '' }) {
  const SVGComponent = placeholderSVGs[tipo];
  
  return (
    <div className={`relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300 overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {SVGComponent && <SVGComponent />}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-3 h-3 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            {titulo && <p className="text-xs font-medium text-white">{titulo}</p>}
            <p className="text-[10px] text-amber-200">
              {descricao || 'Imagem ilustrativa – Conteúdo educacional'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}