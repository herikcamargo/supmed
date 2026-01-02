import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Trash2, 
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Módulos disponíveis para cache offline
const offlineModules = [
  { id: 'scores', nome: 'Scores e Calculadoras', size: '2.1 MB', priority: 'alta', essential: true },
  { id: 'protocolos', nome: 'Protocolos de Emergência', size: '1.8 MB', priority: 'alta', essential: true },
  { id: 'medicamentos', nome: 'Bulário e Diluições', size: '4.2 MB', priority: 'media', essential: false },
  { id: 'guidelines', nome: 'Guidelines (resumos)', size: '3.5 MB', priority: 'media', essential: false },
  { id: 'pediatria', nome: 'Doses Pediátricas', size: '1.2 MB', priority: 'alta', essential: true },
  { id: 'ceatox', nome: 'Antídotos CEATOX', size: '0.8 MB', priority: 'alta', essential: true },
  { id: 'ecg', nome: 'Atlas ECG', size: '8.5 MB', priority: 'baixa', essential: false },
  { id: 'imagens', nome: 'Referências de Imagem', size: '12.3 MB', priority: 'baixa', essential: false }
];

// Cache inteligente por nível de atenção
const cacheByAttention = {
  primaria: ['scores', 'medicamentos', 'guidelines'],
  secundaria: ['scores', 'protocolos', 'medicamentos', 'pediatria'],
  terciaria: ['scores', 'protocolos', 'ceatox', 'pediatria', 'ecg'],
  academico: ['scores', 'protocolos', 'medicamentos', 'guidelines', 'pediatria', 'ceatox']
};

export default function OfflineManager({ isOpen, onClose }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedModules, setCachedModules] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [progress, setProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Listener de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Carregar estado do cache
    loadCacheState();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheState = () => {
    const cached = JSON.parse(localStorage.getItem('supmed_offline_modules') || '[]');
    const lastSyncTime = localStorage.getItem('supmed_last_sync');
    const storage = JSON.parse(localStorage.getItem('supmed_storage_used') || '0');
    
    setCachedModules(cached);
    setLastSync(lastSyncTime ? new Date(lastSyncTime) : null);
    setStorageUsed(storage);
  };

  const downloadModule = async (moduleId) => {
    setDownloading(moduleId);
    setProgress(0);

    // Simular download progressivo
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setProgress(i);
    }

    const newCached = [...cachedModules, moduleId];
    setCachedModules(newCached);
    localStorage.setItem('supmed_offline_modules', JSON.stringify(newCached));
    
    const module = offlineModules.find(m => m.id === moduleId);
    const newStorage = storageUsed + parseFloat(module.size);
    setStorageUsed(newStorage);
    localStorage.setItem('supmed_storage_used', JSON.stringify(newStorage));
    
    setDownloading(null);
    setProgress(0);
  };

  const removeModule = (moduleId) => {
    const newCached = cachedModules.filter(id => id !== moduleId);
    setCachedModules(newCached);
    localStorage.setItem('supmed_offline_modules', JSON.stringify(newCached));
    
    const module = offlineModules.find(m => m.id === moduleId);
    const newStorage = Math.max(0, storageUsed - parseFloat(module.size));
    setStorageUsed(newStorage);
    localStorage.setItem('supmed_storage_used', JSON.stringify(newStorage));
  };

  const syncByAttention = async () => {
    const attention = localStorage.getItem('supmed_attention') || 'primaria';
    const modulesToSync = cacheByAttention[attention];
    
    for (const moduleId of modulesToSync) {
      if (!cachedModules.includes(moduleId)) {
        await downloadModule(moduleId);
      }
    }
    
    localStorage.setItem('supmed_last_sync', new Date().toISOString());
    setLastSync(new Date());
  };

  const clearAllCache = () => {
    setCachedModules([]);
    setStorageUsed(0);
    localStorage.setItem('supmed_offline_modules', '[]');
    localStorage.setItem('supmed_storage_used', '0');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <h2 className="text-sm font-semibold">Modo Offline</h2>
              <Badge variant={isOnline ? 'default' : 'destructive'} className="text-[9px]">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          {/* Storage Info */}
          <div className="p-3 bg-slate-50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> Armazenamento usado
              </span>
              <span className="text-xs font-medium">{storageUsed.toFixed(1)} MB</span>
            </div>
            <Progress value={Math.min((storageUsed / 50) * 100, 100)} className="h-1.5" />
            <p className="text-[10px] text-slate-400 mt-1">Limite recomendado: 50 MB</p>
          </div>

          {/* Auto Sync */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
            <div>
              <p className="text-xs font-medium text-blue-800">Sincronização Inteligente</p>
              <p className="text-[10px] text-blue-600">Baseado no seu nível de atenção</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={syncByAttention}>
                <RefreshCw className="w-3 h-3 mr-1" /> Sincronizar
              </Button>
            </div>
          </div>

          {lastSync && (
            <p className="text-[10px] text-slate-400 mb-3">
              Última sincronização: {lastSync.toLocaleString('pt-BR')}
            </p>
          )}

          {/* Modules List */}
          <h3 className="text-xs font-semibold text-slate-700 mb-2">Módulos Disponíveis</h3>
          <div className="space-y-2">
            {offlineModules.map((module) => {
              const isCached = cachedModules.includes(module.id);
              const isDownloading = downloading === module.id;
              
              return (
                <div key={module.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <div className="flex items-center gap-2">
                    {isCached ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : module.essential ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Download className="w-4 h-4 text-slate-300" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-700">{module.nome}</p>
                      <p className="text-[10px] text-slate-400">{module.size}</p>
                    </div>
                  </div>
                  
                  {isDownloading ? (
                    <div className="w-20">
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  ) : isCached ? (
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-500" onClick={() => removeModule(module.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => downloadModule(module.id)}>
                      <Download className="w-3 h-3 mr-1" /> Baixar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clear Cache */}
          <Button 
            variant="outline" 
            className="w-full mt-4 text-xs h-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={clearAllCache}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Limpar Todo Cache
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}