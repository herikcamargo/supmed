import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, Search, Shield, Info, Loader2 } from 'lucide-react';
import IllustrativePathologyCard from '../medical/IllustrativePathologyCard';
import useOptimizedSearch from '../search/useOptimizedSearch';

// Base de dados de padrões ECG com traçados ilustrativos
const padroesECG = [
  {
    titulo: 'Ritmo Sinusal Normal',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'low',
    descricao: 'Padrão eletrocardiográfico normal com ondas P, QRS e T regulares.',
    achados: ['Onda P positiva em DII', 'Intervalo PR 120-200ms', 'QRS < 120ms', 'FC 60-100bpm'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 60 100 L 65 90 L 70 100 L 75 80 L 80 120 L 85 100 L 90 95 L 140 95 L 145 85 L 150 95 L 155 75 L 160 115 L 165 95 L 170 90 L 220 90" stroke="%2310b981" stroke-width="2" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3ERitmo Sinusal%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Fibrilação Atrial',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'high',
    descricao: 'Ausência de ondas P com ritmo irregular e resposta ventricular variável.',
    achados: ['Ausência de ondas P', 'Linha de base irregular', 'RR irregular', 'QRS estreito'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 Q 30 95 40 100 Q 50 105 60 100 L 65 80 L 70 120 L 75 100 Q 90 95 100 100 L 110 75 L 115 115 L 120 100 Q 140 98 150 100 L 155 85 L 160 115 L 165 100" stroke="%23f59e0b" stroke-width="2" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3EFibrilação Atrial%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Taquicardia Ventricular',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'critical',
    descricao: 'Taquicardia com QRS alargado (>120ms) e FC > 100bpm de origem ventricular.',
    achados: ['QRS alargado > 120ms', 'FC 100-250bpm', 'Dissociação AV', 'Morfologia bizarra'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 30 60 L 40 140 L 50 100 L 60 60 L 70 140 L 80 100 L 90 60 L 100 140 L 110 100 L 120 60 L 130 140 L 140 100 L 150 60 L 160 140 L 170 100" stroke="%23ef4444" stroke-width="3" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3ETaquicardia Ventricular%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Bloqueio AV Total',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'critical',
    descricao: 'Dissociação completa entre atividade atrial e ventricular.',
    achados: ['Ondas P e QRS independentes', 'FC atrial > FC ventricular', 'PR variável', 'Escape juncional/ventricular'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 90 L 25 85 L 30 90 L 60 90 L 65 85 L 70 90 L 100 90 L 105 85 L 110 90" stroke="%236366f1" stroke-width="1.5" fill="none"/%3E%3Cpath d="M 40 100 L 45 70 L 50 130 L 55 100 L 120 100 L 125 70 L 130 130 L 135 100" stroke="%23ef4444" stroke-width="2.5" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3EBloqueio AV Total%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Bradicardia Sinusal',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'medium',
    descricao: 'Ritmo sinusal com frequência < 60bpm.',
    achados: ['Onda P normal', 'FC < 60bpm', 'PR normal', 'QRS normal'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 80 100 L 85 90 L 90 100 L 95 75 L 100 125 L 105 100 L 110 95 L 180 95 L 185 85 L 190 95 L 195 70 L 200 120 L 205 95" stroke="%2310b981" stroke-width="2" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3EBradicardia%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Bloqueio de Ramo Esquerdo',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'medium',
    descricao: 'QRS alargado com padrão rS em V1 e R empastada em V6.',
    achados: ['QRS > 120ms', 'rS em V1', 'R empastada em V5-V6', 'Ausência de Q septal'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 60 100 L 63 95 L 66 100 L 70 60 L 78 100 L 82 60 L 90 140 L 98 100 L 150 100" stroke="%23f59e0b" stroke-width="2.5" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3EBRE%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'IAM com Supra de ST',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'critical',
    descricao: 'Elevação do segmento ST em derivações contíguas sugestivo de IAM agudo.',
    achados: ['Supradesnivelamento ST', 'Onda Q patológica', 'Inversão de T', 'Derivações contíguas'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 60 100 L 65 90 L 70 100 L 75 75 L 80 125 L 85 70 L 95 70 L 105 95 L 150 95" stroke="%23ef4444" stroke-width="2.5" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3EIAM c/ Supra ST%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Taquicardia Supraventricular',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'high',
    descricao: 'Taquicardia regular com QRS estreito e FC > 150bpm.',
    achados: ['QRS estreito < 120ms', 'FC 150-250bpm', 'Ritmo regular', 'Onda P oculta/retrograde'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 28 90 L 32 100 L 36 75 L 40 125 L 44 100 L 52 90 L 56 100 L 60 75 L 64 125 L 68 100 L 76 90 L 80 100 L 84 75 L 88 125 L 92 100 L 100 90 L 104 100 L 108 75 L 112 125 L 116 100" stroke="%23f59e0b" stroke-width="2" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3ETPSV%3C/text%3E%3C/svg%3E'
  },
  {
    titulo: 'Bloqueio de Ramo Direito',
    modalidade: 'ECG',
    tipo: 'ecg',
    severity: 'low',
    descricao: 'QRS alargado com padrão rSR\' em V1 (orelha de coelho).',
    achados: ['QRS > 120ms', 'rSR\' em V1-V2', 'Onda S alargada em I e V6', 'Padrão M em V1'],
    image_placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Crect fill="%23f8fafc" width="400" height="200"/%3E%3Cpath d="M 20 100 L 60 100 L 63 95 L 66 100 L 70 75 L 75 100 L 78 75 L 82 125 L 86 100 L 150 100" stroke="%2310b981" stroke-width="2" fill="none"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="12" fill="%23475569" text-anchor="middle"%3EBRD%3C/text%3E%3C/svg%3E'
  }
];

export default function PlantonistaECG() {
  const { 
    searchTerm, 
    setSearchTerm, 
    results: filtered,
    isSearching 
  } = useOptimizedSearch(padroesECG, ['titulo', 'achados'], { debounceMs: 150 });

  return (
    <div className="space-y-4">
      {/* Banner Educacional */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>Traçados educacionais.</strong> Representações ilustrativas para reconhecimento de padrões. Não utilizar para diagnóstico real.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            Atlas Ilustrativo de ECG
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar padrão de ECG..."
              className="pl-9 pr-9 h-9 text-sm bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />
            )}
          </div>

          {/* Grid de Padrões */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((padrao, i) => (
                <IllustrativePathologyCard key={i} {...padrao} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Nenhum padrão encontrado</p>
            </div>
          )}

          {/* Info Rodapé */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Clique em qualquer card para ver achados típicos. Para análise de ECG real, sempre correlacione com quadro clínico e exame físico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}