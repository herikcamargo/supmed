import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Download,
  FileText,
  Globe,
  Flag,
  Loader2
} from 'lucide-react';

// Fontes de guidelines configuradas
const fontesNacionais = [
  { id: 'MS', nome: 'Ministério da Saúde', url: 'https://www.gov.br/saude', frequencia: 'semanal' },
  { id: 'ANVISA', nome: 'ANVISA', url: 'https://www.gov.br/anvisa', frequencia: 'semanal' },
  { id: 'SBP', nome: 'Sociedade Brasileira de Pediatria', url: 'https://www.sbp.com.br', frequencia: 'semanal' },
  { id: 'SBC', nome: 'Sociedade Brasileira de Cardiologia', url: 'https://www.cardiol.br', frequencia: 'semanal' },
  { id: 'SBIM', nome: 'Sociedade Brasileira de Imunizações', url: 'https://sbim.org.br', frequencia: 'mensal' },
  { id: 'FEBRASGO', nome: 'FEBRASGO', url: 'https://www.febrasgo.org.br', frequencia: 'semanal' },
  { id: 'AMB', nome: 'AMB - Diretrizes Brasileiras', url: 'https://amb.org.br', frequencia: 'mensal' },
  { id: 'PCDT', nome: 'PCDT - Protocolos Clínicos', url: 'https://www.gov.br/conitec', frequencia: 'semanal' }
];

const fontesInternacionais = [
  { id: 'WHO', nome: 'World Health Organization', url: 'https://www.who.int', frequencia: 'semanal' },
  { id: 'CDC', nome: 'CDC', url: 'https://www.cdc.gov', frequencia: 'diaria' },
  { id: 'NICE', nome: 'NICE Guidelines', url: 'https://www.nice.org.uk', frequencia: 'semanal' },
  { id: 'AHA', nome: 'AHA / ACLS', url: 'https://www.heart.org', frequencia: 'semanal' },
  { id: 'ATLS', nome: 'ATLS', url: 'https://www.facs.org/atls', frequencia: 'mensal' },
  { id: 'ESC', nome: 'ESC Clinical Practice', url: 'https://www.escardio.org', frequencia: 'semanal' },
  { id: 'EASL', nome: 'EASL', url: 'https://easl.eu', frequencia: 'mensal' },
  { id: 'ADA', nome: 'ADA - Diabetes', url: 'https://diabetes.org', frequencia: 'semanal' },
  { id: 'IDSA', nome: 'IDSA', url: 'https://www.idsociety.org', frequencia: 'semanal' }
];

export default function GuidelinesPipeline({ onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState(null);
  const [results, setResults] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const last = localStorage.getItem('supmed_guidelines_last_sync');
    if (last) setLastSync(new Date(last));
  }, []);

  const runPipeline = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    
    const allSources = [...fontesNacionais, ...fontesInternacionais];
    const newResults = [];
    
    for (let i = 0; i < allSources.length; i++) {
      const source = allSources[i];
      setCurrentSource(source);
      setProgress(((i + 1) / allSources.length) * 100);
      
      // Simular verificação de fonte
      await new Promise(r => setTimeout(r, 500));
      
      // Resultado simulado
      const hasUpdate = Math.random() > 0.7;
      newResults.push({
        fonte: source.id,
        nome: source.nome,
        status: hasUpdate ? 'atualizado' : 'sem_alteracao',
        guidelines: hasUpdate ? Math.floor(Math.random() * 3) + 1 : 0
      });
      
      setResults([...newResults]);
    }
    
    localStorage.setItem('supmed_guidelines_last_sync', new Date().toISOString());
    setLastSync(new Date());
    setIsRunning(false);
    setCurrentSource(null);
  };

  const totalUpdates = results.filter(r => r.status === 'atualizado').reduce((acc, r) => acc + r.guidelines, 0);

  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Pipeline de Atualização</h3>
            <p className="text-[10px] text-slate-500">
              {lastSync ? `Última sincronização: ${lastSync.toLocaleString('pt-BR')}` : 'Nunca sincronizado'}
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={runPipeline}
            disabled={isRunning}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Executando</>
            ) : (
              <><RefreshCw className="w-3 h-3 mr-1" /> Executar Pipeline</>
            )}
          </Button>
        </div>

        {isRunning && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600">
                {currentSource ? `Verificando: ${currentSource.nome}` : 'Iniciando...'}
              </span>
              <span className="text-[10px] text-slate-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Fontes Nacionais */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-slate-600 uppercase flex items-center gap-1 mb-2">
            <Flag className="w-3 h-3 text-green-500" /> Fontes Nacionais
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {fontesNacionais.map((fonte) => {
              const result = results.find(r => r.fonte === fonte.id);
              return (
                <div 
                  key={fonte.id} 
                  className={`p-2 rounded text-[10px] ${
                    result?.status === 'atualizado' ? 'bg-green-50 border border-green-200' :
                    result?.status === 'sem_alteracao' ? 'bg-slate-50 border border-slate-200' :
                    'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{fonte.id}</span>
                    {result && (
                      result.status === 'atualizado' ? (
                        <Badge className="text-[8px] bg-green-500 h-4">{result.guidelines}</Badge>
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fontes Internacionais */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-slate-600 uppercase flex items-center gap-1 mb-2">
            <Globe className="w-3 h-3 text-blue-500" /> Fontes Internacionais
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {fontesInternacionais.map((fonte) => {
              const result = results.find(r => r.fonte === fonte.id);
              return (
                <div 
                  key={fonte.id} 
                  className={`p-2 rounded text-[10px] ${
                    result?.status === 'atualizado' ? 'bg-blue-50 border border-blue-200' :
                    result?.status === 'sem_alteracao' ? 'bg-slate-50 border border-slate-200' :
                    'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{fonte.id}</span>
                    {result && (
                      result.status === 'atualizado' ? (
                        <Badge className="text-[8px] bg-blue-500 h-4">{result.guidelines}</Badge>
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo */}
        {results.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {totalUpdates > 0 ? (
                  <><FileText className="w-3 h-3 inline mr-1" /> {totalUpdates} guidelines atualizados</>
                ) : (
                  <><CheckCircle2 className="w-3 h-3 inline mr-1 text-green-500" /> Tudo atualizado</>
                )}
              </span>
              {totalUpdates > 0 && (
                <Badge className="text-[9px] bg-amber-500">Pendente validação</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}