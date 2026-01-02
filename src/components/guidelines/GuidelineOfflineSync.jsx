import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  RefreshCw,
  HardDrive,
  FileText,
  Loader2
} from 'lucide-react';

const OFFLINE_GUIDELINES_KEY = 'supmed_offline_guidelines';
const OFFLINE_VERSION_KEY = 'supmed_guidelines_version';

export default function GuidelineOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [offlineData, setOfflineData] = useState(null);
  const [serverVersion, setServerVersion] = useState('2.5');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadOfflineData();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    const stored = localStorage.getItem(OFFLINE_GUIDELINES_KEY);
    const version = localStorage.getItem(OFFLINE_VERSION_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      setOfflineData({
        ...data,
        version: version || '1.0',
        size: (new Blob([stored]).size / 1024).toFixed(1)
      });
    }
  };

  const syncGuidelines = async () => {
    setIsSyncing(true);
    setProgress(0);

    // Simular download de pacote de atualização
    const pacoteAtualizacao = {
      version: serverVersion,
      timestamp: new Date().toISOString(),
      guidelines: {
        emergencia: { count: 15, lastUpdate: new Date().toISOString() },
        cardiologia: { count: 12, lastUpdate: new Date().toISOString() },
        pediatria: { count: 10, lastUpdate: new Date().toISOString() },
        pneumologia: { count: 8, lastUpdate: new Date().toISOString() },
        neurologia: { count: 7, lastUpdate: new Date().toISOString() },
        infectologia: { count: 11, lastUpdate: new Date().toISOString() }
      },
      totalGuidelines: 63,
      changesFromPrevious: 5
    };

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
    }

    localStorage.setItem(OFFLINE_GUIDELINES_KEY, JSON.stringify(pacoteAtualizacao));
    localStorage.setItem(OFFLINE_VERSION_KEY, serverVersion);
    
    setOfflineData({
      ...pacoteAtualizacao,
      size: (new Blob([JSON.stringify(pacoteAtualizacao)]).size / 1024).toFixed(1)
    });
    
    setIsSyncing(false);
  };

  const needsUpdate = offlineData?.version !== serverVersion;

  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Sincronização Offline</h3>
              <p className="text-[10px] text-slate-500">
                {isOnline ? 'Conectado' : 'Modo offline ativo'}
              </p>
            </div>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'} className="text-[9px]">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Status atual */}
        {offlineData ? (
          <div className="p-3 bg-slate-50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">Dados Offline</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">v{offlineData.version}</Badge>
                {needsUpdate && (
                  <Badge className="text-[9px] bg-amber-500">Atualização disponível</Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded border border-slate-100">
                <FileText className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">{offlineData.totalGuidelines}</p>
                <p className="text-[9px] text-slate-500">Guidelines</p>
              </div>
              <div className="p-2 bg-white rounded border border-slate-100">
                <HardDrive className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">{offlineData.size} KB</p>
                <p className="text-[9px] text-slate-500">Tamanho</p>
              </div>
              <div className="p-2 bg-white rounded border border-slate-100">
                <RefreshCw className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">{offlineData.changesFromPrevious || 0}</p>
                <p className="text-[9px] text-slate-500">Alterações</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2">
              Última sincronização: {new Date(offlineData.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4 text-center">
            <Download className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-amber-700">Nenhum dado offline disponível</p>
            <p className="text-[10px] text-amber-600">Sincronize para usar offline</p>
          </div>
        )}

        {/* Progress */}
        {isSyncing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600">Baixando pacote de atualização...</span>
              <span className="text-[10px] text-slate-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Categorias disponíveis offline */}
        {offlineData?.guidelines && (
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold text-slate-600 uppercase mb-2">Categorias Disponíveis</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(offlineData.guidelines).map(([cat, info]) => (
                <Badge key={cat} variant="outline" className="text-[9px]">
                  {cat} ({info.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botão de sincronização */}
        <Button 
          onClick={syncGuidelines}
          disabled={isSyncing || !isOnline}
          className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
        >
          {isSyncing ? (
            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sincronizando...</>
          ) : (
            <><Download className="w-3 h-3 mr-1" /> {offlineData ? 'Atualizar Dados' : 'Baixar para Offline'}</>
          )}
        </Button>

        {!isOnline && offlineData && (
          <p className="text-[9px] text-center text-green-600 mt-2">
            <CheckCircle2 className="w-3 h-3 inline mr-0.5" />
            Você pode usar os guidelines offline
          </p>
        )}
      </CardContent>
    </Card>
  );
}